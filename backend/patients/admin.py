from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    list_filter = ['date_of_birth', 'insurance_provider', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'date_of_birth', 'email', 'phone', 'address')
        }),
        ('Insurance Information', {
            'fields': ('insurance_provider', 'insurance_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )