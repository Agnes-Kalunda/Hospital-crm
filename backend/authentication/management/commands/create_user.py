
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from doctors.models import Doctor

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a new user (staff or doctor)'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('password', type=str)
        parser.add_argument('first_name', type=str)
        parser.add_argument('last_name', type=str)
        parser.add_argument('--role', type=str, default='STAFF', choices=['STAFF', 'DOCTOR'])
        parser.add_argument('--specialization', type=str, help='Required if role is DOCTOR')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        role = options['role']
        specialization = options.get('specialization')

        if role == 'DOCTOR' and not specialization:
            self.stderr.write(self.style.ERROR('Specialization is required for doctors'))
            return

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role
            )
            
            if role == 'DOCTOR':
                Doctor.objects.create(
                    user=user,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    specialization=specialization
                )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created {role} user: {username}'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error creating user: {str(e)}'))