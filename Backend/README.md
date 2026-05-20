# FindMeds — Backend API
### Member 2 Deliverable | Node.js + Express + Firebase Admin

---

## 📁 Folder Structure

```
findmeds-backend/
├── server.js                  ← Entry point — start here
├── package.json
├── Dockerfile                 ← For Render.com deployment
├── .env.example               ← Copy to .env and fill in values
├── .gitignore
│
├── config/
│   ├── firebase.js            ← Firebase Admin SDK init
│   └── cronJobs.js            ← 24h auto-expire cron job
│
├── middleware/
│   └── authMiddleware.js      ← verifyToken + requireRole guards
│
├── controllers/
│   ├── authController.js      ← Register, profile, FCM token
│   ├── barcodeController.js   ← EAN-13 lookup (Open Food Facts + RxNav)
│   ├── donationController.js  ← List, 5-gate verify, match NGOs, claim, cancel
│   ├── ngoController.js       ← NGO dashboard, wishlist, Darpan verify
│   ├── notificationController.js ← FCM push + Twilio SMS
│   └── analyticsController.js ← Stats for admin + donor dashboards
│
└── routes/
    ├── authRoutes.js
    ├── barcodeRoutes.js
    ├── donationRoutes.js
    ├── ngoRoutes.js
    ├── notificationRoutes.js
    └── analyticsRoutes.js
```

---

## 🛠️ What to Install

### Prerequisites
- **Node.js v20+** — download from https://nodejs.org
- **Git** — for team sync

### Install backend dependencies

```bash
# Navigate into the backend folder
cd findmeds-backend

# Install all packages
npm install
```

**Packages installed:**

| Package | Why |
|---|---|
| `express` | Web server framework |
| `firebase-admin` | Server-side Firestore, Auth, FCM |
| `cors` | Allow frontend to call the API |
| `helmet` | Security HTTP headers |
| `express-rate-limit` | Prevent API abuse |
| `dotenv` | Load .env variables |
| `axios` | Call Open Food Facts + RxNav APIs |
| `uuid` | Generate unique donation IDs |
| `node-cron` | 24h auto-expire scheduler |
| `multer` | File upload handling (for photo proof) |
| `twilio` | SMS fallback notifications |
| `nodemon` | Auto-restart on save during dev |

---

## ⚙️ Environment Setup

### Step 1 — Copy the .env file
```bash
cp .env.example .env
```

### Step 2 — Firebase Setup (ONE person does this, shares with team)
1. Go to https://console.firebase.google.com
2. Create project: `findmeds-dev`
3. Go to **Project Settings → Service Accounts**
4. Click **"Generate new private key"** → downloads a JSON file
5. Open that JSON and copy the values into your `.env`:
   - `FIREBASE_PROJECT_ID` = `"project_id"` field
   - `FIREBASE_CLIENT_EMAIL` = `"client_email"` field
   - `FIREBASE_PRIVATE_KEY` = `"private_key"` field
6. Go to **Project Settings → General** → copy the **Storage bucket** URL into `FIREBASE_STORAGE_BUCKET`

⚠️ **Never commit `.env` or the downloaded JSON to GitHub.**

### Step 3 — Twilio (optional for now)
Sign up at https://twilio.com/try-twilio — get a free trial number.
Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in `.env`.
If not filled in, the server still runs — SMS just won't send.

---

## ▶️ Running Locally

```bash
# Development (auto-restarts on file save)
npm run dev

# Production
npm start
```

Server starts at: **http://localhost:5000**
Health check: **http://localhost:5000/health**

---

## 🔗 All API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | None | Register user, set role claim |
| GET | `/api/auth/me` | Bearer token | Get my profile |
| POST | `/api/auth/fcm-token` | Bearer token | Save push notification token |

### Barcode
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/barcode/:barcode` | Bearer token | Lookup medicine by EAN-13 |

### Donations
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/donations/browse` | None | Browse available donations |
| POST | `/api/donations/list` | Donor | List a donation (runs 5 gates) |
| GET | `/api/donations/my-listings` | Donor | My donation history |
| DELETE | `/api/donations/:id` | Donor | Cancel a donation |
| GET | `/api/donations/match/:id` | Any | Find matching NGOs |
| POST | `/api/donations/claim/:id` | NGO | Claim a donation |

### NGO
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/ngo/all` | None | Get all verified NGOs |
| GET | `/api/ngo/dashboard` | NGO | NGO inventory + stats |
| PUT | `/api/ngo/wishlist` | NGO | Update medicine wishlist |
| GET | `/api/ngo/pending` | Admin | NGOs awaiting verification |
| POST | `/api/ngo/verify/:ngoId` | Admin | Approve/reject NGO |

### Notifications
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/notifications/notify-ngos` | Any | Send FCM + SMS to NGO matches |

### Analytics
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/analytics/summary` | Admin | Platform-wide stats |
| GET | `/api/analytics/donor` | Donor | My personal donation stats |

---

## 🧪 Testing an Endpoint (Postman)

1. Open Postman → POST `http://localhost:5000/api/auth/register`
2. Body (JSON):
```json
{
  "uid": "test-uid-123",
  "fullName": "Test Donor",
  "email": "test@example.com",
  "role": "donor",
  "pincode": "600001"
}
```
3. Expected response:
```json
{ "success": true, "message": "User registered successfully." }
```

---

## 🤝 How to Sync with the Team (Git Workflow)

```bash
# Always pull before you start working
git pull origin main

# Work on your own branch
git checkout -b member2/backend-api

# After making changes
git add .
git commit -m "feat: add donation listing with 5-gate verification"
git push origin member2/backend-api

# Then open a Pull Request on GitHub for review
```

---

## 🚀 Deployment (Month 3 — Member 3 will configure)

Backend deploys to **Render.com** using the Dockerfile:
1. Member 3 creates a Render Web Service
2. Connects to the GitHub repo
3. Sets all `.env` variables in Render's Environment tab
4. Render auto-builds and deploys on every push to `main`

Production URL: `https://findmeds-api.onrender.com`

---

## 📌 Notes for the Team

- **Member 1 (Frontend):** Call `http://localhost:5000/api/...` in dev. In production use the Render URL.
- **Member 3 (DB/DevOps):** The Firestore collections used are: `users`, `ngos`, `donations`, `drugs`, `audit_logs` — matches your schema exactly.
- All timestamps are ISO 8601 strings.
- Firebase ID token goes in the `Authorization: Bearer <token>` header for protected routes.
