from rest_framework import serializers
from .models import MyLayOutsTitle, CustomTagGroup, CustomTag



class MyLayOutsTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyLayOutsTitle
        # Cambio combinado de HEAD: definir campos explícitamente y mantener la lógica de 'elements'
        fields = ['id', 'name', 'views_data', 'order']


class CustomTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTag
        fields = [
            "id",
            "group",
            "tag_name",
            "equipment_id",
            "cdc_tag",
            "datatype",
            "unit",
            "node_id",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class CustomTagGroupSerializer(serializers.ModelSerializer):
    # Nested tags para devolver la tabla con sus sensores.
    tags = CustomTagSerializer(many=True, read_only=True)

    class Meta:
        model = CustomTagGroup
        fields = [
            "id",
            "name",
            "client",
            "description",
            "created_at",
            "tags",
        ]
        # client se resuelve en backend desde la sesión/membresía del usuario.
        read_only_fields = ["id", "created_at", "client"]
