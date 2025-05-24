from django.db import models
from patients.models import Patient
from appointments.models import Appointment

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('APPOINTMENT_REMINDER', 'Appointment Reminder'),
        ('APPOINTMENT_CONFIRMATION', 'Appointment Confirmation'),
        ('APPOINTMENT_CANCELLATION', 'Appointment Cancellation'),
        ('GENERAL', 'General Notification'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='notifications')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=25, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_notification_type_display()} for {self.patient}"