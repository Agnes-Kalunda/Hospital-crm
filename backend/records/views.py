from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Doctor
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer

# Create your views here.
class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient', 'appointment']
    
    @action(detail=False, methods=['get'])
    def patient_records(self, request):
        patient_id = request.query_params.get('patient_id', None)
        if not patient_id:
            return Response({"detail": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        records = MedicalRecord.objects.filter(patient_id=patient_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
        
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)
        
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
        
        
        
    def perform_create(self, serializer):
        try:
            doctor = Doctor.objects.get(user=self.request.user.id)
            serializer.save(
                doctor=doctor,
                created_by=self.request.user, 
                updated_by=self.request.user
            )
        except Doctor.DoesNotExist:
            serializer.save(
                created_by=self.request.user, 
                updated_by=self.request.user
            )