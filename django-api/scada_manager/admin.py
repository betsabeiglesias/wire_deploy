# from django.contrib import admin
# from scada_manager.models import Country, Location, Factory, Area, Manufacturer, Machine


# admin.site.register(Country)
# admin.site.register(Location)
# admin.site.register(Factory)
# admin.site.register(Area)
# admin.site.register(Manufacturer)
# admin.site.register(Machine)
# # admin.site.register(MyPowerBi)


from django.contrib import admin
from scada_manager.models import MyLayOutsTitle
from .models import CustomTagGroup, CustomTag

admin.site.register(MyLayOutsTitle)



@admin.register(CustomTagGroup)
class CustomTagGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'created_at') # Columnas que verás en la lista
    list_filter = ('client',) # Filtro lateral por empresa
    search_fields = ('name',) # Buscador

@admin.register(CustomTag)
class CustomTagAdmin(admin.ModelAdmin):
    list_display = ('tag_name', 'group', 'equipment_id', 'datatype')
    list_filter = ('group__client', 'datatype') # Filtra por empresa a través del grupo
    search_fields = ('tag_name', 'equipment_id')