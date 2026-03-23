from rest_framework import serializers
from .models import MyPowerBi

class MyPowerBiSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    class Meta:
        model = MyPowerBi
        fields = '__all__'
        # Evita que el serializador exija el campo 'client' en el POST
        read_only_fields = ['client']