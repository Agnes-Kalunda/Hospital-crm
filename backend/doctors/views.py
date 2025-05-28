from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import datetime

from .models import Doctor, Availability
from .serializers import DoctorSerializer, DoctorListSerializer, AvailabilitySerializer
from patients.models import Patient
from patients.serializers import PatientListSerializer
from records.models import MedicalRecord
from records.serializers import MedicalRecordSerializer
from appointments.models import Appointment

class DoctorViewSet(viewsets.ModelViewSet):
   queryset = Doctor.objects.all()
   permission_classes = [IsAuthenticated]
   filter_backends = [DjangoFilterBackend, filters.SearchFilter]
   filterset_fields = ['specialization']
   search_fields = ['first_name', 'last_name', 'specialization']
   
   def get_serializer_class(self):
       if self.action == 'list':
           return DoctorListSerializer
       return DoctorSerializer
   
   @action(detail=True, methods=['get'])
   def availabilities(self, request, pk=None):
       doctor = self.get_object()
       availabilities = doctor.availabilities.all()
       serializer = AvailabilitySerializer(availabilities, many=True)
       return Response(serializer.data)
   
   @action(detail=True, methods=['post'])
   def add_availability(self, request, pk=None):
       doctor = self.get_object()
       serializer = AvailabilitySerializer(data=request.data)
       if serializer.is_valid():
           if 'specific_date' in serializer.validated_data and serializer.validated_data['specific_date']:
               existing = Availability.objects.filter(
                   doctor=doctor,
                   specific_date=serializer.validated_data['specific_date']
               ).first()
               
               if existing:
                   existing.delete()
           else:
               existing = Availability.objects.filter(
                   doctor=doctor,
                   day_of_week=serializer.validated_data['day_of_week'],
                   specific_date__isnull=True
               ).first()
               
               if existing:
                   existing.delete()
                   
           serializer.save(doctor=doctor)
           return Response(serializer.data, status=status.HTTP_201_CREATED)
       return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
   @action(detail=True, methods=['delete'])
   def remove_availability(self, request, pk=None):
       doctor = self.get_object()
       try:
           availability_id = request.query_params.get('availability_id')
           availability = Availability.objects.get(id=availability_id, doctor=doctor)
           availability.delete()
           return Response(status=status.HTTP_204_NO_CONTENT)
       except Availability.DoesNotExist:
           return Response({"detail": "Availability not found."}, status=status.HTTP_404_NOT_FOUND)
   
   @action(detail=True, methods=['get'])
   def available_slots(self, request, pk=None):
       doctor = self.get_object()
       date_str = request.query_params.get('date', None)
       
       if not date_str:
           return Response({"detail": "Date parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
       
       try:
           date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
       except ValueError:
           return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
       
       specific_availability = Availability.objects.filter(
           doctor=doctor,
           specific_date=date
       ).first()
       
       if specific_availability:
           availability = specific_availability
       else:
           day_of_week = date.strftime('%a').upper()[:3]
           
           try:
               availability = doctor.availabilities.get(day_of_week=day_of_week, specific_date__isnull=True)
           except Availability.DoesNotExist:
               return Response({"detail": f"Doctor is not available on {date.strftime('%A')}s."}, 
                              status=status.HTTP_404_NOT_FOUND)
       
       start_time = datetime.datetime.combine(date, availability.start_time)
       end_time = datetime.datetime.combine(date, availability.end_time)
       
       now = timezone.now()
       if date == now.date() and start_time < now:
           start_time = now.replace(minute=0, second=0, microsecond=0) + datetime.timedelta(hours=1)
       
       time_slots = []
       current = start_time
       
       while current <= end_time - datetime.timedelta(minutes=30):
           time_slots.append(current)
           current += datetime.timedelta(minutes=30)
       
       booked_appointments = Appointment.objects.filter(
           doctor=doctor,
           appointment_datetime__date=date,
           status='SCHEDULED'
       ).values_list('appointment_datetime', flat=True)
       
       available_slots = [slot for slot in time_slots 
                         if slot not in booked_appointments]
       
       formatted_slots = [slot.strftime('%H:%M') for slot in available_slots]
       
       return Response({
           "date": date_str,
           "day_of_week": date.strftime('%A'),
           "available_slots": formatted_slots
       })
   
   @action(detail=False, methods=['get'])
   def my_patients(self, request):
       try:
           doctor = Doctor.objects.get(user=request.user)
           
           patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient', flat=True).distinct()
           patients = Patient.objects.filter(id__in=patient_ids)
           
           serializer = PatientListSerializer(patients, many=True)
           return Response(serializer.data)
       except Doctor.DoesNotExist:
           return Response({"detail": "No doctor profile linked to your account."}, status=status.HTTP_404_NOT_FOUND)

   @action(detail=False, methods=['get'])
   def my_records(self, request):
       try:
           doctor = Doctor.objects.get(user=request.user)
           
           patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient', flat=True).distinct()
           records = MedicalRecord.objects.filter(patient__id__in=patient_ids)
           
           serializer = MedicalRecordSerializer(records, many=True)
           return Response(serializer.data)
       except Doctor.DoesNotExist:
           return Response({"detail": "No doctor profile linked to your account."}, status=status.HTTP_404_NOT_FOUND)
       
   @action(detail=False, methods=['get'])
   def my_appointments(self, request):
       try:
           doctor = Doctor.objects.get(user=request.user)
           
           appointments = Appointment.objects.filter(doctor=doctor).order_by('-appointment_datetime')
           
           date = request.query_params.get('date', None)
           if date:
               appointments = appointments.filter(appointment_datetime__date=date)
           
           from appointments.serializers import AppointmentSerializer
           serializer = AppointmentSerializer(appointments, many=True)
           return Response(serializer.data)
       
       except Doctor.DoesNotExist:
           return Response({"detail": "No doctor profile linked to your account."}, status=status.HTTP_404_NOT_FOUND)