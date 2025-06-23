from django.contrib import admin
from .models import Filme,Usuario,Episodio
from django.contrib.auth.admin import UserAdmin
# Register your models here.


campos = list(UserAdmin.fieldsets)
campos.append(
    ("Histórico", {'fields': ('filmes_vistos',)})
)
UserAdmin.fieldsets = tuple(campos)

admin.site.register(Filme)
admin.site.register(Episodio)
admin.site.register(Usuario,UserAdmin)