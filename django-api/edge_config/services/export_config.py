from industrial_config_manager.models import PLC


def export_gateway_config():

    plcs = PLC.objects.filter(enabled=True).prefetch_related("tags")

    equipments = []

    for plc in plcs:

        items = []

        for tag in plc.tags.filter(enabled=True):

            items.append({
                "name": tag.name,
                "datatype": tag.datatype,
                "address": tag.address,
                "unit": tag.unit,
                "cdc": {
                    "tag": tag.name,
                    "unit": tag.unit,
                }
            })

        equipments.append({
            "equipment_id": plc.equipment_id,
            "driver": plc.driver.protocol,
            "connection": plc.connection_string,
            "items": items
        })

    return {
        "gateway": {
            # RETOMAR
            "name": "scada-gw-01",
            "log_level": "INFO",
        },
        "equipments": equipments
    }