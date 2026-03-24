# django-api/scada_api/services/influx_service.py
from influxdb_client import InfluxDBClient
from django.conf import settings
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class InfluxService:
    """Servicio para interactuar con InfluxDB de forma centralizada"""
    
    def __init__(self):
        self.url = os.getenv('INFLUX_URL', 'http://influxdb:8086')
        self.token = os.getenv('INFLUX_TOKEN')
        self.org = os.getenv('INFLUX_ORG', 'acme')
        self.bucket = os.getenv('INFLUX_BUCKET', 'deployment')
        
        if not self.token:
            raise ValueError("INFLUX_TOKEN no está configurado")
        
        self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
        self.query_api = self.client.query_api()
    
    def get_tag_history(
        self, 
        equipment_id: str, 
        variable: str,
        start: str = '-12h',
        stop: str = 'now',
        window: str = '30s',
        aggregation: str = 'mean'
    ) -> List[Dict[str, Any]]:
        """
        Obtener historial de un tag específico
        
        Args:
            equipment_id: ID del equipo
            variable: Nombre de la variable
            start: Tiempo inicio (ej: '-12h', '-1d', '2024-01-01T00:00:00Z')
            stop: Tiempo fin (default: 'now')
            window: Ventana de agregación (ej: '30s', '1m', '5m')
            aggregation: Función de agregación ('mean', 'max', 'min', 'last')
        """
        query = f'''
            from(bucket: "{self.bucket}")
              |> range(start: {start}, stop: {stop})
              |> filter(fn: (r) => r._measurement == "plc_tags")
              |> filter(fn: (r) => r.equipment_id == "{equipment_id}")
              |> filter(fn: (r) => r.variable == "{variable}")
              |> aggregateWindow(every: {window}, fn: {aggregation}, createEmpty: false)
              |> yield(name: "{aggregation}")
        '''
        
        result = self.query_api.query(query=query)
        
        data = []
        for table in result:
            for record in table.records:
                data.append({
                    'time': record.get_time().isoformat(),
                    'value': record.get_value(),
                    'equipment_id': record.values.get('equipment_id'),
                    'variable': record.values.get('variable'),
                })
        
        return data
    
    def get_multiple_tags_history(
        self,
        tags: List[Dict[str, str]],  # [{'equipment_id': '...', 'variable': '...'}]
        start: str = '-12h',
        window: str = '30s'
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Obtener historial de múltiples tags en una sola consulta
        Más eficiente que hacer queries individuales
        """
        # Construir filtros dinámicamente
        filters = []
        for tag in tags:
            filters.append(
                f'(r.equipment_id == "{tag["equipment_id"]}" and r.variable == "{tag["variable"]}")'
            )
        
        filter_clause = ' or '.join(filters)
        
        query = f'''
            from(bucket: "{self.bucket}")
              |> range(start: {start})
              |> filter(fn: (r) => r._measurement == "plc_tags")
              |> filter(fn: (r) => {filter_clause})
              |> aggregateWindow(every: {window}, fn: mean, createEmpty: false)
        '''
        
        result = self.query_api.query(query=query)
        
        # Organizar datos por tag
        data_by_tag = {}
        for table in result:
            for record in table.records:
                eq_id = record.values.get('equipment_id')
                var = record.values.get('variable')
                key = f"{eq_id}|{var}"
                
                if key not in data_by_tag:
                    data_by_tag[key] = []
                
                data_by_tag[key].append({
                    'time': record.get_time().isoformat(),
                    'value': record.get_value(),
                })
        
        return data_by_tag
    
    def get_current_values(self, equipment_id: str) -> Dict[str, Any]:
        """Obtener los últimos valores de todos los tags de un equipo"""
        query = f'''
            from(bucket: "{self.bucket}")
              |> range(start: -5m)
              |> filter(fn: (r) => r._measurement == "plc_tags")
              |> filter(fn: (r) => r.equipment_id == "{equipment_id}")
              |> last()
        '''
        
        result = self.query_api.query(query=query)
        
        tags = {}
        for table in result:
            for record in table.records:
                variable = record.values.get('variable')
                tags[variable] = {
                    'value': record.get_value(),
                    'time': record.get_time().isoformat(),
                    'unit': record.values.get('unit', '-'),
                    'datatype': record.values.get('datatype', 'Unknown'),
                    'quality': record.values.get('quality', 'Unknown'),
                }
        
        return tags
    
    def get_equipment_list(self) -> List[str]:
        """Listar todos los equipos disponibles en la última hora"""
        query = f'''
            from(bucket: "{self.bucket}")
              |> range(start: -1h)
              |> filter(fn: (r) => r._measurement == "plc_tags")
              |> keep(columns: ["equipment_id"])
              |> distinct(column: "equipment_id")
        '''
        
        result = self.query_api.query(query=query)
        
        equipment = []
        for table in result:
            for record in table.records:
                eq_id = record.values.get('equipment_id')
                if eq_id:
                    equipment.append(eq_id)
        
        return sorted(list(set(equipment)))
    
    def get_available_variables(self, equipment_id: str) -> List[str]:
        """Obtener todas las variables disponibles para un equipo"""
        query = f'''
            from(bucket: "{self.bucket}")
              |> range(start: -1h)
              |> filter(fn: (r) => r._measurement == "plc_tags")
              |> filter(fn: (r) => r.equipment_id == "{equipment_id}")
              |> keep(columns: ["variable"])
              |> distinct(column: "variable")
        '''
        
        result = self.query_api.query(query=query)
        
        variables = []
        for table in result:
            for record in table.records:
                var = record.values.get('variable')
                if var:
                    variables.append(var)
        
        return sorted(list(set(variables)))
    
    def __del__(self):
        """Cerrar cliente al destruir el objeto"""
        if hasattr(self, 'client'):
            self.client.close()