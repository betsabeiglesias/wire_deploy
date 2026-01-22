# django-api/scada_api/mod
from django.db import models

class Equipment(models.Model):
    """Modelo para gestionar equipos disponibles"""
    equipment_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    site = models.CharField(max_length=100)
    area = models.CharField(max_length=100)
    line = models.CharField(max_length=100, blank=True, null=True)
    cell = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'scada_equipment'
        ordering = ['equipment_id']
    
    def __str__(self):
        return f"{self.name} ({self.equipment_id})"


class TagConfig(models.Model):
    """Configuración de tags/variables disponibles"""
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='tags')
    variable = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, blank=True)
    datatype = models.CharField(max_length=50)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'scada_tag_config'
        unique_together = ['equipment', 'variable']
        ordering = ['equipment', 'variable']
    
    def __str__(self):
        return f"{self.equipment.name} - {self.display_name}"