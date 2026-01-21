# TechMatch Backend (Accounts + Verification + Skills/Certs Approval)

This backend implements the **account creation, approval, profile management, skills/certifications submission + admin approval**, and account deletion flows you described.

It matches your proposal's onboarding + verification flow (role selection → sign-up → verification submission → pending screen → admin approves/rejects → user dashboard) and the skills/cert verification workflow. fileciteturn0file0

## Stack
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time notifications)
- JWT (access + refresh) in HTTP-only cookies or Authorization header
- Multer (file uploads: certifications / business documents)

> No UI included.

---

## Quick Start

### 1) Install
```bash
npm install
cp .env.example .env
```

### 2) Run MongoDB
Local MongoDB example:
```bash
mongod
```

### 3) Seed an admin
```bash
npm run seed:admin
```

### 4) Start the server
```bash
npm run dev
# or
npm start
```

Server will start on `http://localhost:4000`.

---

## High-level data model

### User
- `role`: `TECHNICIAN | BUSINESS | AGENCY | ADMIN`
- `status`: `PENDING_VERIFICATION | ACTIVE | REJECTED | DISABLED | DELETED`
- `profile`: role-specific fields (contact, company details, etc.)
- `skills`: list of approved skills (each can have approved certifications)
- `pendingSkillsCount`: to enforce “max 3 pending” if you want (configurable)

### VerificationSubmission
- One per user onboarding (and optionally re-verification later)
- `type`: `TECHNICIAN_VERIFICATION | BUSINESS_VERIFICATION | AGENCY_VERIFICATION`
- `status`: `PENDING | APPROVED | REJECTED`
- `documents`: uploaded files (stored locally in `/uploads`)

### SkillSubmission
- Proposed skill additions / certifications
- `status`: `PENDING | APPROVED | REJECTED`
- On approval, it becomes part of `user.skills`

---

## Authentication approach

- **Access token** short TTL (`JWT_ACCESS_TTL`)  
- **Refresh token** longer TTL (`JWT_REFRESH_TTL`)  
- Refresh token is stored in an **HTTP-only cookie** by default.
- Access token can be returned in JSON *and/or* cookie (configurable).

---

## Socket.IO events (real-time)
- Users join their own room: `user:<userId>`
- Admins join `admins`

Emitted events:
- `verification:statusChanged`
- `skill:statusChanged`
- `account:statusChanged`

---

## Required frontend pages (you asked for this)

### Public
1. **Landing** `/`  
   - Buttons: Get Started / Login
2. **Role Selection** `/signup/role`  
   - Choose role: Technician / Business / Agency (Admin is seeded)
3. **Sign Up Form**  
   - Technician: `/signup/technician`
   - Business: `/signup/business`
   - Agency: `/signup/agency`
4. **Verification Upload** (after sign up)  
   - Technician: `/verify/technician`
   - Business: `/verify/business`
   - Agency: `/verify/agency`
5. **Verification Pending** `/pending`  
   - Shows “Verification Pending” & polls or listens via socket

### Authenticated
6. **Login** `/login`
7. **Dashboard Router** `/app`  
   - Reads `me` endpoint:
     - If `status !== ACTIVE` → redirect `/pending`
     - Else route to role dashboard:
       - Technician: `/app/technician`
       - Business: `/app/business`
       - Agency: `/app/agency`
       - Admin: `/app/admin`

### Profile / Settings (all roles)
8. **Profile** `/app/profile`
9. **Edit Profile** `/app/profile/edit`
10. **Skills & Certifications (Tech only)** `/app/skills`
    - Add skill + upload certs → becomes pending submission
11. **Account Settings** `/app/settings`
    - Change email/phone/name
    - Change password
    - Delete account

### Admin
12. **Admin Dashboard** `/app/admin`
    - Pending onboarding verifications
    - Pending skill/cert submissions
    - Approve / Reject actions
    - View history (approved/rejected)

---

## API Summary (routes)

### Auth
- `POST /api/auth/register` (role + credentials + initial profile)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Verification (onboarding docs)
- `POST /api/verification/submit` (multipart)
- `GET  /api/verification/my`
- **Admin**
  - `GET  /api/admin/verifications?status=PENDING`
  - `POST /api/admin/verifications/:id/approve`
  - `POST /api/admin/verifications/:id/reject`

### Skills / Certifications (technicians)
- `POST /api/skills/submit` (multipart)
- `GET  /api/skills/my-submissions`
- **Admin**
  - `GET  /api/admin/skills?status=PENDING`
  - `POST /api/admin/skills/:id/approve`
  - `POST /api/admin/skills/:id/reject`

### Account management
- `PATCH /api/users/me` (edit profile fields)
- `PATCH /api/users/me/password`
- `DELETE /api/users/me` (soft delete)

---

## Upload storage
Uploads are stored in:
- `uploads/verification/...`
- `uploads/skills/...`

For production, swap to S3 / Cloud storage.

---

## Notes for React + Socket.IO wiring

1. On login, store access token (if returned) OR rely on cookies.
2. Create a socket connection after login:
   - Send access token in `auth: { token }` (Socket.IO handshake)
3. If user is admin, they will also join the `admins` room.
4. When admin approves/rejects, the server emits an event to the user’s room.
5. Client listens and redirects from `/pending` to `/app` when status becomes `ACTIVE`.

---

## Security defaults (already applied)
- bcrypt password hashing
- Helmet headers
- Rate limiting
- Input validation
- File upload allowlist + size limits

---

## Next steps
- Plug these endpoints into your React pages.
- If you want: add email verification + password reset (can be added later).
