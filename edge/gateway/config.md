# gateway/gateway_master.yaml
gateway:
  name: "SCADA_Gateway_Principal"
  version: "1.0.0"
  location: "Datacenter_Madrid"
  
  # Configuración global
  global_settings:
    log_level: "INFO"        # DEBUG, INFO, WARNING, ERROR
    log_path: "/var/log/scada/"
    database:
      type: "influxdb"       # influxdb, timescaledb, mongodb
      host: "localhost"
      port: 8086
      database: "scada_data"
    
    mqtt:
      enabled: true
      broker: "mqtt://localhost:1883"
      topic_prefix: "scada/"
    
    api:
      enabled: true
      host: "0.0.0.0"
      port: 8080

  # PLCs registrados
  plcs:
    - id: "plc_001"
      config_file: "configs/plc_site1_area1_line1.yaml"
      enabled: true
      priority: 1
      
    - id: "plc_002"
      config_file: "configs/plc_site1_area2_line1.yaml"
      enabled: true
      priority: 2
      
    - id: "plc_003"
      config_file: "configs/plc_site2_area1_line1.yaml"
      enabled: false         # PLC deshabilitado temporalmente
      priority: 3

  # Reglas de orquestación
  orchestration:
    startup_order:
      - "plc_001"
      - "plc_002"
      - "plc_003"
    
    shutdown_order:
      - "plc_003"
      - "plc_002"
      - "plc_001"
    
    health_check_interval: 30000  # ms
    auto_reconnect: true
    max_reconnect_attempts: 5
    reconnect_delay: 5000    # ms

  # Alertas globales
  alerts:
    email:
      enabled: true
      smtp_server: "smtp.empresa.com"
      smtp_port: 587
      recipients:
        - "operador@empresa.com"
        - "mantenimiento@empresa.com"
    
    sms:
      enabled: false
      provider: "twilio"
      phone_numbers:
        - "+34600000001"
```

---

## 🖥️ Estructura del Formulario React

### Componentes Principales
```
src/
├── components/
│   ├── PLCConfigForm/
│   │   ├── index.jsx                    # Componente principal
│   │   ├── HierarchySelector.jsx        # Selector ISA-95
│   │   ├── ProtocolSelector.jsx         # Selector de protocolo
│   │   ├── ConnectionForm/
│   │   │   ├── Snap7Form.jsx
│   │   │   ├── ModbusTCPForm.jsx
│   │   │   └── OPCUAForm.jsx
│   │   ├── TagsEditor.jsx               # Editor de tags
│   │   ├── AlarmsEditor.jsx             # Editor de alarmas
│   │   └── AdvancedSettings.jsx         # Configuración avanzada
│   │
│   └── GatewayMaster/
│       ├── index.jsx
│       ├── PLCList.jsx                  # Lista de PLCs registrados
│       └── OrchestrationConfig.jsx      # Configuración de orquestación
│
├── utils/
│   ├── yamlGenerator.js                 # Genera YAML desde formulario
│   └── validators.js                    # Validaciones
│
└── constants/
    ├── protocols.js                     # Definiciones de protocolos
    └── defaults.js                      # Valores por defecto
```

---

## 📝 Flujo de Uso

### 1. Crear Nueva Configuración de PLC
```
Paso 1: Jerarquía ISA-95
┌─────────────────────────────────────┐
│ Site:     [Planta_Madrid ▼]         │
│ Area:     [Produccion    ▼]         │
│ Line:     [Linea_1       ▼]         │
│ Cell:     [Estacion_Soldadura ▼]    │
│ Equipment: [PLC_S7_1200]            │
└─────────────────────────────────────┘

Paso 2: Protocolo
┌─────────────────────────────────────┐
│ ○ Snap7 (Siemens S7)                │
│ ○ Modbus TCP                        │
│ ○ OPC UA                            │
└─────────────────────────────────────┘

Paso 3: Conexión (ejemplo Snap7)
┌─────────────────────────────────────┐
│ IP Address: [192.168.1.10]          │
│ Rack:       [0]        (Default: 0) │
│ Slot:       [1]        (Default: 1) │
│ Timeout:    [5000] ms  (Default: 5s)│
│                                     │
│ [▼ Mostrar configuración avanzada]  │
└─────────────────────────────────────┘

Paso 4: Tags
┌─────────────────────────────────────┐
│ Tag 1:                              │
│   Name:     [temperatura_horno]     │
│   Address:  [DB1.DBD0]              │
│   Type:     [REAL ▼]                │
│   Polling:  [1000] ms               │
│   [Configurar scaling]              │
│                                     │
│ [+ Agregar Tag]                     │
└─────────────────────────────────────┘

Paso 5: Alarmas (Opcional)
┌─────────────────────────────────────┐
│ Alarma 1:                           │
│   Tag:       [temperatura_horno ▼]  │
│   Condition: [> ▼]                  │
│   Threshold: [900]                  │
│   Priority:  [High ▼]               │
│   Message:   [Temp excede límite]   │
│                                     │
│ [+ Agregar Alarma]                  │
└─────────────────────────────────────┘

Paso 6: Guardar
┌─────────────────────────────────────┐
│ Archivo: plc_site1_area1_line1.yaml│
│                                     │
│ [Guardar]  [Guardar y Activar]     │
└─────────────────────────────────────┘





/opt/suite/
├── config/
│   ├── plc/                    # YAMLs de PLCs (ya existente)
│   │   ├── plc_001.yaml
│   │   └── plc_002.yaml
│   ├── scada/                  # Nueva carpeta para SCADA
│   │   ├── layouts/            # Diseños/páginas del usuario
│   │   │   ├── main_dashboard.json
│   │   │   ├── line_1_view.json
│   │   │   └── energy_monitoring.json
│   │   ├── widgets/            # Configuraciones de widgets/iconos
│   │   │   └── custom_widgets.json
│   │   └── routes.json         # Mapeo de URLs/rutas
│   └── users/                  # (Opcional) Si quieres perfiles por usuario
│       └── admin/
│           └── scada_layouts/




MIGRACIONES DE DJANGO
Crear la migración (generar fichero):
docker-compose exec django-api python manage.py makemigrations industrial_config_manager


Si prefieres que Django detecte la app automáticamente:
docker-compose exec django-api python manage.py makemigrations

Aplicar la migración a la base de datos:
docker-compose exec django-api python manage.py migrate

(Opcional) Ver el estado de migraciones:
docker-compose exec django-api python manage.py showmigrations industrial_config_manager

(Verificar) Entra al shell Django para comprobar el nuevo campo en el modelo:
docker-compose exec django-api python manage.py shell
from industrial_config_manager.models import PLC
print(PLC._meta.get_field('enabled'))
exit()
