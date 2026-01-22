from rest_framework import serializers

class RawDataPointSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    equipment_id = serializers.CharField()
    variable = serializers.CharField()
    value = serializers.FloatField()
    quality = serializers.ChoiceField(
        choices=["Good", "Bad", "Uncertain"],
        default="Godd"
    )
