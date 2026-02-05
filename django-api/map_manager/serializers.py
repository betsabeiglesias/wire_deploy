from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import Country, Location, Factory, Area, Manufacturer, Machine

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'city', 'gps_x', 'gps_y', 'country', 'country_name', 'direction', 'postal_code', 'llevar_a_url']

class FactorySerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Factory
        fields = '__all__'

class AreaSerializer(serializers.ModelSerializer):
    factory = FactorySerializer(read_only=True)

    class Meta:
        model = Area
        fields = '__all__'

class ManufacturerSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Manufacturer
        fields = '__all__'

class MachineSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer(read_only=True)
    area = AreaSerializer(read_only=True)

    class Meta:
        model = Machine
        fields = '__all__'