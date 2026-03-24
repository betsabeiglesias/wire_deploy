
from rest_framework import serializers
from modules.industrial_config_manager.models import (
    Site, Area, WorkCenter, WorkUnit, PLC, Driver, Tag
)

# ========================================
# ISA-95 HIERARCHY SERIALIZERS
# ========================================

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ("id", "name", "description")


class AreaSerializer(serializers.ModelSerializer):
    site = SiteSerializer(read_only=True)
    site_id = serializers.PrimaryKeyRelatedField(
        queryset=Site.objects.all(),
        source="site",
        write_only=True
    )

    class Meta:
        model = Area
        fields = ("id", "name", "site", "site_id")


class WorkCenterSerializer(serializers.ModelSerializer):
    area = AreaSerializer(read_only=True)
    area_id = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        source="area",
        write_only=True
    )

    class Meta:
        model = WorkCenter
        fields = ("id", "name", "area", "area_id")


class WorkUnitSerializer(serializers.ModelSerializer):
    work_center = WorkCenterSerializer(read_only=True)
    work_center_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkCenter.objects.all(),
        source="work_center",
        write_only=True
    )

    class Meta:
        model = WorkUnit
        fields = ("id", "name", "work_center", "work_center_id")


# ========================================
# WORK UNIT DETAIL SERIALIZER (Para PLCSerializer)
# ========================================
class WorkUnitDetailSerializer(serializers.ModelSerializer):
    work_center = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkUnit
        fields = ['id', 'name', 'work_center']
    
    def get_work_center(self, obj):
        if obj.work_center:
            wc = obj.work_center
            return {
                'id': wc.id,
                'name': wc.name,
                'area': {
                    'id': wc.area.id,
                    'name': wc.area.name,
                    'site': {
                        'id': wc.area.site.id,
                        'name': wc.area.site.name,
                        'description': wc.area.site.description or ''
                    }
                }
            }
        return None


# ========================================
# TAG SERIALIZERS
# ========================================

class TagSerializer(serializers.ModelSerializer):
    """
    Serializer completo para tags - usado en operaciones CRUD individuales
    """
    # Campos computados de solo lectura
    equipment_id = serializers.SerializerMethodField(read_only=True)
    driver_protocol = serializers.SerializerMethodField(read_only=True)
    plc_name = serializers.CharField(source='plc.name', read_only=True)
    status = serializers.SerializerMethodField()
    last_modified_display = serializers.SerializerMethodField()
    created_at_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = [
            'id',
            'plc',
            'plc_name',
            'name',
            'datatype',
            'address',
            'fc',
            'unit',
            'enabled',
            'eng_min',
            'eng_max',
            'role',
            'packml_state',
            'description',
            'attrs',
            'equipment_id',
            'driver_protocol',
            'last_modified',
            'created_at',
            'status',
            'last_modified_display',
            'created_at_display',
        ]
        read_only_fields = [
            'id',
            'last_modified', 
            'created_at',
            'equipment_id',
            'driver_protocol',
            'plc_name',
            'status',
            'last_modified_display',
            'created_at_display',
        ]
    
    def get_equipment_id(self, obj):
        """Retorna el equipment_id completo del tag"""
        return obj.equipment_id()
    
    def get_driver_protocol(self, obj):
        """Retorna el protocolo del driver (opcua, snap7, modbus)"""
        return obj.plc.driver.protocol if obj.plc and obj.plc.driver else None
    
    def get_status(self, obj):
        """Retorna el estado del tag"""
        return 'enabled' if obj.enabled else 'disabled'
    
    def get_last_modified_display(self, obj):
        """Formato legible del timestamp"""
        if obj.last_modified:
            return obj.last_modified.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_created_at_display(self, obj):
        """Formato legible del timestamp"""
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def validate_address(self, value):
        """Validación básica de dirección"""
        if not value or not value.strip():
            raise serializers.ValidationError("Address cannot be empty")
        return value.strip()
    
    def validate_name(self, value):
        """Validar que el nombre sea único dentro del PLC"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        
        value = value.strip()
        
        # Validar unicidad dentro del PLC
        plc_id = self.initial_data.get('plc') or (self.instance.plc.id if self.instance else None)
        
        if plc_id:
            queryset = Tag.objects.filter(plc_id=plc_id, name=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError(
                    f"A tag with name '{value}' already exists in this PLC"
                )
        
        return value
    
    def validate(self, data):
        """Validaciones a nivel de objeto completo"""
        # Si se está creando un tag, asegurar que el PLC existe
        if not self.instance and 'plc' not in data:
            raise serializers.ValidationError({"plc": "PLC is required when creating a tag"})
        
        # Validar límites de ingeniería
        eng_min = data.get('eng_min')
        eng_max = data.get('eng_max')
        
        if eng_min is not None and eng_max is not None:
            if eng_min >= eng_max:
                raise serializers.ValidationError({
                    "eng_min": "Engineering minimum must be less than maximum"
                })
        
        return data


class TagMinimalSerializer(serializers.ModelSerializer):
    """
    Serializer ligero para tags - usado en listados de PLCs
    Solo incluye campos esenciales para mostrar en tablas
    """
    status_indicator = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'address',
            'fc',
            'datatype',
            'unit',
            'enabled',
            'status_indicator',
        ]
    
    def get_status_indicator(self, obj):
        return "🟢" if obj.enabled else "⚪"


class TagCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para creación de tags
    Tags nuevos se crean habilitados por defecto
    """
    class Meta:
        model = Tag
        fields = [
            'plc',
            'name',
            'datatype',
            'address',
            'fc',
            'unit',
            'enabled',
            'eng_min',
            'eng_max',
            'role',
            'packml_state',
            'description',
            'attrs',
        ]

    @staticmethod
    def _infer_modbus_fc(address: int) -> int:
        if 1 <= address <= 9999:
            return 1
        elif 10001 <= address <= 19999:
            return 2
        elif 30001 <= address <= 39999:
            return 4
        elif 40001 <= address <= 49999:
            return 3
        return 3
    
    def create(self, validated_data):
        # Por defecto, tags nuevos vienen habilitados
        validated_data.setdefault('enabled', True)
        
        # Auto-calcular FC para Modbus si no viene del frontend
        if not validated_data.get("fc"): 
            plc = validated_data.get('plc')
            if plc and plc.driver.as_code() in ["modbus", "modbustcp"]:
                if not validated_data.get("fc"):
                    try:
                        address = int(validated_data["address"])
                        validated_data["fc"] = self._infer_modbus_fc(address)
                        print(f"🧠 Backend auto-calculated FC{validated_data['fc']} for address {address}")
                    except Exception as e:
                        print(f"⚠️ Could not auto-calculate FC: {e}")

        return super().create(validated_data)



class TagBulkToggleSerializer(serializers.Serializer):
    """
    Serializer para operaciones bulk de toggle
    POST /api/tags/bulk-toggle/
    Body: {"tag_ids": [1, 2, 3], "enabled": true}
    """
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="List of tag IDs to toggle"
    )
    enabled = serializers.BooleanField(
        help_text="New enabled state for all tags"
    )
    
    def validate_tag_ids(self, value):
        """Validar que los IDs existan"""
        existing_ids = set(Tag.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = set(value) - existing_ids
        
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid tag IDs: {', '.join(map(str, invalid_ids))}"
            )
        
        return value


# ========================================
# PLC SERIALIZER
# ========================================

class PLCSerializer(serializers.ModelSerializer):
    """
    Serializer completo para PLCs
    Incluye jerarquía ISA-95 completa y tags asociados
    """
    work_unit = serializers.PrimaryKeyRelatedField(queryset=WorkUnit.objects.all())
    driver_code = serializers.CharField(write_only=True)
    driver_name = serializers.CharField(source="driver.name", read_only=True)
    driver_protocol = serializers.CharField(source="driver.protocol", read_only=True)
    work_unit_detail = WorkUnitDetailSerializer(source="work_unit", read_only=True)
    equipment_id = serializers.CharField(read_only=True)
    
    # 🔥 CAMPO ÚNICO: "tags" con serializer minimal para performance
    tags = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PLC
        fields = [
            "id",
            "name",
            "description",
            "connection_string",
            "connection_data",
            "driver_code",         
            "driver_name",         
            "driver_protocol",     
            "work_unit",
            "work_unit_detail",
            "enabled",
            "config_path",
            "equipment_id",
            "tags",
        ]
        read_only_fields = ["equipment_id", "config_path"]

    def get_tags(self, obj):
        """
        Retornar tags con serializer minimal
        Usa TagMinimalSerializer para mejor performance en listados
        """
        tags = obj.tags.all()
        return TagMinimalSerializer(tags, many=True).data

    def validate(self, attrs):
        # 🔎 Resolver driver por code
        driver_code = attrs.pop("driver_code", None)

        if not driver_code:
            raise serializers.ValidationError({
                "driver_code": "This field is required."
            })

        try:
            driver = Driver.objects.get(code=driver_code)
        except Driver.DoesNotExist:
            raise serializers.ValidationError({
                "driver_code": f"Unknown driver '{driver_code}'."
            })

        attrs["driver"] = driver

        # 🔒 Validaciones existentes
        conn = attrs.get("connection_string")
        if not conn:
            raise serializers.ValidationError({
                "connection_string": "A connection string is required."
            })

        if driver.code == "opcua" and not conn.startswith("opc.tcp://"):
            raise serializers.ValidationError({
                "connection_string": "OPC UA endpoints must start with 'opc.tcp://'."
            })

        return attrs