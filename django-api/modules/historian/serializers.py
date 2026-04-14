from rest_framework import serializers
from .models import HistorianDashboard


class HistorianDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorianDashboard
        fields = ['id', 'title', 'description', 'widgets', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
