from rest_framework import serializers
from .models import  MyLayOutsTitle, ProjectVariable


class MyLayOutsTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyLayOutsTitle
        # Cambio combinado de HEAD: definir campos explícitamente y mantener la lógica de 'elements'
        fields = ['id', 'name', 'views_data', 'order']
    


class ProjectVariableSerializer(serializers.ModelSerializer):
    variable_id = serializers.UUIDField(read_only=True)
 
    class Meta:
        model  = ProjectVariable
        fields = [
            "id", "variable_id", "layout",
            "name", "source",
            "equipment", "variable", "datatype", "unit", "address", "node_id",
            "initial_value", "description",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "variable_id", "created_at", "updated_at"]
 
    def validate(self, data):
        source = data.get("source", getattr(self.instance, "source", "connection"))
        if source == "connection":
            if not data.get("equipment", getattr(self.instance, "equipment", "")):
                raise serializers.ValidationError({"equipment": "Requerido para variables de conexión."})
            if not data.get("variable", getattr(self.instance, "variable", "")):
                raise serializers.ValidationError({"variable": "Requerido para variables de conexión."})
        if source == "local":
            data.setdefault("equipment", "")
            data.setdefault("variable",  "")
            data.setdefault("address",   "")
            data.setdefault("node_id",   "")
        return data
 

 