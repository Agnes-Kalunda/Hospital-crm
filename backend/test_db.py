import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError

try:
    connection = connections['default']
    connection.cursor()
    print("Database connection successful!")
except OperationalError as e:
    print(f"Database connection failed: {e}")
