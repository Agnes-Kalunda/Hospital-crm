from rest_framework import serializers
from .models import Notification
from patients.serializers import PatientSerializer
from appointments.serializers import AppointmentSerializer

class NotificationSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'