from rest_framework import serializers
from .models import MedicalRecord
from patients.serializers import PatientListSerializer
from appointments.serializers import AppointmentSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_details = PatientListSerializer(source='patient', read_only=True)
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'