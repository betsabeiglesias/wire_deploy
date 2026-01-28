from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Client, Role, ClientMembership

class ClientMembershipInline(admin.StackedInline):
    model = ClientMembership
    extra = 1  # Obliga a que aparezca el selector de cliente
    max_num = 1
    can_delete = False
    verbose_name = "Asignación de Cliente"

class UserAdmin(BaseUserAdmin):
    inlines = (ClientMembershipInline,)
    list_display = BaseUserAdmin.list_display + ('get_client',)

    def get_client(self, obj):
        membership = obj.memberships.first()
        return membership.client.name if membership else "⚠️ SIN CLIENTE"
    get_client.short_description = 'Cliente'

# Reiniciamos el registro del modelo User nativo
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Registros estándar para los maestros
admin.site.register(Client)
admin.site.register(Role)