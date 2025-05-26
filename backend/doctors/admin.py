from django.contrib import admin
from .models import Doctor, Availability

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'specialization', 'phone']
    search_fields = ['first_name', 'last_name', 'email', 'specialization']
    list_filter = ['specialization', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'day_of_week', 'start_time', 'end_time']
    list_filter = ['day_of_week', 'doctor']
    search_fields = ['doctor__first_name', 'doctor__last_name']