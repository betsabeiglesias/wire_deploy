# docker-suite\django-api\industrial_config_manager\models.py

from django.db import models
from django.utils import timezone

#ISA-95 Site/Area/Line/Cell/Equipment

class Site(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Area(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="areas")
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.site.name}/{self.name}"


class WorkCenter(models.Model):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="workcenters")
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.area}/{self.name}"


class WorkUnit(models.Model):
    work_center = models.ForeignKey(WorkCenter, on_delete=models.CASCADE, related_name="workunits")
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.work_center}/{self.name}"


class Driver(models.Model):
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=100)   # OPC UA / Snap7 / Modbus...
    protocol = models.CharField(max_length=50)  # "OPC-UA", "Snap7", "Modbus"
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.protocol})"
    
    def as_code(self):
        return self.code


class PLC(models.Model):
    work_unit = models.ForeignKey(
        "industrial_config_manager.WorkUnit", on_delete=models.CASCADE, related_name="control_modules"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")

    # Conexión única genérica
    connection_string = models.CharField(max_length=255)
    connection_data = models.JSONField(default=dict, blank=True)

    # # Config específica para cada driver (OPC UA, Snap7, Modbus, etc.)
    # advanced_config = models.JSONField(default=dict, blank=True)

    driver = models.ForeignKey("industrial_config_manager.Driver", on_delete=models.PROTECT)
    enabled = models.BooleanField(default=True)
    config_path = models.CharField(max_length=300, blank=True)

    # ID ISA-95 generado automáticamente
    equipment_id = models.CharField(max_length=255, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["work_unit", "name"]
        indexes = [
            models.Index(fields=["equipment_id"]),
            models.Index(fields=["driver"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.connection_string})"

    def build_equipment_id(self):
        site = self.work_unit.work_center.area.site.name
        area = self.work_unit.work_center.area.name
        wc = self.work_unit.work_center.name
        wu = self.work_unit.name
        return f"{site}/{area}/{wc}/{wu}/{self.name}"

    def save(self, *args, **kwargs):
        try:
            self.equipment_id = self.build_equipment_id()
        except Exception:
            self.equipment_id = self.name
        super().save(*args, **kwargs)



# Enumerado for datatype matching contract
DATATYPE_CHOICES = [
    ("Boolean", "Boolean"),
    ("Int16", "Int16"),
    ("Int32", "Int32"),
    ("UInt16", "UInt16"),
    ("UInt32", "UInt32"),
    ("Float", "Float"),
    ("Double", "Double"),
    ("String", "String"),
    ("DateTime", "DateTime"),
    ("Char", "Char"),
]

FC_CHOICES = [
    (1, "FC1 - Read Coils"),
    (2, "FC2 - Read Discrete Inputs"),
    (3, "FC3 - Read Holding Registers"),
    (4, "FC4 - Read Input Registers"),
]

class Tag(models.Model):
    plc = models.ForeignKey(PLC, on_delete=models.CASCADE, related_name="tags")
    # variable short name (fits "variable" in contract)
    name = models.CharField(max_length=100, help_text="Short standardized name (e.g. pressure, cmd_start)")
    # datatype must follow the contract enum
    datatype = models.CharField(max_length=20, choices=DATATYPE_CHOICES)
    # address in the PLC (e.g. DB1.DBW0 / ns=2;s=Tag1 / %MW100)
    address = models.CharField(max_length=200)
    unit = models.CharField(max_length=40, blank=True)

    fc = models.IntegerField(
        choices=FC_CHOICES,
        null=True,
        blank=True,
        help_text="Modbus Function Code (only for Modbus TCP driver)"
    )

    # Enable/Disable tag
    enabled = models.BooleanField(
        default=True,
        help_text="Whether this tag should be read from the PLC"
    )

    # optional engineering limits and metadata
    eng_min = models.FloatField(null=True, blank=True)
    eng_max = models.FloatField(null=True, blank=True)
    role = models.CharField(max_length=100, blank=True)   # e.g. process, setpoint, cmd
    packml_state = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    attrs = models.JSONField(blank=True, null=True)  # any additionalProperties

    last_modified = models.DateTimeField(auto_now=True, help_text="Last time this tag was modified")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When this tag was created")

    class Meta:
        ordering = ['name']
        # Índice para queries de performance
        indexes = [
            models.Index(fields=['plc', 'enabled']),
            models.Index(fields=['last_modified']),
        ]


    def __str__(self):
        status = "✓" if self.enabled else "✗"
        return f"{self.plc.name}/{self.name}"

    def equipment_id(self) -> str:
        return self.plc.equipment_id

    def source_object(self) -> dict:
        """
        Construye el objeto 'source' que exige el contrato:
        required: protocol, address
        optional: endpoint
        """
        return {
            "protocol": self.plc.driver.protocol,
            "address": self.address,
            "endpoint": self.plc.connection_string,
        }

    def to_cdc_tag(self, value, quality="Good", timestamp=None, extra_attrs: dict = None) -> dict:
        """
        Genera el dict conforme al contrato v1.tag listo para ser serializado/publish.
        - `value`: el valor actual (bool/int/float/str/datetime)
        - `quality`: "Good"|"Uncertain"|"Bad"
        - `timestamp`: naive or aware datetime or None -> se normaliza a UTC ISO8601 string

        🔥 NOTA: Esta función NO verifica si el tag está habilitado.
        Esa lógica debe estar en el driver que llama a este método.
        """
        if timestamp is None:
            ts = timezone.now().astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        elif isinstance(timestamp, str):
            ts = timestamp
        else:
            ts = timezone.localtime(timestamp).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

        payload = {
            "schema": "v1.tag",
            "equipment_id": self.equipment_id(),
            "variable": self.name,
            "value": value,
            "datatype": self.datatype,
            "unit": self.unit or "-",
            "timestamp": ts,
            "quality": quality,
            "source": self.source_object(),
        }
        attrs = {} if self.attrs is None else dict(self.attrs)
        if extra_attrs:
            attrs.update(extra_attrs)
        if attrs:
            payload["attrs"] = attrs

        return payload
    

# BINDING EN DASHBOARD ICONO-TAG
class WidgetBinding(models.Model):
    widget_id = models.CharField(max_length=100)        # ID del elemento en el canvas
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="bindings")
    property = models.CharField(max_length=50)          # "value", "color", "visibility"

    class Meta:
        unique_together = [("widget_id", "property")]   # un widget no puede tener dos bindings para la misma propiedad
        ordering = ["widget_id"]

    def __str__(self):
        return f"{self.widget_id} → {self.tag} [{self.property}]"