import os
from influxdb_client import InfluxDBClient

INFLUX_URL=os.getenv("INFLUX_URL")
INFLUX_TOKEN=os.getenv("INFLUX_TOKEN")
INFLUX_ORG=os.getenv("INFLUX_ORG")

client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG,
)

query_api = client.query_api()