
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
        """
        Lista los favoritos del usuario actual transformando los modelos 
        genéricos en rutas y títulos legibles para el frontend.
        """
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
                route = self.dicc_conf[model_name]["route"] if model_name != "mylayoutstitle" else self.dicc_conf[model_name]["route"] + str(obj.id)
                title = getattr(obj, 'name', 'Sin nombre')
                section = self.dicc_conf[model_name]["section"]
                fav_type = self.dicc_conf[model_name]["fav_type"]

                if fav_type:
                    data.append({
                        "id": fav.id,
                        "type": fav_type,
                        "section": section,
                        "object_id": fav.object_id,
                        "title": title,
                        "route": route,
                    })
            

        return Response(data)

    def create(self, request):
        """
        Crea o elimina un favorito (Toggle). 
        Toda la lógica de búsqueda y validación está en FavoriteSerializer.
        """
        serializer = FavoriteSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Si el objeto devuelto no tiene clave primaria (pk), es que el serializador lo borró
        if instance.pk is None:
            return Response({"status": "removed"})
        
        return Response({"status": "added"})