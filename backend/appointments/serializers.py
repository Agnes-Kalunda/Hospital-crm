from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientListSerializer
from doctors.serializers import DoctorListSerializer
from django.utils import timezone
import datetime

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientListSerializer(source='patient', read_only=True)
    doctor_details = DoctorListSerializer(source='doctor', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        
    def validate(self, data):
        """
        Custom validation for appointments.
        """
        # get the doctor and appointment time from request
        doctor = data.get('doctor')
        appointment_datetime = data.get('appointment_datetime')
        appointment_id = self.instance.id if self.instance else None
        
    
        if appointment_datetime < timezone.now():
            raise serializers.ValidationError("Cannot schedule appointments in the past")
        
        # check if appointment falls on day the doctor is available
        appointment_day = appointment_datetime.strftime('%a').upper()[:3]
        doctor_availabilities = doctor.availabilities.filter(day_of_week=appointment_day)
        
        if not doctor_availabilities.exists():
            raise serializers.ValidationError(f"Doctor is not available on {appointment_datetime.strftime('%A')}")
        
    
        appointment_time = appointment_datetime.time()
        availability = doctor_availabilities.first()
        
        if appointment_time < availability.start_time or appointment_time > availability.end_time:
            raise serializers.ValidationError(
                f"Appointment time must be between {availability.start_time} and {availability.end_time}")
        
        
        appointment_end = appointment_datetime + datetime.timedelta(minutes=30)
        
        conflicting_appointments = Appointment.objects.filter(
            doctor=doctor,
            status='SCHEDULED',
            appointment_datetime__lt=appointment_end,
            appointment_datetime__gt=appointment_datetime - datetime.timedelta(minutes=30)
        )
        
    
        if appointment_id:
            conflicting_appointments = conflicting_appointments.exclude(id=appointment_id)
        
        if conflicting_appointments.exists():
            raise serializers.ValidationError(
                "This time slot conflicts with an existing appointment. Please select another time.")
        
        return data