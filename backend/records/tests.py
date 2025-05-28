# records/tests.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime
import json

from patients.models import Patient
from doctors.models import Doctor, Availability
from appointments.models import Appointment
from records.models import MedicalRecord


User = get_user_model()

class ModelTests(TestCase):
   def setUp(self):
       self.user = User.objects.create_user(
           username='testuser',
           email='test@example.com',
           password='testpassword',
           first_name='Test',
           last_name='User',
           role='STAFF'
       )
       
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpassword',
           first_name='Doctor',
           last_name='User',
           role='DOCTOR'
       )
       
       self.patient = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com',
           phone='1234567890'
       )
       
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           phone='0987654321',
           user=self.doctor_user
       )
       
       self.availability = Availability.objects.create(
           doctor=self.doctor,
           day_of_week='MON',
           start_time=datetime.time(9, 0),
           end_time=datetime.time(17, 0)
       )
       
       self.appointment = Appointment.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment_datetime=timezone.now() + datetime.timedelta(days=1),
           status='SCHEDULED',
           reason='Annual checkup'
       )
       
       self.medical_record = MedicalRecord.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment=self.appointment,
           diagnosis='Hypertension',
           symptoms='Headache, dizziness',
           prescription='Lisinopril 10mg daily',
           notes='Follow up in 3 months',
           created_by=self.user,
           updated_by=self.user
       )
       
      
   def test_user_creation(self):
       self.assertEqual(self.user.username, 'testuser')
       self.assertEqual(self.user.email, 'test@example.com')
       self.assertEqual(self.user.role, 'STAFF')
       self.assertTrue(self.user.check_password('testpassword'))

   def test_patient_creation(self):
       self.assertEqual(self.patient.first_name, 'John')
       self.assertEqual(self.patient.last_name, 'Doe')
       self.assertEqual(self.patient.email, 'john.doe@example.com')
       self.assertEqual(str(self.patient), f"JohnDoe")

   def test_doctor_creation(self):
       self.assertEqual(self.doctor.first_name, 'Jane')
       self.assertEqual(self.doctor.last_name, 'Smith')
       self.assertEqual(self.doctor.specialization, 'Cardiology')
       self.assertEqual(str(self.doctor), f"Dr. Jane Smith")

   def test_availability_creation(self):
       self.assertEqual(self.availability.doctor, self.doctor)
       self.assertEqual(self.availability.day_of_week, 'MON')
       self.assertEqual(self.availability.start_time.hour, 9)
       self.assertEqual(self.availability.start_time.minute, 0)
       self.assertEqual(self.availability.end_time.hour, 17)
       self.assertEqual(self.availability.end_time.minute, 0)

   def test_appointment_creation(self):
       self.assertEqual(self.appointment.patient, self.patient)
       self.assertEqual(self.appointment.doctor, self.doctor)
       self.assertEqual(self.appointment.status, 'SCHEDULED')
       self.assertEqual(str(self.appointment), f"{self.patient} with {self.doctor} on {self.appointment.appointment_datetime}")

   def test_medical_record_creation(self):
       self.assertEqual(self.medical_record.patient, self.patient)
       self.assertEqual(self.medical_record.doctor, self.doctor)
       self.assertEqual(self.medical_record.diagnosis, 'Hypertension')
       self.assertEqual(self.medical_record.symptoms, 'Headache, dizziness')
       self.assertEqual(self.medical_record.prescription, 'Lisinopril 10mg daily')

  
   def test_appointment_is_upcoming(self):
       self.assertTrue(self.appointment.is_upcoming())
       past_appointment = Appointment.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment_datetime=timezone.now() - datetime.timedelta(days=1),
           status='COMPLETED'
       )
       self.assertFalse(past_appointment.is_upcoming())

   def test_model_relationships(self):
       self.assertEqual(self.appointment.patient, self.patient)
       self.assertEqual(self.appointment.doctor, self.doctor)
       self.assertEqual(self.medical_record.patient, self.patient)
       self.assertEqual(self.medical_record.doctor, self.doctor)
       self.assertEqual(self.medical_record.appointment, self.appointment)



class UserAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           role='DOCTOR'
       )

   def test_user_login(self):
       response = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       })
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertIn('access', response.data)
       self.assertIn('refresh', response.data)
       
       response = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'wrongpassword'
       })
       self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

   def test_user_details(self):
       token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
       
       response = self.client.get('/api/auth/user/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(response.data['username'], 'staffuser')
       self.assertEqual(response.data['email'], 'staff@example.com')
       self.assertEqual(response.data['role'], 'STAFF')
       
   def test_token_refresh(self):
       tokens = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data
       
       response = self.client.post('/api/auth/token/refresh/', {
           'refresh': tokens['refresh']
       })
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertIn('access', response.data)


class PatientAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       self.patient = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com',
           phone='1234567890'
       )
       self.token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

   def test_get_patients_list(self):
       response = self.client.get('/api/patients/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)
       self.assertEqual(response.data[0]['first_name'], 'John')

   def test_get_patient_detail(self):
       response = self.client.get(f'/api/patients/{self.patient.id}/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(response.data['first_name'], 'John')
       self.assertEqual(response.data['last_name'], 'Doe')
       self.assertEqual(response.data['email'], 'john.doe@example.com')

   def test_create_patient(self):
       new_patient_data = {
           'first_name': 'Jane',
           'last_name': 'Smith',
           'date_of_birth': '1992-05-15',
           'email': 'jane.smith@example.com',
           'phone': '5551234567'
       }
       response = self.client.post('/api/patients/', new_patient_data)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(Patient.objects.count(), 2)
       self.assertEqual(response.data['first_name'], 'Jane')
       self.assertEqual(response.data['last_name'], 'Smith')

   def test_update_patient(self):
       update_data = {'phone': '9876543210'}
       response = self.client.patch(f'/api/patients/{self.patient.id}/', update_data)
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.patient.refresh_from_db()
       self.assertEqual(self.patient.phone, '9876543210')

   def test_delete_patient(self):
       response = self.client.delete(f'/api/patients/{self.patient.id}/')
       self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
       self.assertEqual(Patient.objects.count(), 0)


class DoctorAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           role='DOCTOR'
       )
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           phone='0987654321',
           user=self.doctor_user
       )
       self.availability = Availability.objects.create(
           doctor=self.doctor,
           day_of_week='MON',
           start_time=datetime.time(9, 0),
           end_time=datetime.time(17, 0)
       )
       self.token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

   def test_get_doctors_list(self):
       response = self.client.get('/api/doctors/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)
       self.assertEqual(response.data[0]['first_name'], 'Jane')

   def test_get_doctor_detail(self):
       response = self.client.get(f'/api/doctors/{self.doctor.id}/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(response.data['first_name'], 'Jane')
       self.assertEqual(response.data['last_name'], 'Smith')
       self.assertEqual(response.data['specialization'], 'Cardiology')

   def test_create_doctor(self):
       new_doctor_data = {
           'first_name': 'John',
           'last_name': 'Doe',
           'email': 'john.doe@example.com',
           'specialization': 'Neurology',
           'phone': '5551234567'
       }
       response = self.client.post('/api/doctors/', new_doctor_data)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(Doctor.objects.count(), 2)
       self.assertEqual(response.data['first_name'], 'John')
       self.assertEqual(response.data['specialization'], 'Neurology')

   def test_update_doctor(self):
       update_data = {'specialization': 'Pediatrics'}
       response = self.client.patch(f'/api/doctors/{self.doctor.id}/', update_data)
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.doctor.refresh_from_db()
       self.assertEqual(self.doctor.specialization, 'Pediatrics')

   def test_get_doctor_availabilities(self):
       response = self.client.get(f'/api/doctors/{self.doctor.id}/availabilities/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)
       self.assertEqual(response.data[0]['day_of_week'], 'MON')

   def test_add_doctor_availability(self):
       new_availability = {
           'day_of_week': 'TUE',
           'start_time': '10:00',
           'end_time': '18:00'
       }
       response = self.client.post(f'/api/doctors/{self.doctor.id}/add_availability/', new_availability)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(Availability.objects.count(), 2)
       self.assertEqual(response.data['day_of_week'], 'TUE')

   def test_get_available_slots(self):
       tomorrow = (timezone.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
       if (timezone.now() + datetime.timedelta(days=1)).strftime('%a').upper()[:3] == 'MON':
           response = self.client.get(f'/api/doctors/{self.doctor.id}/available_slots/?date={tomorrow}')
           self.assertEqual(response.status_code, status.HTTP_200_OK)
           self.assertIn('available_slots', response.data)
           self.assertIn('day_of_week', response.data)
           self.assertEqual(response.data['day_of_week'], 'Monday')


class AppointmentAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           role='DOCTOR'
       )
       self.patient = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com'
       )
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           user=self.doctor_user
       )
       self.availability = Availability.objects.create(
           doctor=self.doctor,
           day_of_week='MON',
           start_time=datetime.time(9, 0),
           end_time=datetime.time(17, 0)
       )
       self.appointment = Appointment.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment_datetime=timezone.now() + datetime.timedelta(days=1),
           status='SCHEDULED',
           reason='Annual checkup'
       )
       self.token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

   def test_get_appointments_list(self):
       response = self.client.get('/api/appointments/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)

   def test_get_appointment_detail(self):
       response = self.client.get(f'/api/appointments/{self.appointment.id}/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(response.data['status'], 'SCHEDULED')
       self.assertEqual(response.data['reason'], 'Annual checkup')

   def test_create_appointment(self):
       appointment_datetime = (timezone.now() + datetime.timedelta(days=2)).isoformat()
       new_appointment_data = {
           'patient': self.patient.id,
           'doctor': self.doctor.id,
           'appointment_datetime': appointment_datetime,
           'status': 'SCHEDULED',
           'reason': 'Follow-up'
       }
       response = self.client.post('/api/appointments/', new_appointment_data)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(Appointment.objects.count(), 2)
       self.assertEqual(response.data['reason'], 'Follow-up')

   def test_update_appointment_status(self):
       update_data = {'status': 'COMPLETED'}
       response = self.client.patch(f'/api/appointments/{self.appointment.id}/update_status/', update_data)
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.appointment.refresh_from_db()
       self.assertEqual(self.appointment.status, 'COMPLETED')


class MedicalRecordAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           role='DOCTOR'
       )
       self.patient = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com'
       )
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           user=self.doctor_user
       )
       self.appointment = Appointment.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment_datetime=timezone.now() + datetime.timedelta(days=1),
           status='SCHEDULED',
           reason='Annual checkup'
       )
       self.medical_record = MedicalRecord.objects.create(
           patient=self.patient,
           doctor=self.doctor,
           appointment=self.appointment,
           diagnosis='Hypertension',
           symptoms='Headache, dizziness',
           prescription='Lisinopril 10mg daily',
           created_by=self.staff_user,
           updated_by=self.staff_user
       )
       self.token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

   def test_get_records_list(self):
       response = self.client.get('/api/records/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)

   def test_get_record_detail(self):
       response = self.client.get(f'/api/records/{self.medical_record.id}/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(response.data['diagnosis'], 'Hypertension')
       self.assertEqual(response.data['symptoms'], 'Headache, dizziness')
       self.assertEqual(response.data['prescription'], 'Lisinopril 10mg daily')

   def test_create_record(self):
       new_record_data = {
           'patient': self.patient.id,
           'doctor': self.doctor.id,
           'diagnosis': 'Diabetes',
           'symptoms': 'Increased thirst, frequent urination',
           'prescription': 'Metformin 500mg twice daily'
       }
       response = self.client.post('/api/records/', new_record_data)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(MedicalRecord.objects.count(), 2)
       self.assertEqual(response.data['diagnosis'], 'Diabetes')


   def test_patient_records(self):
       response = self.client.get(f'/api/records/patient_records/?patient_id={self.patient.id}')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 1)
       self.assertEqual(response.data[0]['diagnosis'], 'Hypertension')


      
class DoctorSpecificAPITests(TestCase):
   def setUp(self):
       self.client = APIClient()
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           first_name='Jane',
           last_name='Smith',
           role='DOCTOR'
       )
       
       self.patient1 = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com'
       )
       
       self.patient2 = Patient.objects.create(
           first_name='Alice',
           last_name='Johnson',
           date_of_birth='1985-05-15',
           email='alice.johnson@example.com'
       )
       
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           user=self.doctor_user
       )
       
       self.availability = Availability.objects.create(
           doctor=self.doctor,
           day_of_week='MON',
           start_time=datetime.time(9, 0),
           end_time=datetime.time(17, 0)
       )
       
       self.appointment1 = Appointment.objects.create(
           patient=self.patient1,
           doctor=self.doctor,
           appointment_datetime=timezone.now() + datetime.timedelta(days=1),
           status='SCHEDULED',
           reason='Annual checkup'
       )
       
       self.appointment2 = Appointment.objects.create(
           patient=self.patient2,
           doctor=self.doctor,
           appointment_datetime=timezone.now() + datetime.timedelta(days=2),
           status='SCHEDULED',
           reason='Follow-up'
       )
       
       self.medical_record = MedicalRecord.objects.create(
           patient=self.patient1,
           doctor=self.doctor,
           appointment=self.appointment1,
           diagnosis='Hypertension',
           symptoms='Headache, dizziness',
           prescription='Lisinopril 10mg daily',
           created_by=self.doctor_user,
           updated_by=self.doctor_user
       )
       
       self.token = self.client.post('/api/auth/token/', {
           'username': 'doctoruser',
           'password': 'doctorpass123'
       }).data['access']
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

   def test_my_appointments(self):
       response = self.client.get('/api/doctors/my_appointments/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 2)

   def test_my_patients(self):
       response = self.client.get('/api/doctors/my_patients/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertEqual(len(response.data), 2)
       patient_names = [patient['first_name'] for patient in response.data]
       self.assertIn('John', patient_names)
       self.assertIn('Alice', patient_names)

   def test_my_records(self):
       response = self.client.get('/api/doctors/my_records/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       self.assertGreaterEqual(len(response.data), 1)
       self.assertEqual(response.data[0]['diagnosis'], 'Hypertension')

   def test_create_medical_record_as_doctor(self):
       new_record_data = {
           'patient': self.patient2.id,
           'diagnosis': 'Common cold',
           'symptoms': 'Runny nose, cough',
           'prescription': 'Rest and fluids'
       }
       response = self.client.post('/api/records/', new_record_data)
       self.assertEqual(response.status_code, status.HTTP_201_CREATED)
       self.assertEqual(MedicalRecord.objects.count(), 2)
       record = MedicalRecord.objects.get(id=response.data['id'])
       self.assertEqual(record.doctor, self.doctor)
       self.assertEqual(record.patient, self.patient2)
       self.assertEqual(record.diagnosis, 'Common cold')

   def test_available_slots_for_my_schedule(self):
       tomorrow = (timezone.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
       if (timezone.now() + datetime.timedelta(days=1)).strftime('%a').upper()[:3] == 'MON':
           response = self.client.get(f'/api/doctors/{self.doctor.id}/available_slots/?date={tomorrow}')
           self.assertEqual(response.status_code, status.HTTP_200_OK)
           self.assertIn('available_slots', response.data)
           self.assertIn('day_of_week', response.data)
           self.assertEqual(response.data['day_of_week'], 'Monday')


class PermissionTests(TestCase):
   def setUp(self):
       self.client = APIClient()
       
       self.staff_user = User.objects.create_user(
           username='staffuser',
           email='staff@example.com',
           password='staffpass123',
           role='STAFF'
       )
       
       
       self.doctor_user = User.objects.create_user(
           username='doctoruser',
           email='doctor@example.com',
           password='doctorpass123',
           role='DOCTOR'
       )
       
       self.patient = Patient.objects.create(
           first_name='John',
           last_name='Doe',
           date_of_birth='1990-01-01',
           email='john.doe@example.com'
       )
       
       self.doctor = Doctor.objects.create(
           first_name='Jane',
           last_name='Smith',
           email='jane.smith@example.com',
           specialization='Cardiology',
           user=self.doctor_user
       )
       
       self.staff_token = self.client.post('/api/auth/token/', {
           'username': 'staffuser',
           'password': 'staffpass123'
       }).data['access']
       
       self.doctor_token = self.client.post('/api/auth/token/', {
           'username': 'doctoruser',
           'password': 'doctorpass123'
       }).data['access']

   def test_anonymous_user_cannot_access_protected_routes(self):
       self.client.credentials()  # Clear credentials
       
       response = self.client.get('/api/patients/')
       self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
       
       response = self.client.get('/api/doctors/')
       self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
       
       response = self.client.get('/api/appointments/')
       self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
       
       response = self.client.get('/api/records/')
       self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

   def test_doctor_can_access_patient_data(self):
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.doctor_token}')
       
       response = self.client.get('/api/patients/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       
       response = self.client.get(f'/api/patients/{self.patient.id}/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)

   def test_doctor_can_access_own_endpoints(self):
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.doctor_token}')
       
       response = self.client.get('/api/doctors/my_appointments/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       
       response = self.client.get('/api/doctors/my_patients/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)
       
       response = self.client.get('/api/doctors/my_records/')
       self.assertEqual(response.status_code, status.HTTP_200_OK)

   def test_staff_cannot_access_doctor_specific_endpoints(self):
       self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.staff_token}')
       
       response = self.client.get('/api/doctors/my_appointments/')
       self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
       
       response = self.client.get('/api/doctors/my_patients/')
       self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
       
       response = self.client.get('/api/doctors/my_records/')
       self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
       
       
       
       