from django.apps import AppConfig

class ScadaApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.scada_manager.scada_api'
    label = 'scada_api' # Nombre interno único