
from django.core.management.base import BaseCommand
from authentication.models import User
from doctors.models import Doctor

class Command(BaseCommand):
    help = 'Link a doctor record to a user account'

    def add_arguments(self, parser):
        parser.add_argument('doctor_id', type=int)
        parser.add_argument('username', type=str)
        parser.add_argument('password', type=str)
        parser.add_argument('--create', action='store_true', help='Create a new user if not exists')

    def handle(self, *args, **kwargs):
        doctor_id = kwargs['doctor_id']
        username = kwargs['username']
        password = kwargs['password']
        create = kwargs['create']
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Doctor with ID {doctor_id} does not exist'))
            return
            
        user = None
        try:
            user = User.objects.get(username=username)
            if user.role != 'DOCTOR':
                user.role = 'DOCTOR'
                user.save()
                self.stdout.write(self.style.WARNING(f'Updated existing user {username} role to DOCTOR'))
        except User.DoesNotExist:
            if create:
                user = User.objects.create(
                    username=username,
                    email=doctor.email,
                    first_name=doctor.first_name,
                    last_name=doctor.last_name,
                    role='DOCTOR'
                )
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created new user {username} for doctor {doctor}'))
            else:
                self.stdout.write(self.style.ERROR(f'User {username} does not exist. Use --create to create a new user'))
                return
        
        
        self.stdout.write(self.style.SUCCESS(f'Successfully linked doctor {doctor} to user {user}'))