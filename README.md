# 🏥 MedFlow

> A full-stack healthcare management platform — patients book appointments, doctors manage their schedules and records, and admins oversee the whole system. Built to be production-deployed, not just a demo.

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img alt="MUI" src="https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=white" />
</p>

---

## 🔗 Live Demo

- **App:** https://medflow-khaki.vercel.app/
- **Try it (demo patient):** `demo@medflow.com` / `Demo@1234` — *please be gentle, it's a shared demo* 🙂

> Frontend on **Vercel**, backend on **Render**, database on **MongoDB Atlas**.

---

## ✨ Features

### 👤 Patients
- Sign up and log in (secure, cookie-based auth)
- Browse approved doctors by specialization
- View a doctor's real-time available slots and book an appointment
- Track appointment status (pending → confirmed → completed) and read medical records

### 🩺 Doctors
- Account requires **admin approval** before going live
- Define **weekly availability** (recurring time windows + slot duration)
- Confirm, complete, or cancel appointments and add visit notes
- Create **medical records** (diagnosis, prescription, follow-up) per appointment
- Personal **analytics dashboard** (appointments by status, 30-day trend)

### 🛡️ Admins
- Approve / reject pending doctors
- Manage availability on a doctor's behalf
- System-wide **analytics**: user breakdown, appointment status mix, booking trends
- Full visibility into users, doctors, patients, and appointments

---

## 🧠 Engineering Highlights

What makes this more than a CRUD app:

- **Cross-site cookie authentication** — JWT stored in an `httpOnly` cookie, working across a frontend and backend hosted on **different domains** (`SameSite=None; Secure` in production, behind a trusted proxy).
- **Concurrency-safe booking** — a MongoDB **partial unique index** (`{ doctorId, appointmentDate, active }`) makes double-booking impossible at the database level, not with race-prone `if` checks.
- **Single source of truth for slots** — slot generation is shared between the "show available slots" and "create appointment" paths to prevent logic drift.
- **Timezone-aware scheduling** — slots are computed in a pinned server timezone so an appointment time means the same thing regardless of host location.
- **Role-based access control** — enforced in middleware on every protected route.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, Material UI 7, MUI X Data Grid & Date Pickers, Recharts, Zustand, Axios, Day.js |
| **Backend** | Node.js, Express 5, Mongoose 8, JSON Web Tokens, bcrypt, cookie-parser, CORS, Morgan |
| **Database** | MongoDB (Atlas) |
| **Deployment** | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## 🏗️ Architecture

```
┌──────────────┐     HTTPS + httpOnly cookie     ┌──────────────┐        ┌───────────────┐
│   Frontend   │  ───────────────────────────▶   │   Backend    │  ───▶  │  MongoDB      │
│  Next.js     │     (axios, withCredentials)     │  Express API │        │  Atlas        │
│  (Vercel)    │  ◀───────────────────────────    │  (Render)    │  ◀───  │               │
└──────────────┘     JSON + Set-Cookie            └──────────────┘        └───────────────┘
```

---

## 📡 API Overview


| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | public | Register patient or doctor |
| POST | `/auth/login` | public | Log in (sets cookie) |
| POST | `/auth/logout` | auth | Log out (clears cookie) |
| GET | `/users/doctors` | patient | List approved doctors |
| GET / PUT | `/availability/me` | doctor | Get / set own weekly availability |
| GET | `/appointments/slots` | patient | Available slots for a doctor on a date |
| POST | `/appointments/create-appointment` | patient | Book a slot |
| GET | `/appointments` | auth | List own appointments |
| PATCH | `/appointments/:id/status` | doctor | Update appointment status |
| PATCH | `/appointments/:id/notes` | doctor | Add visit notes |
| GET | `/appointments/analytics` | doctor | Doctor analytics |
| POST | `/records/create-record` | doctor/admin | Create a medical record |
| GET | `/records` | auth | List own records |
| PATCH | `/admin/doctors/:id/approve` | admin | Approve a doctor |
| PATCH | `/admin/doctors/:id/reject` | admin | Reject a doctor |
| GET | `/admin/stats` · `/admin/analytics` | admin | System metrics |

---

## 📂 Project Structure

```
MedFlow/
├── Backend/
│   └── src/
│       ├── server.js            # Express app + middleware + route mounting
│       ├── config/db.js         # MongoDB connection + index sync
│       ├── controllers/         # auth, appointment, availability, records, admin, users
│       ├── models/              # user, appointment, availability, records
│       ├── routes/              # route definitions per resource
│       ├── middlewares/         # checkAuth, restrictTo (RBAC)
│       ├── service/auth.js      # JWT sign/verify + cookie options
│       └── scripts/createAdmin.js
└── frontend/
    └── src/
        ├── pages/               # routes (landing, login, dashboards, booking)
        ├── components/          # reusable UI (cards, tables, charts, layout)
        ├── store/               # Zustand stores (auth, ui)
        ├── lib/api.js           # axios instance (withCredentials)
        └── theme.js             # MUI theme (light/dark)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18+**
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone
```bash
git clone https://github.com/yusufnagpurwala/Medflow.git
cd MedFlow
```

### 2. Backend
```bash
cd Backend
npm install
cp .env.example .env      # then fill in the values
npm run dev               # starts on http://localhost:8000
```

Seed the first admin account (reads `ADMIN_*` from `.env`):
```bash
node src/scripts/createAdmin.js
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local # set NEXT_PUBLIC_API_URL
npm run dev                # starts on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string for signing JWTs |
| `CLIENT_URL` | Allowed frontend origin (CORS) |
| `NODE_ENV` | `production` enables `Secure` + `SameSite=None` cookies |
| `PORT` | Server port (default 8000) |
| `TZ` | Server timezone (e.g. `Asia/Kolkata`) — pins slot computation |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed admin credentials |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, including `/api` |

---

## ☁️ Deployment Notes

- **Frontend (Vercel):** set `NEXT_PUBLIC_API_URL` to your backend URL (`https://<backend>.onrender.com/api`).
- **Backend (Render):** set all backend env vars; set `NODE_ENV=production` and `CLIENT_URL` to your Vercel URL.
- **Database (Atlas):** because Render uses dynamic egress IPs, add `0.0.0.0/0` to the Atlas IP Access List (or your host's static IPs).
- Because the frontend and backend are on different domains, the auth cookie is cross-site — production must serve over HTTPS so `Secure; SameSite=None` cookies are accepted.

---

## 🗺️ Roadmap

- [ ] Email / SMS appointment reminders
- [ ] File attachments on medical records
- [ ] Doctor ratings & reviews
- [ ] Automated tests (Jest + Supertest)

---

## 👤 Author

**Yusuf Nagpurwala** — MERN Stack Developer
[LinkedIn](https://www.linkedin.com/in/yusuf-nagpurwala)

---

## 📄 License

Released under the MIT License. See `LICENSE` for details.
