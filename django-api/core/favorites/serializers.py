from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Favorite

CONTENT_TYPE_MAP = {
    "mypowerbi": ("powerbi_manager", "mypowerbi"),
    "mylayout": ("scada_manager", "mylayoutstitle"),
    "location": ("maps", "location"),
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

        if ct_key not in CONTENT_TYPE_MAP:
            raise serializers.ValidationError("Tipo de favorito no válido")

        app_label, model = CONTENT_TYPE_MAP[ct_key]

        content_type = ContentType.objects.get(
            app_label=app_label,
            model=model
        )

        favorite = Favorite.objects.filter(
            user=user,
            content_type=content_type,
            object_id=validated_data["object_id"],
        ).first()

        # 🔁 TOGGLE
        if favorite:
            favorite.delete()
            return favorite

        return Favorite.objects.create(
            user=user,
            content_type=content_type,
            object_id=validated_data["object_id"],
        )
