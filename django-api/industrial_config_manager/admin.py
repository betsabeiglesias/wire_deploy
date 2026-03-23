from django.contrib import admin
from .models import Site, Area, WorkCenter, WorkUnit, Driver, PLC, Tag

@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ("name", "description")

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ("name", "site")
    list_filter = ("site",)

@admin.register(WorkCenter)
class WorkCenterAdmin(admin.ModelAdmin):
    list_display = ("name", "area")
    list_filter = ("area",)

@admin.register(WorkUnit)
class WorkUnitAdmin(admin.ModelAdmin):
    list_display = ("name", "work_center")
    list_filter = ("work_center",)

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("name", "protocol")

@admin.register(PLC)
class PLCAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "connection_string",
        "driver",
        "work_unit",
        "equipment_id", 
        "enabled",
    )

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "plc", "datatype", "address")
    search_fields = ("name", "address")
    list_filter = ("datatype", "plc")
