from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Appointment
from .serializers import AppointmentSerializer
from notifications.models import Notification

# Create your views here.

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['patient', 'doctor', 'status']
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name']
    
    def get_queryset(self):
        queryset = Appointment.objects.all()
        
        
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(appointment_datetime__date=date)
            
        # upcoming appointments
        upcoming = self.request.query_params.get('upcoming', None)
        if upcoming == 'true':
            queryset = queryset.filter(appointment_datetime__gt=timezone.now())
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value:
            return Response({"detail": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        if status_value not in [choice[0] for choice in Appointment.STATUS_CHOICES]:
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = status_value
        appointment.save()
        
        # notification for status change
        if status_value == 'CANCELLED':
            Notification.objects.create(
                patient=appointment.patient,
                appointment=appointment,
                notification_type='APPOINTMENT_CANCELLATION',
                message=f"Your appointment with {appointment.doctor} on {appointment.appointment_datetime.strftime('%B %d, %Y at %I:%M %p')} has been cancelled."
            )
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        appointment = serializer.save()
        
        # confirmation notification
        Notification.objects.create(
            patient=appointment.patient,
            appointment=appointment,
            notification_type='APPOINTMENT_CONFIRMATION',
            message=f"Your appointment with {appointment.doctor} has been scheduled for {appointment.appointment_datetime.strftime('%B %d, %Y at %I:%M %p')}."
        )
