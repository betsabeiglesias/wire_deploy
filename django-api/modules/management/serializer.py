from rest_framework import serializers
from .models import Task, Employee, Project


class TaskSerializer(serializers.ModelSerializer):
    employees = serializers.StringRelatedField(many=True)  
    fk_project = serializers.StringRelatedField()           

    class Meta:
        model = Task
        fields = "__all__"
