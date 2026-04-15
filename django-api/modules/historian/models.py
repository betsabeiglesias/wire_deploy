import uuid
from django.db import models
from django.conf import settings


class HistorianDashboard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='historian_dashboards',
    )
    title = models.CharField(max_length=256)
    description = models.TextField(blank=True, default='')
    widgets = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'historian'
        ordering = ['-updated_at']

    def __str__(self):
        return f'[{self.user}] {self.title}'
