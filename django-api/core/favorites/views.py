from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType

from .models import Favorite
from .serializers import FavoriteSerializer, CONTENT_TYPE_MAP


class FavoriteViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        data = []

        for fav in favorites:
            obj = fav.content_object
            if not obj:
                continue

            model = fav.content_type.model

            # 🔵 LAYOUTS
            if model == "mylayoutstitle":
                route = f"/layout/{obj.id}"
                title = obj.button_name
                section = "scada"
                fav_type = "mylayout"

            # 🟢 LOCATIONS
            elif model == "location":
                route = "/map"
                title = obj.city
                section = "location"
                fav_type = "location"

            # 🟣 POWER BI
            elif model == "mypowerbi":
                route = "/powerbi-view"
                title = obj.name
                section = "powerbi"
                fav_type = "mypowerbi"

            else:
                continue

            data.append({
                "id": fav.id,
                "type": fav_type,        # 👈 lo que espera el frontend
                "section": section,
                "object_id": fav.object_id,
                "title": title,
                "route": route,
            })

        return Response(data)

    def create(self, request):
        ct_key = request.data.get("content_type")
        object_id = request.data.get("object_id")

        if ct_key not in CONTENT_TYPE_MAP:
            return Response({"error": "Tipo no válido"}, status=400)

        app_label, model = CONTENT_TYPE_MAP[ct_key]

        content_type = ContentType.objects.get(
            app_label=app_label,
            model=model
        )

        favorite = Favorite.objects.filter(
            user=request.user,
            content_type=content_type,
            object_id=object_id,
        ).first()

        # 🔁 TOGGLE
        if favorite:
            favorite.delete()
            return Response({"status": "removed"})

        serializer = FavoriteSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"status": "added"})
