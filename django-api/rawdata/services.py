import os
from datetime import datetime, timedelta
from .influx import query_api

def query_raw_data(from_ts, to_ts, equipment_id=None, variable=None, limit=10000):
    bucket = os.getenv("INFLUX_BUCKET")
  
    flux = f'''
        from(bucket: "{bucket}")
        |> range(start: time(v: "{from_ts}"), stop: time(v: "{to_ts}"))
        |> filter(fn: (r) => r["_measurement"] == "plc_tags")
        |> filter(fn: (r) => r["_field"] == "value_float")
        '''

    if equipment_id:
        flux += f'  |> filter(fn: (r) => r["equipment_id"] == "{equipment_id}")\n'

    if variable:
        flux += f'  |> filter(fn: (r) => r["variable"] == "{variable}")\n'

    flux += f'''
        |> keep(columns: ["_time", "_value", "equipment_id", "variable"])
        |> limit(n: {limit})
        '''

    try:
        tables = query_api.query(flux)
    except Exception as e:
        # 🔥 Esto es CLAVE para depurar
        print("❌ Error querying InfluxDB")
        print("Flux query:")
        print(flux)
        print("Exception:")
        print(e)
        raise

    rows = []

    for table in tables:
        for record in table.records:
            rows.append({
                "timestamp": record.get_time(),
                "machine_id": record.values.get("equipment_id"),
                "variable": record.values.get("variable"),
                "value": record.get_value(),
                "quality": "Good"
            })

    meta = {
        "from": from_ts,
        "to": to_ts,
        "count": len(rows),
        "limit": limit
    }

    return rows, meta