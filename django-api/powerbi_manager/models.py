from django.db import models
from django.conf import settings

class MyPowerBi(models.Model):
    name = models.CharField(max_length=200)
    embed_url = models.CharField(max_length=700)
    description = models.CharField(max_length=200)
    user = models.ManyToManyField(settings.AUTH_USER_MODEL)
