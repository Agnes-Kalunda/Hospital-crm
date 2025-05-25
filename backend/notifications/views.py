from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'appointment', 'notification_type', 'status']
    
    @action(detail=False, methods=['get'])
    def patient_notifications(self, request):
        patient_id = request.query_params.get('patient_id', None)
        if not patient_id:
            return Response({"detail": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        notifications = Notification.objects.filter(patient_id=patient_id)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)