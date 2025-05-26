
from django.core.management.base import BaseCommand
import os
from dotenv import load_dotenv

class Command(BaseCommand):
    help = 'Check if all required environment variables are set'

    def handle(self, *args, **options):
        load_dotenv()
        
        required_vars = [
            'SECRET_KEY',
            'DB_ENGINE',
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD',
            'DB_HOST',
            'DB_PORT',
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            self.stdout.write(self.style.ERROR(f'The following environment variables are missing: {", ".join(missing_vars)}'))
            self.stdout.write(self.style.WARNING('Please create a .env file in the project root with these variables.'))
        else:
            self.stdout.write(self.style.SUCCESS('All required environment variables are set!'))
            
           
            self.stdout.write(self.style.SUCCESS('Database connection info:'))
            self.stdout.write(f'Engine: {os.getenv("DB_ENGINE")}')
            self.stdout.write(f'Name: {os.getenv("DB_NAME")}')
            self.stdout.write(f'User: {os.getenv("DB_USER")}')
            self.stdout.write(f'Host: {os.getenv("DB_HOST")}')
            self.stdout.write(f'Port: {os.getenv("DB_PORT")}')