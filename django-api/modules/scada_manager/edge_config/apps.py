from django.apps import AppConfig

class EdgeConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # El nombre DEBE reflejar la ruta de carpetas desde la raíz del proyecto
    name = 'modules.scada_manager.edge_config' 
    label = 'scada_edge_config' # Añadimos un label único para evitar conflictos