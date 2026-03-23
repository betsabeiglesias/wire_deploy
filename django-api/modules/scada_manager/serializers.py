from rest_framework import serializers
from .models import  MyLayOutsTitle



class MyLayOutsTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyLayOutsTitle
        # Cambio combinado de HEAD: definir campos explícitamente y mantener la lógica de 'elements'
        fields = ['id', 'name', 'views_data', 'order']
    

 