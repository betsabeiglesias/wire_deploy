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
from scada_manager.models import MyLayOutsTitle, ProjectVariable, VariableTable

admin.site.register(MyLayOutsTitle)


@admin.register(ProjectVariable)
class ProjectVariableAdmin(admin.ModelAdmin):
    list_display  = ["name", "table", "source", "equipment", "variable", "datatype", "variable_id"]
    list_filter   = ["source", "datatype"]
    search_fields = ["name", "equipment", "variable"]
    readonly_fields = ["variable_id", "created_at", "updated_at"]


@admin.register(VariableTable)
class VariableTableAdmin(admin.ModelAdmin):
    list_display  = ["name", "layout", "order"]
    list_filter   = ["layout"]
    search_fields = ["name"]
