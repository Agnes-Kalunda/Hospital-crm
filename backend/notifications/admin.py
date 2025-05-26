from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'notification_type', 'status', 'created_at', 'sent_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['patient__first_name', 'patient__last_name', 'message']
    readonly_fields = ['created_at', 'sent_at']
    list_editable = ['status']
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('patient', 'appointment', 'notification_type', 'message')
        }),
        ('Status & Timing', {
            'fields': ('status', 'created_at', 'sent_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient', 'appointment')