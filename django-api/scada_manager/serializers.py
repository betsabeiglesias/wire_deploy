from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import Country, Location, Factory, Area, Manufacturer, Machine, MyLayOut, MyLayOutsTitle

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

class MyLayOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyLayOut
        fields = '__all__'

class MyLayOutsTitleSerializer(serializers.ModelSerializer):
    layouts = MyLayOutSerializer(many=True, source='mylayout_set', read_only=True)
    elements = serializers.SerializerMethodField()

    class Meta:
        model = MyLayOutsTitle
        # Cambio combinado de HEAD: definir campos explícitamente y mantener la lógica de 'elements'
        fields = ['id', 'button_name', 'views_data', 'elements', 'layouts']
    
    def get_elements(self, obj):
        # Lógica de HEAD: Si tiene views_data (aplicación multi-vista), devolverlo
        if obj.views_data:
            return obj.views_data
        
        # Si no, devolver layouts tradicionales (backward compatibility)
        layouts = obj.mylayout_set.all()
        return MyLayOutSerializer(layouts, many=True).data

# # Serializador nuevo de la rama 'principal'
# class MyPowerBiSerializer(serializers.ModelSerializer):
#     user = serializers.PrimaryKeyRelatedField(
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = MyPowerBi
#         fields = '__all__'