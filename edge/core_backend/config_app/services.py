# # config_app/services.py

# import yaml
# from pathlib import Path
# from django.conf import settings
# import os

# def export_gateway_config():
#     gateway_path = Path("/opt/suite/config/gateway.yaml")

#     with open(gateway_path) as f:
#         gateway = yaml.safe_load(f)

#     equipments = []

#     for entry in gateway.get("equipments", []):
#         items_file = Path(entry["items_file"])

#         if not items_file.exists():
#             items_file = gateway_path.parent / items_file.name

#         with open(items_file) as f:
#             plc_data = yaml.safe_load(f)

#         equipments.append(plc_data)

#     return {
#         "tenant": gateway["gateway"]["tenant"],
#         "equipments": equipments
#     }