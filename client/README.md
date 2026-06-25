# Student Management System — Frontend

A complete React frontend for the Student Management System backend.

## Tech Stack
- **React 18** + **Vite**
- **React Router v6** (nested routes, protected routes)
- **Axios** (API calls with cookie-based auth)
- **React Hot Toast** (notifications)
- **Recharts** (charts and analytics)
- **Lucide React** (icons)

---

## Prerequisites
- Node.js 18+
- Backend server running on `http://localhost:4000`

---

## Setup & Run

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:4000)
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## Roles & Access

| Role    | How to create | Login |
|---------|--------------|-------|
| Admin   | Via Postman: POST /api/v1/auth/register with role:"Admin" | Login → Select Admin |
| Teacher | Admin adds from Teachers page | Login → Select Teacher |
| Student | Admin adds from Students page | Login → Select Student |

---

## Pages

### Auth
- `/login` — Role-based login
- `/forgot-password` — Send reset email
- `/reset-password?token=...` — Set new password

### Admin `/admin/*`
- Dashboard, Students, Teachers, Projects, Assign Supervisor, Reports

### Teacher `/teacher/*`
- Dashboard, My Students, Projects, Feedback

### Student `/student/*`
- Dashboard, My Project, Assignments, Notifications

---

## Build
```bash
npm run build
```
