from django.db import models
from django.conf import settings


class MyLayOutsTitle(models.Model):
    name = models.CharField(max_length=200)
    views_data = models.JSONField(null=True, blank=True, help_text="JSON containing multiple views for multi-window applications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order'] # Esto hace que Django los devuelva siempre ordenados


    
    def __str__(self):
        return self.name




    








