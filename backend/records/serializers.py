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
        
        
        
    def validate(self, data):
        """
        Custom validation for medical records.
        """

        if not data.get('symptoms') and not data.get('diagnosis'):
            raise serializers.ValidationError("Either symptoms or diagnosis must be provided")
        
        
        appointment = data.get('appointment')
        patient = data.get('patient')
        if appointment and patient and appointment.patient.id != patient.id:
            raise serializers.ValidationError("The appointment must belong to the selected patient")
        
        return data