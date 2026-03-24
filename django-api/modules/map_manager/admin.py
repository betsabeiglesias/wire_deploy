from django.contrib import admin
from .models import Country, Location, Factory, Area, Manufacturer, Machine



admin.site.register(Country)
admin.site.register(Location)
admin.site.register(Factory)
admin.site.register(Area)
admin.site.register(Manufacturer)
admin.site.register(Machine)