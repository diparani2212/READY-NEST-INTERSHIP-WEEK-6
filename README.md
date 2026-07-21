# 🏥 CityCare Smart Hospital Management System

**Author**: **Dipa Rani**  
**Project Scope**: Full-Stack Enterprise Healthcare & Hospital Operations Platform  
**Internship Project**: Ready Nest Internship - Week 6  

---

## 📌 Project Overview
The **CityCare Smart Hospital Management System** is an end-to-end, production-grade Web Application built to streamline healthcare workflows for Patients, Physicians, and Hospital Administrators. The system integrates real-time Socket.IO WebSockets, automated Nodemailer HTML notifications, secure file uploads (Multer + Cloudinary), digital Rx generation with printable PDFs, and comprehensive revenue analytics.

---

## ✨ Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Roles**: `ADMIN`, `DOCTOR`, `PATIENT`.
- **JWT Security**: Dual-token authentication with 15-minute Access Tokens and 7-day Refresh Tokens delivered via HTTP-Only, SameSite secure cookies.
- **Role Isolation**: Only Patients can self-register. Doctor staff and Admin accounts are securely provisioned.
- **Seeded Credentials**: Default administrator pre-seeded at database initialization (`admin@hospital.com` / `Admin@123`).

### 👨‍⚕️ 2. Admin Doctor Management
- **Physician Onboarding**: Provision user credentials, automatically generate linked Doctor profiles, assign clinical departments, set consultation fees, and verify medical license numbers.
- **Directory Audit**: Instant search and department filter across all hospital medical staff.

### 🗓️ 3. Patient Portal & Smart Appointment Booking
- **Doctor Search**: Discover physicians by specialization, qualification, experience, and fee structure.
- **Conflict-Free Scheduling**: Automated time-slot validation preventing double booking.
- **EHR Demographic Profile**: Manage personal data, blood type, height, weight, emergency contacts, and Drag & Drop avatar photos.

### 🩺 4. Doctor Clinical Portal & Consultation Queue
- **Schedule Management**: Real-time overview of today's visits and upcoming consultations.
- **Visit Workflow**: Confirm pending requests, reject invalid slots, and mark visits as `COMPLETED`.

### 💊 5. Electronic Health Records (EHR) & Printable Prescriptions
- **Digital Rx Builder**: Formulate diagnosis, structured dosage arrays, and treatment guidelines post-visit.
- **Printable Rx Charts**: Export prescription charts with official hospital letterhead styling.

### 💰 6. Financial Billing & Tax Invoices
- **Invoice Generation**: Automated consultation fee lookup, tax calculations, discounts, and payment status tracking (`UNPAID`, `PAID`, `PARTIAL`).
- **Patient Billing Portal**: Patients view financial statements and download invoices.

### 📁 7. Secure Document Storage & Upload Hub
- **Clinical Reports & Avatars**: Drag & drop uploader supporting PDF medical reports, X-Rays, MRI scans, and images (up to 10 MB).
- **Admin File Storage Audit**: Directory at `/admin/files` featuring MIME type filters (`PDF`, `Image`) and force deletion.

### 🔔 8. Notifications & Email Transporter
- **In-App Notifications**: Unread badges, navbar dropdown previews, and full Inbox at `/notifications`.
- **Nodemailer HTML Emails**: Automated email dispatch for registration, doctor credentials, appointment updates, digital Rx, and tax invoices.

### ⚡ 9. Real-Time WebSockets (Socket.IO)
- **Instant Live Push**: Event rooms for `user:${userId}` and `role:${role}` delivering instant updates for `appointment:booked`, `appointment:confirmed`, `appointment:rejected`, `appointment:completed`, `prescription:created`, `bill:generated`, and `notification:new` without requiring page reloads.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │     Next.js 16 (App Router)    │
                               │  Tailwind CSS v4 + React 19    │
                               └───────────────┬────────────────┘
                                               │
                                 HTTPS / WSS   │ REST APIs & WebSockets
                                               ▼
                               ┌────────────────────────────────┐
                               │    Express.js + TypeScript     │
                               │ Socket.IO Server / JWT Auth    │
                               └───────────────┬────────────────┘
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
            ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
            │   PostgreSQL /     │  │ Nodemailer / SMTP  │  │ Multer / Cloudinary│
            │   Prisma ORM       │  │ Email Transporter  │  │ File Storage Hub   │
            └────────────────────┘  └────────────────────┘  └────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Socket.IO Client |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO Server |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt Password Hashing, Cookie-Parser |
| **Security & Middleware** | Helmet, CORS, Express-Rate-Limit, Zod |
| **Storage & Email** | Multer, Cloudinary API, Nodemailer (SMTP) |

---

## 📁 Folder Structure

```
SMART HOSPITAL MANAGMENT SYSTEM/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # SQL migration scripts
│   │   ├── schema.prisma          # Database schema models
│   │   └── seed.ts                # Database seed script
│   ├── src/
│   │   ├── controllers/           # API request controllers
│   │   ├── middleware/            # Auth, CORS, and error handlers
│   │   ├── routes/                # Express endpoint routes
│   │   ├── services/              # Email, Socket.IO, Upload services
│   │   ├── utils/                 # Zod validation & Token utilities
│   │   └── index.ts               # Express application entrypoint
│   ├── .env.example               # Environment template
│   └── package.json
├── frontend/
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # UI components & SocketProvider
│   ├── lib/                       # API clients & Socket connection
│   ├── vercel.json                # Vercel deployment configuration
│   ├── .env.example               # Environment template
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md       # Full REST & WebSocket API specification
│   ├── DATABASE_SCHEMA.md         # Database Entity Relationships & Schema
│   └── POSTMAN_COLLECTION.json    # Postman v2.1 API Collection
├── render.yaml                    # Render deployment specification
├── README.md                      # ATS-friendly Master Documentation
├── task.md                        # Project Task Log
└── walkthrough.md                 # Technical Walkthrough & Verification
```

---

## ⚙️ Installation & Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Running instance locally or cloud (Neon/Supabase)

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Configure DATABASE_URL in .env
# DATABASE_URL="postgresql://user:password@localhost:5432/hospital_db?schema=public"

# Run migrations and generate Prisma client
npx prisma migrate dev
npx prisma generate

# Seed default admin user (admin@hospital.com / Admin@123)
npx prisma db seed

# Start server in dev mode
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment variables
cp .env.example .env.local

# Run Next.js frontend
npm run dev
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/hospital_db?schema=public"
JWT_ACCESS_SECRET=your_jwt_access_secret_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_32_characters_long
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL="CityCare Hospital <noreply@citycare.com>"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 🖼️ Screenshots Section

| View | Screenshot Placeholder |
| :--- | :--- |
| **Admin Analytics Dashboard** | `![Admin Dashboard](https://via.placeholder.com/800x450?text=Admin+Analytics+Dashboard)` |
| **Doctor Appointments Queue** | `![Doctor Queue](https://via.placeholder.com/800x450?text=Doctor+Appointments+Queue)` |
| **Patient Profile & Drag & Drop Avatar** | `![Patient Profile](https://via.placeholder.com/800x450?text=Patient+Profile+Avatar)` |
| **Digital Prescription PDF Viewer** | `![Prescription Chart](https://via.placeholder.com/800x450?text=Digital+Prescription+PDF)` |
| **Real-time Notifications Inbox** | `![Notifications Inbox](https://via.placeholder.com/800x450?text=Real-time+Notifications+Inbox)` |

---

## 🚀 Deployment Guide

### Backend Deployment (Render)
1. Link your GitHub repository to **Render**.
2. Select **Web Service** with directory `backend`.
3. Set Build Command: `npm install && npx prisma generate && npm run build`.
4. Set Start Command: `npm run start`.
5. Environment Variables: Configure `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`.

### Frontend Deployment (Vercel)
1. Import repository into **Vercel**.
2. Set Root Directory to `frontend`.
3. Set Framework Preset to **Next.js**.
4. Configure Environment Variables: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BACKEND_URL`.
5. Deploy project.

---

## 🔗 Live Demo & Repositories

### GitHub Repositories
- **Primary Repository**: [github.com/diparani925-creator/READY-NEST-INTERNSHIP-WEEK-6](https://github.com/diparani925-creator/READY-NEST-INTERNSHIP-WEEK-6.git)
- **Mirror Repository**: [github.com/diparani2212/READY-NEST-INTERSHIP-WEEK-6](https://github.com/diparani2212/READY-NEST-INTERSHIP-WEEK-6.git)

### Live Demo Links
- **Live Frontend**: `https://smart-hospital-management.vercel.app`
- **Live Backend API**: `https://smart-hospital-backend.onrender.com`

---

## 🔮 Future Improvements
- **Telehealth Video Consultations**: WebRTC multi-party video calling for remote medical care.
- **AI Medical Triage**: Machine learning automated patient symptom analysis and department recommendation.
- **Multi-Hospital Network Support**: Multi-tenant database partitioning for multi-branch hospital chains.

---

## 📄 License
This project is licensed under the **MIT License**.

---

## 👩‍💻 Author
**Dipa Rani**  
- GitHub: [@diparani925-creator](https://github.com/diparani925-creator)  
- Secondary GitHub: [@diparani2212](https://github.com/diparani2212)  
- Role: Full-Stack Software Engineering Intern
