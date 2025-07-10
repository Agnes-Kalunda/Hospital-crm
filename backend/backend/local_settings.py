import os
from datetime import timedelta

# Database configuration for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'hospital',
        'USER': 'postgres',  
        'PASSWORD': 'password', 
        'HOST': 'localhost',  
        'PORT': '5432',
    }
}


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}


DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
