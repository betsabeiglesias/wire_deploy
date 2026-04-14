# modules/historian/admin.py

from django.contrib import admin
from .models import HistorianDashboard

admin.site.register(HistorianDashboard)