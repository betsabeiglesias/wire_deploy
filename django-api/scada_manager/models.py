from django.db import models
from django.conf import settings


class MyLayOutsTitle(models.Model):
    name = models.CharField(max_length=200)
    views_data = models.JSONField(null=True, blank=True, help_text="JSON containing multiple views for multi-window applications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return self.name

class MyLayOut(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    data = models.JSONField()
    name = models.ForeignKey(MyLayOutsTitle, on_delete=models.CASCADE, null=True)



    








