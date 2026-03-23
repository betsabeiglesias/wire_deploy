from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction

from .models import Favorite
from .serializers import FavoriteSerializer

class FavoriteViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    dicc_conf = {
        "mylayoutstitle": {
            "route":  "/layout/",
            "section": "scada",
            "fav_type": "mylayout",
        },
        "location": {
            "route": "/map",
            "section": "location",
            "fav_type": "location",
        },
        "mypowerbi":{
            "route": "/powerbi-view",
            "section": "powerbi",
            "fav_type": "mypowerbi",
        }
    }

    def list(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        data = []

        for fav in favorites:
            try:
                obj = fav.content_object
                if not obj:
                    continue
            except Exception:
                continue

            model_name = fav.content_type.model
            route, title, section, fav_type = None, None, None, None

            if model_name in self.dicc_conf:
                # Mantenemos TU lógica de rutas original
                route = self.dicc_conf[model_name]["route"] if model_name != "mylayoutstitle" else self.dicc_conf[model_name]["route"] + str(obj.id)
                title = getattr(obj, 'name', 'Sin nombre')
                section = self.dicc_conf[model_name]["section"]
                fav_type = self.dicc_conf[model_name]["fav_type"]

                if fav_type:
                    data.append({
                        "id": fav.id, # ID de la tabla Favorite para el DND
                        "type": fav_type,
                        "section": section,
                        "object_id": fav.object_id,
                        "title": title,
                        "route": route,
                        "order": fav.order # Nuevo campo
                    })
        
        return Response(data)

    @action(detail=False, methods=['put'], url_path='reorder')
    def reorder(self, request):
        orders = request.data.get("orders", [])
        with transaction.atomic():
            for item in orders:
                # Filtramos por ID de favorito y usuario por seguridad
                Favorite.objects.filter(id=item["id"], user=request.user).update(order=item["order"])
        return Response({"status": "reordered"})

    def create(self, request):
        serializer = FavoriteSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        if instance.pk is None:
            return Response({"status": "removed"})
        
        return Response({"status": "added"})