# management/commands/fix_equipment_ids.py

from django.core.management.base import BaseCommand
from industrial_config_manager.models import PLC

class Command(BaseCommand):
    help = "Recalcula y actualiza todos los equipment_id de los PLC según la jerarquía ISA-95."

    def handle(self, *args, **kwargs):
        updated = 0

        for plc in PLC.objects.all():
            try:
                new_eqid = plc.build_equipment_id()  # 👈 usamos la función correcta
                if plc.equipment_id != new_eqid:
                    plc.equipment_id = new_eqid
                    plc.save(update_fields=["equipment_id"])
                    updated += 1
                    self.stdout.write(self.style.SUCCESS(f"Actualizado: {plc.name} -> {new_eqid}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"ERROR con PLC {plc.id} ({plc.name}): {e}"))

        self.stdout.write(self.style.WARNING(f"\nTotal PLC actualizados: {updated}"))
