from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import MyLayOut, MyLayOutsTitle


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
        fields = ['id', 'name', 'views_data', 'elements', 'layouts']
    
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