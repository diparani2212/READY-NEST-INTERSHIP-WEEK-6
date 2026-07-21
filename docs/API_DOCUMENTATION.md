# Smart Hospital Management System - REST & WebSocket API Specification

## Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

---

## Authentication & Tokens

Authentication uses HTTP-only cookies containing JWT tokens:
- `accessToken`: Expires in 15 minutes.
- `refreshToken`: Expires in 7 days.

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/auth/signup` | `POST` | Public | Register new patient account |
| `/auth/login` | `POST` | Public | Log in as Patient, Doctor, or Admin |
| `/auth/logout` | `POST` | Authenticated | Revoke refresh token & clear cookies |
| `/auth/refresh-token` | `POST` | Public | Issue new access token using refresh cookie |
| `/auth/forgot-password` | `POST` | Public | Request password reset verification code |
| `/auth/reset-password` | `POST` | Public | Reset password using token |

---

## Admin Doctor Management APIs (`ADMIN` Authorized)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/admin/doctors` | `GET` | `ADMIN` | List all doctors (with pagination & search) |
| `/admin/doctors/:id` | `GET` | `ADMIN` | Get doctor details by ID |
| `/admin/doctors` | `POST` | `ADMIN` | Create new Doctor account & profile |
| `/admin/doctors/:id` | `PUT` | `ADMIN` | Update doctor details |
| `/admin/doctors/:id` | `DELETE` | `ADMIN` | Deactivate/remove doctor |

---

## Patient Profile & Doctor Discovery APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/patient/profile` | `GET` | `PATIENT` | Fetch authenticated patient profile |
| `/patient/profile` | `PUT` | `PATIENT` | Update patient demographic & clinical details |
| `/doctors` | `GET` | Authenticated | Browse available doctors with search & department filter |
| `/doctors/:id` | `GET` | Authenticated | View doctor profile & availability slots |

---

## Appointment Management APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/appointments` | `POST` | `PATIENT` | Book new appointment |
| `/appointments/my` | `GET` | `PATIENT` | List patient's appointments |
| `/appointments/:id` | `GET` | Authenticated | Get appointment details |
| `/appointments/:id/cancel` | `PUT` | `PATIENT` | Cancel pending appointment |
| `/doctor/appointments` | `GET` | `DOCTOR` | List doctor's appointments |
| `/doctor/appointments/:id/confirm` | `PUT` | `DOCTOR` | Confirm pending appointment |
| `/doctor/appointments/:id/reject` | `PUT` | `DOCTOR` | Reject appointment |
| `/doctor/appointments/:id/complete` | `PUT` | `DOCTOR` | Mark consultation as completed |

---

## Prescription & Medical Records APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/prescriptions` | `POST` | `DOCTOR` | Create digital prescription |
| `/prescriptions/:id` | `GET` | Authenticated | Get prescription details |
| `/prescriptions/patient` | `GET` | `PATIENT` | List patient's digital prescriptions |
| `/prescriptions/doctor` | `GET` | `DOCTOR` | List prescriptions issued by doctor |
| `/medical-records` | `POST` | `DOCTOR` | Create EHR clinical entry |
| `/medical-records/patient` | `GET` | `PATIENT` | View patient EHR history |
| `/medical-records/doctor` | `GET` | `DOCTOR` | View patient EHR records |
| `/medical-records/admin` | `GET` | `ADMIN` | System-wide EHR audit |

---

## Billing & Invoice APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/admin/bills` | `POST` | `ADMIN` | Generate billing statement |
| `/admin/bills` | `GET` | `ADMIN` | List all billing invoices |
| `/admin/bills/:id` | `GET` | `ADMIN` | Get invoice details |
| `/admin/bills/:id` | `PUT` | `ADMIN` | Update payment status & charges |
| `/patient/bills` | `GET` | `PATIENT` | View patient invoices |
| `/doctor/bills` | `GET` | `DOCTOR` | View consultation billing summary |

---

## Dashboard Analytics & System Reports APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/admin/dashboard` | `GET` | `ADMIN` | Revenue, patient, doctor, and status analytics |
| `/doctor/dashboard/analytics` | `GET` | `DOCTOR` | Today's visits, upcoming, and patient counts |
| `/patient/dashboard/analytics` | `GET` | `PATIENT` | Upcoming appointment, total visits, pending bills |

---

## File Storage & Document Upload APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/profile/upload-image` | `POST` | Authenticated | Upload profile avatar (max 10MB) |
| `/profile/remove-image` | `DELETE` | Authenticated | Remove profile avatar |
| `/medical-records/upload` | `POST` | `DOCTOR` | Upload clinical PDF / scan image |
| `/admin/files` | `GET` | `ADMIN` | System file storage audit |
| `/admin/files/:id` | `DELETE` | `ADMIN` | Force delete stored file |

---

## Notifications APIs

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/notifications` | `GET` | Authenticated | Fetch user alerts & unread counter |
| `/notifications/:id/read` | `PUT` | Authenticated | Mark alert as read |
| `/notifications/read-all` | `PUT` | Authenticated | Mark all alerts as read |
| `/notifications/:id` | `DELETE` | Authenticated | Delete notification record |

---

## Socket.IO Real-Time WebSocket Events

WebSocket Connection: `ws://localhost:5000`

### Client Subscriptions

| Event Name | Scope | Description |
| :--- | :--- | :--- |
| `appointment:booked` | Doctor, Patient, Admin | Fired when an appointment request is submitted |
| `appointment:confirmed` | Patient, Admin | Fired when doctor confirms an appointment |
| `appointment:rejected` | Patient, Admin | Fired when doctor rejects an appointment |
| `appointment:completed` | Patient, Admin | Fired when doctor marks visit as completed |
| `prescription:created` | Patient | Fired when a digital Rx is issued |
| `bill:generated` | Patient, Admin | Fired when an invoice is generated |
| `bill:updated` | Patient, Admin | Fired when billing payment status updates |
| `notification:new` | User | Fired when a new in-app notification is pushed |
