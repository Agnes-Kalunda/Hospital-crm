from django.contrib import admin
from .models import MedicalRecord

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'created_at', 'created_by']
    list_filter = ['created_at', 'doctor', 'created_by']
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name', 'diagnosis']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('patient', 'appointment', 'doctor')
        }),
        ('Medical Details', {
            'fields': ('diagnosis', 'symptoms', 'prescription', 'notes')
        }),
        ('Record Information', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )