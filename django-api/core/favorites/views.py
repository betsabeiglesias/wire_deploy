from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Favorite
from .serializers import FavoriteSerializer

class FavoriteViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

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

            # 🔵 LAYOUTS (App: scada_manager)
            if model_name == "mylayoutstitle":
                route = f"/layout/{obj.id}"
                title = getattr(obj, 'button_name', 'Sin nombre')
                section = "scada"
                fav_type = "mylayout"

            # 🟢 LOCATIONS (App: map_manager)
            elif model_name == "location":
                route = "/map"
                title = getattr(obj, 'city', 'Sin ciudad')
                section = "location"
                fav_type = "location"

            # 🟣 POWER BI (App: powerbi_manager)
            elif model_name == "mypowerbi":
                route = "/powerbi-view"
                title = getattr(obj, 'name', 'Sin nombre')
                section = "powerbi"
                fav_type = "mypowerbi"

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