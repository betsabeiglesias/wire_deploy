from django.apps import AppConfig

class ManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # IMPORTANTE: El name debe ser la ruta completa desde la raíz
    name = 'modules.management' 
    # El label es el nombre "corto" que Django usa internamente para las tablas
    label = 'management'