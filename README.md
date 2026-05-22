# FindMeds — Medicine Redistribution Network

> Connecting surplus medicine from hospitals and pharmacies to NGOs in underserved communities.

FindMeds is a full-stack web platform that tackles one of healthcare's most wasteful problems — millions of rupees worth of unexpired, sealed medicine gets discarded every year because there's no easy way to redistribute it. We built a system where donors (hospitals, pharmacies, clinics) can list their surplus inventory, and verified NGOs can claim it, all with a verification pipeline in between to make sure nothing unsafe reaches patients.

---

## What problem does this solve?

Hospitals and large pharmacies routinely end up with excess stock — bulk purchases that weren't fully used, returned items in good condition, medicines approaching expiry but still valid. At the same time, community health clinics and NGOs in the same city are struggling to source basic medicines. The gap isn't supply, it's logistics and trust.

FindMeds bridges that gap by:
- Giving donors a simple way to list surplus stock
- Running every donation through a 5-step safety verification (drug recognition, expiry check, Schedule H/X screening, category validation, photo proof)
- Automatically matching verified donations to nearby NGOs based on location and wishlist
- Notifying matched NGOs instantly via SMS and email so claims happen fast

---

## Who uses it?

**Donors** — hospitals, pharmaceutical companies, retail pharmacies. They list their surplus medicine, and the platform handles the rest.

**NGOs** — community health organizations and clinics. They browse available donations near them, maintain a wishlist of needed medicines, and claim what matches.

**Admins** — platform staff who verify NGO registrations, monitor the donation pipeline, and keep an eye on platform-wide analytics.

---

## Project structure

```
FindMeds/
├── Backend/          ← Node.js + Express REST API
└── Frontend/         ← React + Vite web app
```

This is a team project split across two members:

- **Member 1** — Frontend (React, UI/UX, API integration)
- **Member 2** — Backend (API, database, verification pipeline, notifications)

---

## Tech stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js v20 |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Custom JWT (bcryptjs) |
| File uploads | Multer + Cloudinary |
| Real-time | Socket.io |
| Notifications | Twilio (SMS) + NodeMailer (email) |
| Scheduling | node-cron (24h auto-expire) |
| Security | Helmet, express-rate-limit |
| Deployment | Docker → Render.com |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Maps | Leaflet + React-Leaflet |
| Forms | Formik + Yup |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| HTTP | Axios |

---

## Features

### For donors
- List surplus medicine with details — category, batch number, expiry, storage condition, quantity
- Every listing goes through a 5-gate verification pipeline before it goes live
- Track the status of each donation (listed → verified → claimed → received)
- Dashboard with personal impact stats

### For NGOs
- Browse verified donations filtered by location and medicine type
- Claim available donations with a single action (race-condition-safe, first-come-first-served)
- Maintain a wishlist so the platform knows what to notify you about
- Inventory management dashboard with a map view of nearby donors
- Get notified instantly when a matching donation is listed

### Platform-wide
- Barcode scanner — scan an EAN-13 barcode to auto-fill medicine details (powered by Open Food Facts + RxNav)
- Geo-matching — NGOs are ranked by distance + wishlist overlap when a donation comes in
- 24-hour auto-expiry — unclaimed donations expire automatically via a scheduled cron job
- Audit logging — every significant action is recorded
- Admin portal — NGO verification queue, platform analytics, Darpan integration for NGO legitimacy checks

---

## API overview

The backend runs on port `5001`. All routes are prefixed with `/api`.

```
POST   /api/auth/register          Register as donor or NGO
POST   /api/auth/login             Login, receive JWT
GET    /api/auth/me                Get your own profile

GET    /api/barcode/:code          Look up a medicine by barcode

POST   /api/donations/list         List a new donation (runs 5-gate check)
GET    /api/donations/browse       Browse all available donations (public)
GET    /api/donations/my-listings  My donation history
DELETE /api/donations/:id          Cancel a listing
GET    /api/donations/match/:id    Find matching NGOs for a donation
POST   /api/donations/claim/:id    Claim a donation (NGO only)

GET    /api/ngo/all                All verified NGOs
GET    /api/ngo/dashboard          NGO's own inventory + stats
PUT    /api/ngo/wishlist           Update medicine wishlist
GET    /api/ngo/pending            Pending verification queue (admin)
POST   /api/ngo/verify/:id         Approve or reject an NGO (admin)

GET    /api/analytics/summary      Platform-wide stats (admin)
GET    /api/analytics/donor        Personal impact stats (donor)

POST   /api/notifications/notify-ngos   Manual notification trigger (admin)
```

---

## Running locally

You'll need Node.js v20+ and a MongoDB Atlas cluster before starting.

### Backend

```bash
cd Backend
npm install
cp .env.example .env
# Fill in your values in .env (see below)
npm run dev
```

Server starts at `http://localhost:5001`. Health check: `http://localhost:5001/health`

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

App opens at `http://localhost:3000`.

---

## Environment variables

Copy `Backend/.env.example` to `Backend/.env` and fill these in:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/findmeds

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

# Cloudinary (for donation photo uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Twilio (SMS notifications — optional for local dev)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email (Gmail SMTP — use an App Password, not your real password)
EMAIL_USER=
EMAIL_APP_PASSWORD=

# Darpan (NGO legitimacy verification — optional)
DARPAN_API_KEY=
```

The server starts fine without Twilio, email, or Darpan credentials — those features just silently skip if the keys aren't present.

---

## Database models

```
User        — donors and admins (email, hashed password, role, pincode)
NGO         — NGO profiles (location with 2dsphere index, wishlist, verification status)
Donation    — each listed medicine (status lifecycle, geo coordinates, gates passed)
Drug        — local barcode cache to avoid repeat API calls
AuditLog    — immutable record of every claim, approval, and expiry event
```

---

## Deployment

The backend ships as a Docker container to Render.com. The Dockerfile is already in `Backend/`.

1. Push to GitHub
2. Create a new Web Service on Render, connect the repo
3. Set all `.env` variables in Render's Environment tab
4. Render builds and deploys automatically on every push to `main`

Production URL: `https://findmeds-api.onrender.com`

---

## Current status

The backend is largely complete. The frontend has all pages built and connected to the API with a localStorage fallback (so it works even when the backend is offline, useful during development). A few donor sub-pages (history, profile, tracking) are still using static placeholder data and need to be wired to the live API — that's the active work in progress.

---

## Team

| Member | Role |
|---|---|
| Member 1 | Frontend — React, UI, API integration |
| Member 2 | Backend — Express, MongoDB, verification pipeline, notifications |

---

## License

This project is for academic and community use. Not for commercial distribution.
