## Overview

This is a simple web application designed to manage doctor appointments, patient records, and medical information. The system allows staff to schedule appointments, track patient information, and manage doctor availability.

## Live links
After containerization, the application was deployed using an AWS EC2 instance.The containerized application runs on a dedicated EC2 instance, providing reliable access to the hospital management system in a production environment.

http://51.21.130.61   - Main app
http://51.21.130.61/api/    - Api documentation
http://51.21.130.61/admin/    - Django admin

To test the main app as a doctor or staff, use the following registered credentials :

Doctor
username : doctor , doctorTwo || password : kalunda20

Staff
username : staffOne , staffTwo || password : kalunda20



## Technologies Used

*  **Backend**: Django 3.2 with Django REST Framework
*    **Authentication**: JWT (JSON Web Tokens) via SimpleJWT
*   **Database**: postgres
*    **API Documentation**: Swagger/OpenAPI via drf-yasg
*   **Frontend**: React (with tailwind CSS)
*   **Live Deployment**: AWS EC2

## Features

*    User authentication with role-based access control (Staff/Doctor)
*  Patient management
*   Doctor profiles and availability scheduling
 *   Appointment booking with validation
 *   Medical records tracking
 *   Timezone-aware scheduling



## Running the Project Locally

### Prerequisites

*   Python 3.10+
*   Node.js 14+ (for frontend)
 *   Git

### Backend Setup

1.   **Clone the repository**

bash

```bash
git clone https://github.com/Agnes-Kalunda/Hospital-crm.git
cd hospital
```

2.  **Set up a virtual environment**

bash

```bash
cd backend
python -m venv venv
source venv/bin/activate 
```

 3.  **Install dependencies**

bash

```bash
pip install -r requirements.txt
```

4.  **Apply migrations**

bash

```bash
python manage.py migrate
```

5.  **Create a superuser**

bash

```bash
python manage.py createsuperuser
```

6.  **Run the development server**

bash

```bash
python3 manage.py runserver
```

The backend will be available at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### Frontend Setup

1.  **Navigate to the frontend directory**

bash

```bash
cd ../frontend
```

 2.  **Install dependencies**

bash

```bash
npm install
```

3.  **Start the development server**

bash

```bash
npm start
```

The frontend will be available at [http://localhost:3000/](http://localhost:3000/)

## API Documentation

API documentation is available via Swagger UI when the backend server is running:

*  Swagger UI: [http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)


### Authentication

The API uses JWT for authentication. To authenticate:

1.  Obtain a token by sending a POST request to `/api/auth/token/`:

bash

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username", "password":"your_password"}'
```

2.  Use the returned access token in subsequent requests:

bash

```bash
curl -X GET http://127.0.0.1:8000/api/patients/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3.  Refresh tokens when they expire using `/api/auth/token/refresh/`:

bash

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"YOUR_REFRESH_TOKEN"}'
```

### API Endpoints

#### Authentication

 *   `POST /api/auth/token/`: Obtain JWT token
*   `POST /api/auth/token/refresh/`: Refresh JWT token
*   `GET /api/auth/user/`: Get current user details

#### Patients

 *   `GET /api/patients/`: List all patients
*   `POST /api/patients/`: Create a new patient
*   `GET /api/patients/{id}/`: Retrieve a specific patient
*   `PUT /api/patients/{id}/`: Update a specific patient
*   `DELETE /api/patients/{id}/`: Delete a specific patient

#### Doctors

*   `GET /api/doctors/`: List all doctors
*    `POST /api/doctors/`: Create a new doctor
*    `GET /api/doctors/{id}/`: Retrieve a specific doctor
*    `PUT /api/doctors/{id}/`: Update a specific doctor
*    `DELETE /api/doctors/{id}/`: Delete a specific doctor
*    `POST /api/doctors/{id}/add_availability/`: Add availability for a doctor
*   `DELETE /api/doctors/{id}/remove_availability/`: Remove availability for a doctor


#### Appointments

*    `GET /api/appointments/`: List all appointments
*    `POST /api/appointments/`: Create a new appointment
*   `GET /api/appointments/{id}/`: Retrieve a specific appointment
*   `PUT /api/appointments/{id}/`: Update a specific appointment
*   `PATCH /api/appointments/{id}/update_status/`: Update appointment status
*    `DELETE /api/appointments/{id}/`: Delete a specific appointment

#### Medical Records

*   `GET /api/records/`: List all medical records
*   `POST /api/records/`: Create a new medical record
*   `GET /api/records/{id}/`: Retrieve a specific medical record
*   `PUT /api/records/{id}/`: Update a specific medical record
*    `DELETE /api/records/{id}/`: Delete a specific medical record


## Data Models

### User

*   Username, password, email
*   First name, last name
*   Role (Staff/Doctor)

### Patient

*   First name, last name
*   Date of birth
*   Email, phone, address
*    Insurance provider, insurance ID

### Doctor (Linked to users - Role - Doctor)

*    First name, last name
*   Email, phone
*   Specialization, bio

### Availability

*  Doctor (FK)
*   Day of week (MON, TUE, WED, etc.)
*   Start time, end time

### Appointment

*   Patient (FK)
*  Doctor (FK)
*    Appointment datetime
*   Status (SCHEDULED, COMPLETED, CANCELLED)
*   Reason, notes

### Medical Record

*   Patient (FK)
*  Doctor (FK)
*   Appointment (FK)
*   Diagnosis, symptoms, prescription, notes
*   Created by, updated by


## Key Implementation Details

### Appointment Validation

The system validates appointments for:

1.   Time conflicts with existing appointments
1.   Doctor availability on the selected day and time
1.   Prevention of scheduling in the past

### Timezone Handling

All appointments are stored in UTC but displayed in the user's local timezone to prevent scheduling confusion.

### Authentication & Authorization

JWT tokens expire after 1 hour, with refresh tokens valid for 24 hours. Different user roles have different permissions in the system.

## Development Notes

### Adding New Features

1.   Create models in the appropriate app
1.  Create serializers for the models
1.  Create viewsets or API views
1.  Add URLs to the app's urls.py
1.   Update the main urls.py if needed

### Testing the API

To manually test the API endpoints, while inside the ```backend``` folder , run the command below;

```python manage.py test records```

The test file is located inside the records app.
### Common Issues

*   **401 Unauthorized**: Check that you're including the JWT token in the Authorization header with the format: `Bearer YOUR_TOKEN`
*  **400 Bad Request**: Check your request payload against the API documentation
*    **JWT Token Expiration**: JWT tokens expire after 1 hour; use the refresh token to get a new access token

## Areas of improvement with additional time

#### Notification System

*    Real-time notifications for appointments and status changes
*    Email notifications with 
*    SMS integration for urgent communications
*    In-app notification center with read/unread status

#### Improved insurance data collection

#### Improved medical data collection



## Design Decisions

### Backend Architecture (Django)

 1.  **Model Organization**:* *   Organized models into logical apps (patients, doctors, appointments, records) for better code organization and separation of concerns
   * *   Used Django's built-in user model with role-based authentication to distinguish between staff and doctors
 2.  **API Design**:* *   Used Django REST Framework for creating RESTful APIs with proper validation and serialization
     *   Implemented specialized endpoints (like available\_slots) to handle complex business logic
 3.  **Time Zone Handling**:* *   Implemented proper timezone handling to ensure appointment times are correctly interpreted regardless of user location
   * *   Store times in UTC in the database but display them in the user's local timezone
 4.  **Validation Logic**:* *   Added comprehensive validation in the appointment serializer to:* *   Prevent scheduling in the past
       *   Verify doctor availability for the selected day and time
      *   Check for appointment conflicts
       *   Provide clear error messages


### Frontend Architecture (React)

 1.  **Component Structure**:*  *   Organized components by feature (appointments, doctors, patients, records)
     *   Created reusable form components to handle CRUD operations consistently
2.  **Authentication**:* *   Implemented JWT token-based authentication with refresh tokens
    *   Created a centralized authentication context for managing user state
3.  **Route Protection**:* *   Used role-based route protection to restrict access based on user role
    *   Different navigation options for staff vs doctors

4.  **Date and Time Handling**:     
    *   Ensured consistent date/time format between frontend and backend
      *   Implemented proper timezone handling to avoid confusion

## Database Schema

~~~+---------------------+       +---------------------+       +---------------------+
|       User          |       |       Doctor        |       |     Availability    |
+---------------------+       +---------------------+       +---------------------+
| id: int (PK)        |       | id: int (PK)        |       | id: int (PK)        |
| username: varchar   |       | first_name: varchar |       | doctor_id: int (FK) |
| password: varchar   |       | last_name: varchar  |       | day_of_week: varchar|
| email: varchar      |       | email: varchar      |       | start_time: time    |
| first_name: varchar |       | phone: varchar      |       | end_time: time      |
| last_name: varchar  |       | specialization: var |       +---------------------+
| role: varchar       |       | bio: text           |                |
+---------------------+       | created_at: datetime|                |
                             | updated_at: datetime|                |
                             +---------------------+                |
                                       |                           |
                                       |                           |
                                       v                           |
+---------------------+       +---------------------+               |
|      Patient        |       |    Appointment      |<--------------+
+---------------------+       +---------------------+
| id: int (PK)        |       | id: int (PK)        |
| first_name: varchar |------>| patient_id: int (FK)|
| last_name: varchar  |       | doctor_id: int (FK) |<------+
| date_of_birth: date |       | appointment_datetime|       |
| email: varchar      |       | status: varchar     |       |
| phone: varchar      |       | reason: text        |       |
| address: text       |       | notes: text         |       |
| insurance_provider  |       | created_at: datetime|       |
| insurance_id        |       | updated_at: datetime|       |
| created_at: datetime|       +---------------------+       |
| updated_at: datetime|                |                    |
+---------------------+                |                    |
        |                             |                    |
        |                             v                    |
        |                   +---------------------+        |
        |                   |   Notification      |        |
        |                   +---------------------+        |
        +------------------>| id: int (PK)        |        |
                            | patient_id: int (FK)|        |
                            | appointment_id: FK  |        |
                            | notification_type   |        |
                            | message: text       |        |
                            | status: varchar     |        |
                            | created_at: datetime|        |
                            | sent_at: datetime   |        |
                            +---------------------+        |
                                                           |
                                                           |
        +---------------------+                            |
        |   MedicalRecord    |                             |
        +---------------------+                             |
        | id: int (PK)        |                             |
        | patient_id: int (FK)|                             |
        | appointment_id: FK  |-----------------------------+
        | doctor_id: int (FK) |
        | diagnosis: text     |
        | symptoms: text      |
        | prescription: text  |
        | notes: text         |
        | created_at: datetime|
        | updated_at: datetime|
        | created_by: int (FK)|
        | updated_by: int (FK)|
        +---------------------+~~~

 Sequence Diagram for Appointment Booking



~~~┌──────┐          ┌─────────┐          ┌───────┐          ┌───────────┐          ┌───────────────┐
│Client│          │React App│          │Django │          │Doctor API │          │Appointment API│
└──┬───┘          └────┬────┘          │Backend│          └─────┬─────┘          └───────┬───────┘
   │                   │               └───┬───┘                │                        │
   │ 1. Login          │                   │                    │                        │
   │ ─────────────────>│                   │                    │                        │
   │                   │ 2. Authentication │                    │                        │
   │                   │ ────────────────>│                    │                        │
   │                   │ 3. JWT Token     │                    │                        │
   │                   │ <────────────────│                    │                        │
   │ 4. Token          │                   │                    │                        │
   │ <─────────────────│                   │                    │                        │
   │                   │                   │                    │                        │
   │ 5. Select Doctor  │                   │                    │                        │
   │ ─────────────────>│                   │                    │                        │
   │                   │ 6. Get Doctors    │                    │                        │
   │                   │ ─────────────────────────────────────>│                        │
   │                   │ 7. Doctor List    │                    │                        │
   │                   │ <─────────────────────────────────────│                        │
   │ 8. Doctor List    │                   │                    │                        │
   │ <─────────────────│                   │                    │                        │
   │                   │                   │                    │                        │
   │ 9. Select Date    │                   │                    │                        │
   │ ─────────────────>│                   │                    │                        │
   │                   │ 10. Get Available │                    │                        │
   │                   │ Slots             │                    │                        │
   │                   │ ─────────────────────────────────────>│                        │
   │                   │ 11. Available Slots                    │                        │
   │                   │ <─────────────────────────────────────│                        │
   │ 12. Available     │                   │                    │                        │
   │ Time Slots        │                   │                    │                        │
   │ <─────────────────│                   │                    │                        │
   │                   │                   │                    │                        │
   │ 13. Select Time   │                   │                    │                        │
   │ & Submit Form     │                   │                    │                        │
   │ ─────────────────>│                   │                    │                        │
   │                   │ 14. Create        │                    │                        │
   │                   │ Appointment       │                    │                        │
   │                   │ ───────────────────────────────────────────────────────────────>
   │                   │                   │                    │                        │
   │                   │                   │                    │                        │
   │                   │                   │     15. Validate Appointment                │
   │                   │                   │     (Check doctor availability              │
   │                   │                   │      and time conflicts)                    │
   │                   │                   │     <────────────────────────────────────────
   │                   │                   │                    │                        │
   │                   │                   │     16. Create Appointment                  │
   │                   │                   │                                              │
   │                   │                   │     ───────────────────────────────────────>
   │                   │                   │                    │                        │
   │                   │ 17. Appointment   │                    │                        │
   │                   │ Created           │                    │                        │
   │                   │ <───────────────────────────────────────────────────────────────
   │ 18. Success       │                   │                    │                        │
   │ Confirmation      │                   │                    │                        │
   │ <─────────────────│                   │                    │                        │
   │                   │                   │                    │                        │
┌──┴───┐          ┌────┴────┐          ┌───┴───┐          ┌─────┴─────┐          ┌───────┴───────┐
│Client│          │React App│          │Django │          │Doctor API │          │Appointment API│
└──────┘          └─────────┘          │Backend│          └───────────┘          └───────────────┘
                                       └───────┘~~~