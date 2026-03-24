#django-api/scada_api/serializers.py
from rest_framework import serializers
from .models import Equipment, TagConfig

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'


class TagConfigSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    
    class Meta:
        model = TagConfig
        fields = '__all__'


class TagHistoryRequestSerializer(serializers.Serializer):
    """Validador para requests de historial"""
    equipment_id = serializers.CharField(required=True)
    variable = serializers.CharField(required=True)
    start = serializers.CharField(default='-12h')
    stop = serializers.CharField(default='now')
    window = serializers.CharField(default='30s')
    aggregation = serializers.ChoiceField(
        choices=['mean', 'max', 'min', 'last'],
        default='mean'
    )


class MultiTagRequestSerializer(serializers.Serializer):
    """Validador para request de múltiples tags"""
    tags = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    start = serializers.CharField(default='-12h')
    window = serializers.CharField(default='30s')