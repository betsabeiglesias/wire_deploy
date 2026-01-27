from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Favorite

# Mapeo de nombres del frontend a (app_label, model_name) del backend
CONTENT_TYPE_MAP = {
    "mypowerbi": ("powerbi_manager", "mypowerbi"),
    "mylayout": ("scada_manager", "mylayoutstitle"),
    "location": ("scada_manager", "location"),
}

class FavoriteSerializer(serializers.ModelSerializer):
    content_type = serializers.CharField(write_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "content_type", "object_id", "created_at")

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        ct_key = validated_data.pop("content_type")

        # 1. Validar que el tipo enviado existe en nuestro mapa
        if ct_key not in CONTENT_TYPE_MAP:
            raise serializers.ValidationError({"content_type": "Tipo de favorito no válido"})

        app_label, model = CONTENT_TYPE_MAP[ct_key]

        # 2. Obtener el ContentType de la base de datos
        content_type = ContentType.objects.filter(app_label=app_label, model=model).first()
        
        if not content_type:
            raise serializers.ValidationError(
                {"content_type": f"El modelo '{model}' no está registrado. Revisa las migraciones."}
            )

        # 3. Lógica de TOGGLE: Buscar si ya existe el favorito
        favorite = Favorite.objects.filter(
            user=user,
            content_type=content_type,
            object_id=validated_data["object_id"],
        ).first()

        if favorite:
            # Si existe, lo borramos y devolvemos la instancia (sin ID de DB)
            favorite.delete()
            return favorite

        # 4. Si no existe, lo creamos
        return Favorite.objects.create(
            user=user,
            content_type=content_type,
            object_id=validated_data["object_id"],
        )