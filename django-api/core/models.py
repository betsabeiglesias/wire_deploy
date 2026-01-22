# core/models.py
from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    id = models.CharField(primary_key=True, max_length=50)
    name = models.CharField(max_length=100)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     client = models.ForeignKey(Client, on_delete=models.PROTECT)

#     def __str__(self):
#         return f"{self.user.username} → {self.client.id}"
    
class User(AbstractUser):
    client = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name="users"
    )