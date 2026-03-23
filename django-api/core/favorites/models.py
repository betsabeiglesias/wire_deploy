from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = settings.AUTH_USER_MODEL

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    created_at = models.DateTimeField(auto_now_add=True)
    # --- ÚNICO CAMBIO: Añadimos order ---
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        # Ordenamos por el nuevo campo order
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.user} → {self.content_type} ({self.object_id})"