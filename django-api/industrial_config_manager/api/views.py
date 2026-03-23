# docker-suite\django-api\industrial_config_manager\api\views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

import yaml
import os
from pathlib import Path
import subprocess

from industrial_config_manager.models import (
    Site, Area, WorkCenter, WorkUnit, PLC, Tag
)
from .serializers import (
    SiteSerializer, AreaSerializer,
    WorkCenterSerializer, WorkUnitSerializer,
    PLCSerializer, TagSerializer, TagMinimalSerializer,
    TagCreateSerializer, TagBulkToggleSerializer
)
from industrial_config_manager.services.gateway_builder import build_gateway_yaml


# ========================================
# ISA-95 HIERARCHY VIEWSETS
# ========================================

class SiteViewSet(ModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer


class AreaViewSet(ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer


class WorkCenterViewSet(ModelViewSet):
    queryset = WorkCenter.objects.all()
    serializer_class = WorkCenterSerializer


class WorkUnitViewSet(ModelViewSet):
    queryset = WorkUnit.objects.all()
    serializer_class = WorkUnitSerializer


# ========================================
# PLC VIEWSET (ENDPOINTS JERÁRQUICOS)
# ========================================

PLC_CONFIG_DIR = "/opt/suite/config/plc"


class PLCViewSet(ModelViewSet):
    queryset = PLC.objects.all()
    serializer_class = PLCSerializer

    def perform_create(self, serializer):
        """
        Crea un PLC y genera su archivo YAML de configuración.
        """
        plc = serializer.save()
        connection_data = self.request.data.get('connection_data', {})
        
        equipment_id = plc.equipment_id
        driver_code = plc.driver.as_code()

        # ========================================
        # CONSTRUCCIÓN DINÁMICA DE CONNECTION
        # ========================================
        if driver_code == "opcua":
            connection = {
                "endpoint": connection_data.get("endpoint", ""),
                "namespace_uri": connection_data.get("namespace_uri", ""),
                "security_mode": connection_data.get("security_mode", "None"),
                "security_policy": connection_data.get("security_policy", "None"),
                "timeouts_ms": {
                    "connect": connection_data.get("timeout_connect", 5000),
                    "session": connection_data.get("timeout_session", 10000)
                },
                "reconnect": {
                    "enable": connection_data.get("reconnect_enable", True),
                    "min_delay_ms": connection_data.get("reconnect_min_delay", 1000),
                    "max_delay_ms": connection_data.get("reconnect_max_delay", 10000)
                }
            }
        
            # Campos opcionales de seguridad
            for key in ["certificate", "private_key", "application_uri", "cert_uri", "username", "password"]:
                if connection_data.get(key):
                    connection[key] = connection_data[key]
            
            connection_string = connection["endpoint"]

        elif driver_code in ["s7", "snap7"]:
            connection = {
                "ip": connection_data.get("hostname") or connection_data.get("ip", ""),
                "rack": connection_data.get("rack", 0),
                "slot": connection_data.get("slot", 1),
                "timeout_ms": connection_data.get("timeout_ms", 5000),
                "pdu_size": connection_data.get("pdu_size", 480)
            }
            
            connection_string = f"{connection['ip']}/{connection['rack']}/{connection['slot']}"

        elif driver_code in ["modbus", "modbustcp"]:
            connection = {
                "host": connection_data.get("host", ""),
                "port": connection_data.get("port", 502),
                "unit_id": connection_data.get("unit_id", 1),
                "poll_rate_ms": connection_data.get("poll_rate_ms", 500),
            }
            
            optional_fields = [
                "timeout_ms", "retry_on_empty", "retry_on_invalid", 
                "close_comm_on_error", "strict", "framer"
            ]
            for field in optional_fields:
                if field in connection_data:
                    connection[field] = connection_data[field]
            
            connection_string = f"{connection['host']}:{connection['port']}"

        else:
            # Fallback genérico
            connection = connection_data
            connection_string = str(connection_data)

        # ========================================
        # CONSTRUCCIÓN YAML INDUSTRIAL
        # ========================================
        
        data = {
            "driver": driver_code,
            "equipment_id": equipment_id,
            "connection": connection,
            "isa95": {
                "site": plc.work_unit.work_center.area.site.name,
                "area": plc.work_unit.work_center.area.name,
                "work_center": plc.work_unit.work_center.name,
                "work_unit": plc.work_unit.name
            },
            "items": []  # Se llenarán cuando se creen los tags
        }
        
        # ✅ Añadir configuración de polling si se proporciona (para Snap7)
        if driver_code in ["s7", "snap7"] and connection_data.get("poll_ms"):
            data["poll_ms"] = connection_data["poll_ms"]
        
        # ✅ Añadir configuración de reconnect si se proporciona (para Snap7)
        if driver_code in ["s7", "snap7"]:
            if connection_data.get("reconnect_enable") is not None:
                data["reconnect"] = {
                    "enable": connection_data.get("reconnect_enable", True),
                    "min_delay_ms": connection_data.get("reconnect_min_delay", 1000),
                    "max_delay_ms": connection_data.get("reconnect_max_delay", 60000)
                }
        if driver_code in ["modbus", "modbustcp"]:
            data["modbus_format"] = {
                "byte_order": connection_data.get("byte_order", "big"),
                "word_order": connection_data.get("word_order", "little"),
            }

        # ========================================
        # GUARDAR YAML
        # ========================================
        os.makedirs(PLC_CONFIG_DIR, exist_ok=True)
        config_path = f"{PLC_CONFIG_DIR}/{plc.name}.yaml"
        with open(config_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, sort_keys=False, allow_unicode=True)

        # Actualizar PLC con el path y connection_string
        plc.config_path = config_path
        plc.connection_string = connection_string  # Para referencia/búsqueda
        plc.save()

    def perform_destroy(self, instance):
        """Eliminar PLC y su archivo YAML"""
        if instance.config_path and os.path.exists(instance.config_path):
            try:
                os.remove(instance.config_path)
            except Exception as e:
                print(f"Error deleting YAML: {e}")

        instance.delete()

    def perform_update(self, serializer):
        """
        Actualiza un PLC y regenera su archivo YAML de configuración.
        """
        plc = serializer.save()
        connection_data = plc.connection_data or {}
        
        equipment_id = plc.equipment_id
        driver_code = plc.driver.as_code()

        # ========================================
        # CONSTRUCCIÓN DINÁMICA DE CONNECTION
        # ========================================
        if driver_code == "opcua":
            connection = {
                "endpoint": connection_data.get("endpoint", ""),
                "namespace_uri": connection_data.get("namespace_uri", ""),
                "security_mode": connection_data.get("security_mode", "None"),
                "security_policy": connection_data.get("security_policy", "None"),
                "timeouts_ms": {
                    "connect": connection_data.get("timeout_connect", 5000),
                    "session": connection_data.get("timeout_session", 10000)
                },
                "reconnect": {
                    "enable": connection_data.get("reconnect_enable", True),
                    "min_delay_ms": connection_data.get("reconnect_min_delay", 1000),
                    "max_delay_ms": connection_data.get("reconnect_max_delay", 10000)
                }
            }
        
            for key in ["certificate", "private_key", "application_uri", "cert_uri", "username", "password"]:
                if connection_data.get(key):
                    connection[key] = connection_data[key]
            
            connection_string = connection["endpoint"]

        elif driver_code in ["s7", "snap7"]:
            connection = {
                "ip": connection_data.get("hostname") or connection_data.get("ip", ""),
                "rack": connection_data.get("rack", 0),
                "slot": connection_data.get("slot", 1),
                "timeout_ms": connection_data.get("timeout_ms", 5000),
                "pdu_size": connection_data.get("pdu_size", 480)
            }
            
            connection_string = f"{connection['ip']}/{connection['rack']}/{connection['slot']}"

        elif driver_code in ["modbus", "modbustcp"]:
            connection = {
                "host": connection_data.get("host", ""),
                "port": connection_data.get("port", 502),
                "unit_id": connection_data.get("unit_id", 1),
                "poll_rate_ms": connection_data.get("poll_rate_ms", 500),
            }
            
            optional_fields = [
                "timeout_ms", "retry_on_empty", "retry_on_invalid", 
                "close_comm_on_error", "strict", "framer"
            ]
            for field in optional_fields:
                if field in connection_data:
                    connection[field] = connection_data[field]
                    
            connection_string = f"{connection['host']}:{connection['port']}"

        else:
            connection = connection_data
            connection_string = str(connection_data)

        # ========================================
        # CONSTRUCCIÓN YAML
        # ========================================
        data = {
            "driver": driver_code,
            "equipment_id": equipment_id,
            "connection": connection,
            "isa95": {
                "site": plc.work_unit.work_center.area.site.name,
                "area": plc.work_unit.work_center.area.name,
                "work_center": plc.work_unit.work_center.name,
                "work_unit": plc.work_unit.name
            },
            "items": []
        }
        
        if driver_code in ["s7", "snap7"] and connection_data.get("poll_ms"):
            data["poll_ms"] = connection_data["poll_ms"]
        
        if driver_code in ["s7", "snap7"]:
            if connection_data.get("reconnect_enable") is not None:
                data["reconnect"] = {
                    "enable": connection_data.get("reconnect_enable", True),
                    "min_delay_ms": connection_data.get("reconnect_min_delay", 1000),
                    "max_delay_ms": connection_data.get("reconnect_max_delay", 60000)
                }
        if driver_code in ["modbus", "modbustcp"]:
            data["modbus_format"] = {
                "byte_order": connection_data.get("byte_order", "big"),
                "word_order": connection_data.get("word_order", "little"),
            }

        # ========================================
        # REGENERAR YAML CON TAGS EXISTENTES
        # ========================================
        config_path = Path(plc.config_path)
        
        # Si ya existe, preservar los items (tags)
        if config_path.exists():
            with open(config_path, "r") as f:
                existing_data = yaml.safe_load(f) or {}
                if "items" in existing_data:
                    data["items"] = existing_data["items"]
        
        # Guardar YAML actualizado
        os.makedirs(PLC_CONFIG_DIR, exist_ok=True)
        yaml_path = f"{PLC_CONFIG_DIR}/{plc.name}.yaml"
        
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, sort_keys=False, allow_unicode=True)

        # Actualizar connection_string si cambió
        plc.connection_string = connection_string
        plc.config_path = yaml_path
        plc.save(update_fields=['connection_string', 'config_path'])


    
    @action(detail=True, methods=["patch"])
    def toggle_enabled(self, request, pk=None):
        """Toggle enabled state del PLC"""
        plc = self.get_object()
        new_state = request.data.get("enabled")
        
        if new_state is None:
            return Response(
                {"error": "Field 'enabled' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plc.enabled = new_state
        plc.save()

        return Response(PLCSerializer(plc).data)

    # ========================================
    # HELPER: REBUILD YAML
    # ========================================
    def _rebuild_yaml_items(self, plc):
        """
        Regenera el archivo YAML del PLC con SOLO los tags enabled.
        """
        config_path = Path(plc.config_path)
        
        if not config_path.exists():
            raise FileNotFoundError(f"YAML config not found: {config_path}")
        
        with open(config_path, "r") as f:
            data = yaml.safe_load(f) or {}
        
        driver_name = plc.driver.name.lower().replace(" ", "").replace("-", "")
        enabled_tags = plc.tags.filter(enabled=True).order_by('name')
        
        items = []
        for tag in enabled_tags:
            item = {
                "name": tag.name,
                "datatype": tag.datatype,
                "cdc": {
                    "tag": f"process/{tag.name.lower()}",
                    "unit": tag.unit or "-",
                }
            }
                            
            if tag.description:
                item["cdc"]["description"] = tag.description
            
            if driver_name == "opcua":
                item["addressing"] = {"node_id": tag.address}
            elif driver_name == "modbus":
                try:
                    modbus_addr = int(tag.address)
                    # Quitar offset según rango
                    if 1 <= modbus_addr <= 9999:
                        real_addr = modbus_addr  # Coils: sin offset
                    elif 10001 <= modbus_addr <= 19999:
                        real_addr = modbus_addr - 10000  # Discrete Inputs
                    elif 30001 <= modbus_addr <= 39999:
                        real_addr = modbus_addr - 30000  # Input Registers
                    elif 40001 <= modbus_addr <= 49999:
                        real_addr = modbus_addr - 40000  # Holding Registers
                    else:
                        real_addr = modbus_addr  # Sin offset
                        
                    item["addressing"] = {"register": str(real_addr)}
                except ValueError:
                    item["addressing"] = {"register": tag.address}
                
                if tag.fc:
                    item["fc"] = tag.fc
            elif driver_name in ["snap7", "s7"]:
                item["address"] = tag.address
            else:
                item["addressing"] = {"address": tag.address}
            
            items.append(item)
        
        data["items"] = items
        
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, "w") as f:
            yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)
        
        return len(enabled_tags)

    # ========================================
    # ENDPOINT: LISTAR/CREAR TAGS
    # ========================================
    
    @action(detail=True, methods=["get", "post"], url_path="tags")
    def tags(self, request, pk=None):
        """
        GET  /plc/{pk}/tags/  -> listar tags del PLC
        POST /plc/{pk}/tags/  -> crear un tag asociado al PLC
        """
        plc = self.get_object()

        if request.method == "GET":
            tags = plc.tags.all()
            serializer = TagMinimalSerializer(tags, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            data['plc'] = plc.id
            
            serializer = TagCreateSerializer(data=data)
            if serializer.is_valid():
                tag = serializer.save()
                
                try:
                    self._rebuild_yaml_items(plc)
                except Exception as e:
                    tag.delete()
                    return Response(
                        {"detail": f"Tag created but failed updating YAML: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                response_serializer = TagSerializer(tag)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ========================================
    # ENDPOINT: DETALLE/EDITAR/ELIMINAR TAG
    # ========================================
    
    @action(detail=True, methods=['get', 'patch', 'delete'], url_path='tags/(?P<tag_id>[^/.]+)')
    def tag_detail(self, request, pk=None, tag_id=None):
        """
        GET    /plc/{id}/tags/{tag_id}/     -> Get tag detail
        PATCH  /plc/{id}/tags/{tag_id}/     -> Update tag
        DELETE /plc/{id}/tags/{tag_id}/     -> Delete tag
        """
        plc = self.get_object()
        tag = get_object_or_404(Tag, pk=tag_id, plc=plc)
        
        if request.method == 'GET':
            serializer = TagSerializer(tag)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = TagSerializer(tag, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                try:
                    self._rebuild_yaml_items(plc)
                except Exception as e:
                    return Response(
                        {"detail": f"Tag updated but failed updating YAML: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            tag.delete()
            
            try:
                self._rebuild_yaml_items(plc)
            except Exception as e:
                return Response(
                    {"detail": f"Tag deleted but failed updating YAML: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        
    # ========================================
    # ENDPOINT: TOGGLE TAG ENABLED
    # ========================================
    @action(detail=True, methods=['patch'], url_path='tags/(?P<tag_id>[^/.]+)/toggle')
    def toggle_tag(self, request, pk=None, tag_id=None):
        """
        PATCH /plc/{id}/tags/{tag_id}/toggle/
        Body: {"enabled": true/false}
        """
        plc = self.get_object()
        tag = get_object_or_404(Tag, pk=tag_id, plc=plc)
        
        enabled = request.data.get('enabled')
        if enabled is None:
            return Response(
                {"detail": "Field 'enabled' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tag.enabled = enabled
        tag.save()
        
        try:
            self._rebuild_yaml_items(plc)
        except Exception as e:
            return Response(
                {"detail": f"Tag toggled but failed updating YAML: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        total_enabled = plc.tags.filter(enabled=True).count()
        
        serializer = TagSerializer(tag)
        return Response({
            **serializer.data,
            'total_enabled_tags': total_enabled
        })


# ========================================
# TAG VIEWSET (ENDPOINTS GLOBALES)
# ========================================

class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TagMinimalSerializer
        elif self.action == 'create':
            return TagCreateSerializer
        return TagSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        plc_id = self.request.query_params.get('plc')
        if plc_id:
            queryset = queryset.filter(plc_id=plc_id)
        
        enabled = self.request.query_params.get('enabled')
        if enabled is not None:
            queryset = queryset.filter(enabled=enabled.lower() == 'true')
        
        driver = self.request.query_params.get('driver')
        if driver:
            queryset = queryset.filter(plc__driver__name__icontains=driver)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.select_related(
            'plc', 
            'plc__driver',
            'plc__work_unit',
            'plc__work_unit__work_center',
            'plc__work_unit__work_center__area',
            'plc__work_unit__work_center__area__site'
        )
    
    def perform_create(self, serializer):
        tag = serializer.save()
        plc = tag.plc
        
        try:
            self._rebuild_plc_yaml(plc)
        except Exception as e:
            tag.delete()
            raise ValidationError(f"Failed updating YAML: {str(e)}")
    
    def perform_update(self, serializer):
        tag = serializer.save()
        self._rebuild_plc_yaml(tag.plc)
    
    def perform_destroy(self, instance):
        plc = instance.plc
        instance.delete()
        self._rebuild_plc_yaml(plc)
    
    def _rebuild_plc_yaml(self, plc):
        config_path = Path(plc.config_path)
        
        if not config_path.exists():
            return
        
        with open(config_path, "r") as f:
            data = yaml.safe_load(f) or {}
        
        enabled_tags = plc.tags.filter(enabled=True).order_by('name')
        driver_name = plc.driver.name.lower().replace(" ", "").replace("-", "")
        
        items = []
        for tag in enabled_tags:
            item = {
                "name": tag.name,
                "datatype": tag.datatype,
                "cdc": {
                    "tag": f"process/{tag.name.lower()}",
                    "unit": tag.unit or "-",
                }
            }
            
            
            if tag.description:
                item["cdc"]["description"] = tag.description       
            if driver_name == "opcua":
                item["addressing"] = {"node_id": tag.address}
            elif driver_name in ["modbus", "modbustcp"]:
                try:
                    modbus_addr = int(tag.address)
                    # Quitar offset según rango
                    if 1 <= modbus_addr <= 9999:
                        real_addr = modbus_addr  # Coils: sin offset
                    elif 10001 <= modbus_addr <= 19999:
                        real_addr = modbus_addr - 10000  # Discrete Inputs
                    elif 30001 <= modbus_addr <= 39999:
                        real_addr = modbus_addr - 30000  # Input Registers
                    elif 40001 <= modbus_addr <= 49999:
                        real_addr = modbus_addr - 40000  # Holding Registers
                    else:
                        real_addr = modbus_addr  # Sin offset
                    item["addressing"] = {"register": str(real_addr)}
                except ValueError:
                    item["addressing"] = {"register": tag.address}
                if tag.fc:
                    item["fc"] = tag.fc
            elif driver_name in ["snap7", "s7"]:
                item["address"] = tag.address
            else:
                item["addressing"] = {"address": tag.address}
            
            items.append(item)
        
        data["items"] = items
        
        with open(config_path, "w") as f:
            yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)
    
    @action(detail=True, methods=["patch"])
    def toggle(self, request, pk=None):
        tag = self.get_object()
        enabled = request.data.get('enabled')
        
        if enabled is None:
            return Response(
                {"error": "Field 'enabled' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tag.enabled = enabled
        tag.save()
        
        try:
            self._rebuild_plc_yaml(tag.plc)
        except Exception as e:
            return Response(
                {"detail": f"Tag toggled but failed updating YAML: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(TagSerializer(tag).data)
    
    @action(detail=False, methods=["post"])
    def bulk_toggle(self, request):
        serializer = TagBulkToggleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        tag_ids = serializer.validated_data['tag_ids']
        enabled = serializer.validated_data['enabled']
        
        tags = Tag.objects.filter(id__in=tag_ids)
        tags.update(enabled=enabled)
        
        affected_plcs = PLC.objects.filter(tags__id__in=tag_ids).distinct()
        for plc in affected_plcs:
            try:
                self._rebuild_plc_yaml(plc)
            except Exception as e:
                return Response(
                    {"detail": f"Tags updated but failed updating YAML for PLC {plc.name}: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response({
            "updated": len(tag_ids),
            "enabled": enabled,
            "plcs_affected": affected_plcs.count()
        })


# ========================================
# 🔥 HELPER: REGENERATE ALL YAMLS
# ========================================

def regenerate_all_yaml_files():
    """
    Función reutilizable que regenera gateway.yaml
    y TODOS los YAML individuales de los PLCs.
    """
    gateway_path = build_gateway_yaml()
    plcs = PLC.objects.filter(enabled=True)

    for plc in plcs:
        config_path = Path(plc.config_path)

        if not config_path.exists():
            continue

        with open(config_path, "r") as f:
            data = yaml.safe_load(f) or {}

        enabled_tags = plc.tags.filter(enabled=True).order_by('name')
        driver_name = plc.driver.name.lower().replace(" ", "").replace("-", "")

        items = []
        for tag in enabled_tags:
            item = {
                "name": tag.name,
                "datatype": tag.datatype,
                "cdc": {
                    "tag": f"process/{tag.name.lower()}",
                    "unit": tag.unit or "-",
                }
            }
            
            if tag.description:
                item["cdc"]["description"] = tag.description

            if driver_name == "opcua":
                item["addressing"] = {"node_id": tag.address}
            elif driver_name in ["modbus", "modbustcp"]:
                try:
                    modbus_addr = int(tag.address)
                    # Quitar offset según rango
                    if 1 <= modbus_addr <= 9999:
                        real_addr = modbus_addr  # Coils: sin offset
                    elif 10001 <= modbus_addr <= 19999:
                        real_addr = modbus_addr - 10000  # Discrete Inputs
                    elif 30001 <= modbus_addr <= 39999:
                        real_addr = modbus_addr - 30000  # Input Registers
                    elif 40001 <= modbus_addr <= 49999:
                        real_addr = modbus_addr - 40000  # Holding Registers
                    else:
                        real_addr = modbus_addr  # Sin offset
                    item["addressing"] = {"register": str(real_addr)}
                except ValueError:
                    item["addressing"] = {"register": tag.address}
                if tag.fc:
                    item["fc"] = tag.fc
            elif driver_name in ["snap7", "s7"]:
                item["address"] = tag.address
            else:
                item["addressing"] = {"address": tag.address}

            items.append(item)

        data["items"] = items

        with open(config_path, "w") as f:
            yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)

    return gateway_path, plcs.count()


# ========================================
# 🔥 ENDPOINT: REGENERATE GATEWAY
# ========================================

@api_view(["POST"])
def regenerate_gateway(request):
    """
    💾 Regenera gateway.yaml y todos los YAML de PLCs habilitados.
    Solo guarda archivos, NO reinicia el gateway.
    """
    try:
        gateway_path, plc_count = regenerate_all_yaml_files()

        return Response({
            "detail": "Configuration files saved successfully",
            "gateway_path": gateway_path,
            "plcs_updated": plc_count,
            "message": "Changes saved. Click 'Restart Gateway' to apply changes."
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": "Failed to save configuration files",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========================================
# 🔥 ENDPOINT: RESTART GATEWAY
# ========================================

@api_view(["POST"])
def restart_gateway(request):
    """
    🔄 Regenera configuración Y reinicia el contenedor del gateway.
    Usa el socket de Docker del host para reiniciar el contenedor.
    """
    try:
        # 1️⃣ Regenerar configuraciones
        try:
            gateway_path, plc_count = regenerate_all_yaml_files()
        except Exception as e:
            return Response({
                "detail": "Failed to regenerate configuration files",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2️⃣ Reiniciar contenedor Docker
        try:
            result = subprocess.run(
                ["docker", "restart", "gateway"],
                capture_output=True,
                text=True,
                timeout=30
            )
        except subprocess.TimeoutExpired:
            return Response({
                "detail": "Docker restart command timed out",
                "error": "The restart operation took longer than 30 seconds"
            }, status=status.HTTP_408_REQUEST_TIMEOUT)
        except FileNotFoundError:
            return Response({
                "detail": "Docker command not found",
                "error": "Docker is not installed or not in PATH. Check Docker socket mount."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                "detail": "Failed to execute docker restart command",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3️⃣ Verificar resultado
        if result.returncode != 0:
            return Response({
                "detail": "Docker returned an error while restarting gateway",
                "error": result.stderr.strip() or "Unknown docker error",
                "stdout": result.stdout.strip()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4️⃣ ÉXITO
        return Response({
            "detail": "Gateway restarted successfully",
            "gateway_path": gateway_path,
            "plcs_updated": plc_count,
            "restart_method": "docker",
            "message": "Configuration applied. Gateway is restarting and will reconnect shortly.",
            "container_name": "docker-suite-gateway-1"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "detail": "Unexpected error while restarting gateway",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)