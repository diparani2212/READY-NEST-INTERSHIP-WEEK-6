# Database Schema Documentation: Smart Hospital Management System

## Overview
The Smart Hospital Management System utilizes **PostgreSQL** configured with **Prisma ORM**.

---

## Entity Relationship Summary

```
[User] 1 ── 1 [Patient] 1 ── * [Appointment]
  │               │                 │
  │ 1             │ 1               │ 1
  ▼               ▼                 ▼
[Doctor] 1 ── * [Prescription] ── * [Bill]
  │               │                 │
  │               ▼                 ▼
  └── * [MedicalRecord] ── * [UploadedFile]
  │
  └── * [Notification]
```

---

## Enum Definitions

### `Role`
- `ADMIN`: System administrator
- `DOCTOR`: Medical staff physician
- `PATIENT`: Registered patient

### `Gender`
- `MALE`
- `FEMALE`
- `OTHER`

### `AppointmentStatus`
- `PENDING`: Waiting for doctor confirmation
- `CONFIRMED`: Confirmed by doctor
- `CANCELLED`: Rejected by doctor or cancelled by patient
- `COMPLETED`: Consultation complete

### `PaymentStatus`
- `UNPAID`: Invoice generated, payment pending
- `PAID`: Payment settled
- `PARTIAL`: Partial payment settled

---

## Table Models

### `User`
Stores core user account credentials and authentication metadata.
- `id` (String, PK, UUID)
- `email` (String, Unique)
- `password` (String, hashed with bcrypt)
- `fullName` (String)
- `role` (Enum `Role`, default `PATIENT`)
- `phoneNumber` (String, Optional)
- `profileImage` (String, Optional)
- `isActive` (Boolean, default `true`)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### `Patient`
Demographic and medical profile for patients.
- `id` (String, PK, UUID)
- `userId` (String, FK -> `User.id`, Unique)
- `dateOfBirth` (DateTime, Optional)
- `gender` (Enum `Gender`, Optional)
- `bloodGroup` (String, Optional)
- `height` (Float, Optional)
- `weight` (Float, Optional)
- `address` (String, Optional)
- `emergencyContact` (String, Optional)

### `Doctor`
Physician credentials and departmental profile.
- `id` (String, PK, UUID)
- `userId` (String, FK -> `User.id`, Unique)
- `specialization` (String)
- `qualification` (String)
- `experience` (Int)
- `consultationFee` (Float)
- `department` (String)
- `licenseNumber` (String, Unique)
- `availabilityStatus` (String, default `'AVAILABLE'`)
- `bio` (String, Optional)

### `Appointment`
Clinical consultation bookings.
- `id` (String, PK, UUID)
- `patientId` (String, FK -> `Patient.id`)
- `doctorId` (String, FK -> `Doctor.id`)
- `appointmentDate` (DateTime)
- `appointmentTime` (String)
- `status` (Enum `AppointmentStatus`, default `PENDING`)
- `reason` (String, Optional)

### `Prescription`
Digital medical prescriptions.
- `id` (String, PK, UUID)
- `appointmentId` (String, FK -> `Appointment.id`, Unique)
- `patientId` (String, FK -> `Patient.id`)
- `doctorId` (String, FK -> `Doctor.id`)
- `diagnosis` (String)
- `medicines` (JSON Array)
- `instructions` (String, Optional)

### `MedicalRecord`
Electronic Health Record (EHR) entries.
- `id` (String, PK, UUID)
- `patientId` (String, FK -> `Patient.id`)
- `doctorId` (String, FK -> `Doctor.id`)
- `visitDate` (DateTime)
- `diagnosis` (String)
- `treatment` (String)

### `Bill`
Financial invoices.
- `id` (String, PK, UUID)
- `invoiceNumber` (String, Unique)
- `appointmentId` (String, FK -> `Appointment.id`, Unique)
- `patientId` (String, FK -> `Patient.id`)
- `consultationFee` (Float)
- `amount` (Float)
- `paymentStatus` (Enum `PaymentStatus`, default `UNPAID`)

### `UploadedFile`
Document storage registry.
- `id` (String, PK, UUID)
- `fileName` (String)
- `fileUrl` (String)
- `fileType` (String)
- `fileSize` (Int)

### `Notification`
In-app alerts.
- `id` (String, PK, UUID)
- `userId` (String, FK -> `User.id`)
- `title` (String)
- `message` (String)
- `type` (String)
- `isRead` (Boolean, default `false`)
