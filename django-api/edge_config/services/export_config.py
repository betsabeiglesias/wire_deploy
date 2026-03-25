# django-api/edge_config/services/export_config.py

from industrial_config_manager.models import PLC

DRIVER_MAPPING = {
    "modbus": "modbus_tcp",
    "snap7": "snap7",
    "opcua": "opcua",
}

def _build_connection(plc):
    """
    Construye el bloque 'connection' según el driver,
    usando connection_data (JSONField).
    """
    protocol_raw = plc.driver.protocol.lower()
    protocol = DRIVER_MAPPING.get(protocol_raw, protocol_raw)
    cd = plc.connection_data or {}

    if protocol == "opcua":
        return {
            "endpoint": cd.get("endpoint", plc.connection_string),
            "namespace_uri": cd.get("namespace_uri", ""),
            "security_mode": cd.get("security_mode", "None"),
            "security_policy": cd.get("security_policy", "None"),
            "timeouts_ms": cd.get("timeouts_ms", {"connect": 5000, "session": 10000}),
            "reconnect": cd.get("reconnect", {"enable": True, "min_delay_ms": 1000, "max_delay_ms": 10000}),
        }

    elif protocol == "snap7":
        return {
            "hostname": cd.get("hostname", plc.connection_string),
            "rack": cd.get("rack", 0),
            "slot": cd.get("slot", 1),
            "timeout_ms": cd.get("timeout_ms", 5000),
            "pdu_size": cd.get("pdu_size", 480),
            "poll_ms": cd.get("poll_ms", 1000),
            "reconnect": cd.get("reconnect", {"enable": True, "min_delay_ms": 1000, "max_delay_ms": 60000}),
        }

    elif protocol == "modbus":
        return {
            "host": cd.get("host", plc.connection_string),
            "port": cd.get("port", 502),
            "poll_rate_ms": cd.get("poll_rate_ms", 500),
            "byte_order": cd.get("byte_order", "big"),
            "word_order": cd.get("word_order", "little"),
        }

    # fallback genérico
    return {"connection_string": plc.connection_string, **cd}


def _build_addressing(tag, protocol):
    """
    Construye el bloque 'addressing' según el driver.
    """
    protocol = protocol.lower()

    if protocol == "opcua":
        return {"node_id": tag.address}

    elif protocol == "snap7":
        return {"address": tag.address}

    elif protocol == "modbus":
        item = {"address": tag.address}
        if tag.fc is not None:
            item["fc"] = tag.fc
        return item

    return {"address": tag.address}


def _build_isa95(plc):
    wu = plc.work_unit
    wc = wu.work_center
    area = wc.area
    site = area.site
    return {
        "site": site.name,
        "area": area.name,
        "work_center": wc.name,
        "work_unit": wu.name,
    }


def export_gateway_config():
    plcs = PLC.objects.filter(enabled=True).prefetch_related(
        "tags",
        "driver",
        "work_unit__work_center__area__site",
    )

    equipments = []

    for plc in plcs:
        protocol = plc.driver.protocol.lower()

        items = []
        for tag in plc.tags.filter(enabled=True):
            items.append({
                "name": tag.name,
                "datatype": tag.datatype,
                "unit": tag.unit or "",
                "description": tag.description or "",
                "addressing": _build_addressing(tag, protocol),
                "cdc": {
                    "tag": tag.name,
                    "unit": tag.unit or "",
                },
            })

        equipments.append({
            "equipment_id": plc.equipment_id,
            "driver": protocol,
            "connection_data": _build_connection(plc),
            "isa95": _build_isa95(plc),
            "items": items,
        })

    return {"equipments": equipments}
