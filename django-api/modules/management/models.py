from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

    
class Project(models.Model):
    name = models.CharField(max_length=100, unique=True)
    client = models.CharField(max_length=100, unique=True)
    date_created = models.DateField(blank=True, null=True)
    date_estimated_start = models.DateField(blank=True, null=True)
    date_estimated_end = models.DateField(blank=True, null=True)
    date_start = models.DateField(blank=True, null=True)
    date_end = models.DateField(blank=True, null=True)
    priority = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    def __str__(self):
        return self.name
    
    
class Employee(models.Model):
    name = models.CharField(max_length=100, unique=True)
    company = models.CharField(max_length=100, unique=True)
    role = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name
    
class Task(models.Model):
    TASK_STATUS = [
        ("Sin-empezar", "Sin-empezar"),
        ("En-proceso", "En-proceso"),
        ("Pendiente-revision", "Pendiente-revision"),
        ("Validado", "Validado"),
        ("Hacer-cambios", "Hacer-cambios"),
        ("Finalizado", "Finalizado")
    ]
    name = models.CharField(max_length=100, unique=True)
    employees = models.ManyToManyField(Employee)
    status = models.CharField(max_length=50, choices=TASK_STATUS)
    date_created = models.DateField(blank=True, null=True)
    date_estimated_start = models.DateField(blank=True, null=True)
    date_estimated_end = models.DateField(blank=True, null=True)
    date_start = models.DateField(blank=True, null=True)
    date_end = models.DateField(blank=True, null=True)
    priority = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    fk_project = models.ForeignKey(Project, on_delete=models.PROTECT)
    def __str__(self):
        return self.name



