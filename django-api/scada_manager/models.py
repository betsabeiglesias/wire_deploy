from django.db import models
from django.conf import settings

# class Country(models.Model):
#     name = models.CharField(max_length=50, unique=True)
#     def __str__(self):
#         return self.name
    

# class Location(models.Model):
#     client = models.ForeignKey('auth_manager.Client', on_delete=models.CASCADE, related_name='locations')
#     city = models.CharField(max_length=50)
#     gps_x = models.FloatField(blank=True, null=True)
#     gps_y = models.FloatField(blank=True, null=True)
#     country = models.ForeignKey(Country, on_delete=models.PROTECT)
#     direction = models.CharField(max_length=200)
#     postal_code = models.CharField(max_length=20)
#     llevar_a_url = models.CharField(max_length=200, blank=True, null=True, help_text="URL a la que llevar al hacer clic en 'Ir al sitio'")
    
#     def __str__(self):
#         return f"{self.city} - {self.direction}"
    
# class Factory(models.Model):
#     name = models.CharField(max_length=50)
#     location = models.ForeignKey(Location, on_delete=models.PROTECT)
#     description = models.CharField(max_length=200)
#     def __str__(self):
#         return self.name
    
# class Area(models.Model):
#     name = models.CharField(max_length=50)
#     description = models.CharField(max_length=200)
#     factory = models.ForeignKey(Factory, on_delete=models.PROTECT)
#     def __str__(self):
#         return self.name

# class Manufacturer(models.Model):
#     name = models.CharField(max_length=50)
#     description = models.CharField(max_length=200)
#     country = models.ForeignKey(Country, on_delete=models.PROTECT)
#     def __str__(self):
#         return self.name
    
    
# class Machine(models.Model):
#     OPERATING_MODES = [
#         ("Automatic", "Automatic"),
#         ("Semi-automatic", "Semi-automatic"),
#         ("Manual", "Manual"),
#     ]

#     name = models.CharField(max_length=50)
#     description = models.CharField(max_length=200)
#     manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT)
#     area = models.ForeignKey(Area, on_delete=models.PROTECT, null=True)
#     type = models.CharField(max_length=50)
#     operating_mode = models.CharField(max_length=20, choices=OPERATING_MODES)

#     def __str__(self):
#         return self.name


class MyLayOutsTitle(models.Model):
    button_name = models.CharField(max_length=200)
    views_data = models.JSONField(null=True, blank=True, help_text="JSON containing multiple views for multi-window applications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return self.button_name

class MyLayOut(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    data = models.JSONField()
    button_name = models.ForeignKey(MyLayOutsTitle, on_delete=models.CASCADE, null=True)



    








