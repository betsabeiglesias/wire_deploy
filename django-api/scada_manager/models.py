from django.db import models
from django.conf import settings

class MyLayOutsTitle(models.Model):
    name = models.CharField(max_length=200)
    views_data = models.JSONField(null=True, blank=True, help_text="JSON containing multiple views for multi-window applications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order'] # Esto hace que Django los devuelva siempre ordenados


    
    def __str__(self):
        return self.name

# Importamos los modelos existentes para las relaciones
# Asegúrate de que estos nombres coincidan con los de tu archivo models.py actual

class CustomTagGroup(models.Model):
    """Representa una 'Tabla' creada por el usuario (ej: Horno 1)"""
    name = models.CharField(max_length=100)
    # Relación con la Empresa/Cliente identificada en tu inspectdb
    client = models.ForeignKey('auth_manager.Client', on_delete=models.CASCADE, related_name='tag_groups')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scada_custom_tag_group'
        # Un usuario no puede repetir el nombre de tabla dentro de la misma empresa
        unique_together = (('name', 'client'),)

class CustomTag(models.Model):
    """Representa cada fila/variable dentro de una tabla de usuario"""
    group = models.ForeignKey(CustomTagGroup, on_delete=models.CASCADE, related_name='tags')
    tag_name = models.CharField(max_length=100) # Nombre amigable (ej: Nivel Tanque)
    
    # Datos técnicos del sensor (ISA-95 / OPC UA)
    equipment_id = models.CharField(max_length=255)
    cdc_tag = models.CharField(max_length=255)
    datatype = models.CharField(max_length=50, default='Float')
    unit = models.CharField(max_length=20, blank=True, null=True)
    node_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata adicional
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'scada_custom_tag'
        # Evita nombres de variables duplicados en la misma tabla
        unique_together = (('group', 'tag_name'),)


    








