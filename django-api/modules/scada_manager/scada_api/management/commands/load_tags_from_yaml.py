# scada_api/management/commands/load_tags_from_yaml.py
import yaml
from pathlib import Path
from django.core.management.base import BaseCommand
from scada_api.models import Equipment, TagConfig
from django.conf import settings

class Command(BaseCommand):
    help = 'Carga equipos y tags desde YAMLs de configuración del gateway'

    def add_arguments(self, parser):
        parser.add_argument(
            '--gateway',
            default=str(Path(settings.PLC_CONFIG_DIR) / 'gateway.yaml'),
            help='Ruta al gateway.yaml'
        )

    def handle(self, *args, **options):
        gateway_path = Path(options['gateway'])

        with open(gateway_path) as f:
            gateway = yaml.safe_load(f)

        tenant = gateway['gateway']['tenant']
        created_count = 0
        updated_count = 0

        for entry in gateway.get('equipments', []):
            items_file = Path(entry['items_file'])

            # Soporte para rutas dentro de Docker vs locales
            if not items_file.exists():
                # Intentar relativo al directorio del gateway
                items_file = gateway_path.parent / items_file.name

            if not items_file.exists():
                self.stdout.write(self.style.WARNING(f"No encontrado: {items_file}"))
                continue

            with open(items_file) as f:
                plc_data = yaml.safe_load(f)

            isa95 = plc_data.get('isa95', {})
            equipment_id = plc_data['equipment_id']

            eq, created = Equipment.objects.update_or_create(
                equipment_id=equipment_id,
                defaults={
                    'name': equipment_id.split('/')[-1],  # último segmento como nombre
                    'site': isa95.get('site', tenant),
                    'area': isa95.get('area', ''),
                    'line': isa95.get('work_center', ''),
                    'cell': isa95.get('work_unit', ''),
                    'active': True,
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

            for item in plc_data.get('items', []):
                cdc = item.get('cdc', {})
                TagConfig.objects.update_or_create(
                    equipment=eq,
                    variable=item['name'],
                    defaults={
                        'tag_path': cdc.get('tag', ''),
                        'unit': cdc.get('unit', ''),
                        'datatype': item.get('datatype', ''),
                        'node_id': item.get('addressing', {}).get('node_id', ''),
                        'active': True,
                    }
                )

        self.stdout.write(self.style.SUCCESS(
            f"Equipos creados: {created_count}, actualizados: {updated_count}"
        ))