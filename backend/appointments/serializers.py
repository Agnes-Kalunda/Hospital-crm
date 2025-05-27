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
        doctor = data.get('doctor')
        appointment_datetime = data.get('appointment_datetime')
        appointment_id = self.instance.id if self.instance else None
        
        if timezone.is_naive(appointment_datetime):
            appointment_datetime = timezone.make_aware(appointment_datetime)
        
        if appointment_datetime < timezone.now():
            raise serializers.ValidationError("Cannot schedule appointments in the past")
        
        appointment_day = appointment_datetime.strftime('%a').upper()[:3]
        doctor_availabilities = doctor.availabilities.filter(day_of_week=appointment_day)
        
        if not doctor_availabilities.exists():
            raise serializers.ValidationError(f"Doctor is not available on {appointment_datetime.strftime('%A')}")
        
        local_appointment_datetime = timezone.localtime(appointment_datetime)
        appointment_time = local_appointment_datetime.time()
        availability = doctor_availabilities.first()
        
        print(f"Appointment time: {appointment_time.strftime('%H:%M')}")
        print(f"Doctor available from: {availability.start_time.strftime('%H:%M')} to {availability.end_time.strftime('%H:%M')}")
        
        appt_minutes = appointment_time.hour * 60 + appointment_time.minute
        start_minutes = availability.start_time.hour * 60 + availability.start_time.minute
        end_minutes = availability.end_time.hour * 60 + availability.end_time.minute
        
        if appt_minutes < start_minutes or appt_minutes > end_minutes:
            raise serializers.ValidationError(
                f"Appointment time must be between {availability.start_time.strftime('%H:%M')} and {availability.end_time.strftime('%H:%M')}")
        
        appointment_end = appointment_datetime + datetime.timedelta(minutes=30)
        
        conflicting_appointments = Appointment.objects.filter(
            doctor=doctor,
            status='SCHEDULED',
            appointment_datetime__lt=appointment_end,
            appointment_datetime__gt=appointment_datetime - datetime.timedelta(minutes=30)
        )
        
        print(f"Conflicting appointments found: {conflicting_appointments.exists()}")
        if conflicting_appointments.exists():
            print(f"Conflict with: {conflicting_appointments.first().appointment_datetime}")
        
        if appointment_id:
            conflicting_appointments = conflicting_appointments.exclude(id=appointment_id)
        
        if conflicting_appointments.exists():
            raise serializers.ValidationError(
                "This time slot conflicts with an existing appointment. Please select another time.")
        
        return data