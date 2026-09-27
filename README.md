# 🧭 CampusFind — Digital Lost & Found Management System

**CampusFind** is a complete, production-grade Lost & Found web platform engineered specifically for college campuses. It combines real-time database persistence, JWT authentication with strict `@gmail.com` validation, an interactive architectural campus floor-plan map, a 7-factor rule-based similarity matching engine, and a security office claim-and-handover workflow.

---

## 🌟 Key Features

1. **Robust Authentication & Role-Based Authorization**
   - **Strict Gmail Requirement**: Only valid `@gmail.com` addresses permitted (enforced on both client and server).
   - **Password Security**: Hashed using `bcryptjs` with 10 salt rounds; real-time password strength meter (8+ chars, uppercase, lowercase, number, symbol).
   - **Anti-Enumeration Defense**: Unified `"Invalid email or password."` error preventing account discovery.
   - **Forgot / Reset Password Workflow**: Cryptographic token generation and 1-hour expiration.
   - **Role Separation**: `STUDENT` and `ADMIN` with guarded endpoints.

2. **Interactive Campus Spot Map (College Canteen Floor Plan)**
   - Custom SVG architectural floor plan of the College Canteen (no generic map dependency).
   - Shows detailed zones: Food Ordering Counter, Dining Tables 1–3 (North Wing), Dining Tables 4–6 (Central Wing), Water Station & Wash Area, Beverage & Snack Stall, Main Entrance Foyer.
   - Click to place pin, drag-and-drop pin tracking \((x, y)\) coordinates.
   - Automatic zone identification based on spatial bounding boxes.
   - Bounding coordinates stored in MongoDB for spatial distance calculations.

3. **7-Factor Rule-Based Matching Engine (USP)**
   - Automatically compares reported lost and found items:
     - **Location Match (30%)**: Same campus spot + zone match + Euclidean coordinate distance (\(\le 60\) units \(\rightarrow\) 30 pts).
     - **Category Match (20%)**: Exact category match (20 pts) or related category (10 pts).
     - **Date & Time Proximity (15%)**: Same day (10 pts), within 2 days (7 pts), time window overlap (+5 pts).
     - **Color Matching (10%)**: Direct match or description reference.
     - **Brand & Model (10%)**: Token overlap on manufacturer and model strings.
     - **Textual Similarity (10%)**: Jaccard token overlap between item titles and descriptions.
     - **Photo / Attribute Completeness (5%)**: Photographic documentation.
   - Scores categorized into:
     - **90–100%**: Very High Confidence
     - **75–89%**: High Confidence
     - **50–74%**: Possible Match
   - High matches automatically create in-app notifications for students.

4. **Privacy Protection & Confidential Identifiers**
   - Personal phone numbers, emails, and student IDs are protected and never revealed publicly.
   - **Private Identifying Detail**: Encrypted in MongoDB and stripped from public APIs (`select: false` or sanitized).
   - Visible **only** to the author and the authorized Admin during ownership claim reviews.

5. **Ownership Claim & Handover Workflow**
   - Claimants must answer 3 verification questions:
     1. Where & when lost
     2. Unique distinguishing features
     3. What was inside or attached
     4. Optional proof photo upload
   - Admin verifies claimant answers side-by-side with the reporter's **confidential private identifier**.
   - Admin approves claim \(\rightarrow\) records physical handover at Campus Security Office with Storage Reference Number (e.g., `SEC-2026-0042`) \(\rightarrow\) marks status as `RETURNED`.

---

## 📁 Project Structure

```
d:\CEP\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js          # Categories, zones, statuses
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Metrics, charts, approvals, handover
│   │   │   ├── authController.js     # Register, login, forgot/reset password
│   │   │   ├── claimController.js    # Claim submission & review
│   │   │   ├── foundController.js    # Found items CRUD & match trigger
│   │   │   ├── locationController.js # Campus spots & zones
│   │   │   ├── lostController.js     # Lost items CRUD & match trigger
│   │   │   ├── matchController.js    # Matches list & detail
│   │   │   ├── notificationController.js # Read/unread notifications
│   │   │   └── searchController.js   # Multi-filter search
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT & role authorization
│   │   │   ├── rateLimiter.js        # Auth rate limiter
│   │   │   └── upload.js             # Multer image handler
│   │   ├── models/
│   │   │   ├── CampusLocation.js     # Campus spots & bounding boxes
│   │   │   ├── Claim.js              # Verification questionnaire
│   │   │   ├── FoundItem.js          # Found reports & security custody
│   │   │   ├── LostItem.js           # Lost reports & private detail
│   │   │   ├── Match.js              # Scores & factor breakdown
│   │   │   ├── Notification.js       # In-app alerts
│   │   │   ├── ReturnRecord.js       # Handover & security ref numbers
│   │   │   └── User.js               # User accounts & bcrypt
│   │   ├── routes/                   # Express REST routes
│   │   ├── services/
│   │   │   ├── matchingEngine.js     # 7-factor weighted algorithm
│   │   │   └── notificationService.js# Event notification generator
│   │   ├── seed/
│   │   │   └── seedData.js           # Realistic seed dataset
│   │   ├── test/
│   │   │   ├── apiTest.js            # Health and connection test
│   │   │   ├── verifyEndpoints.js    # 12-point API test suite
│   │   │   └── e2eWorkflowTest.js    # Complete E2E workflow test
│   │   └── server.js                 # Express entry point
│   ├── uploads/                      # Uploaded item photos
│   ├── .env                          # Environment variables
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js             # Fetch wrapper with JWT interceptor
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Auth state & token storage
    │   │   └── NotificationContext.jsx # Live notifications & polling
    │   ├── components/
    │   │   ├── claims/
    │   │   │   ├── ClaimModal.jsx    # Verification questionnaire modal
    │   │   │   └── HandoverModal.jsx # Security handover & confetti
    │   │   ├── common/
    │   │   │   ├── Footer.jsx        # Campus links & security hotline
    │   │   │   ├── Navbar.jsx        # Responsive navigation & notif drawer
    │   │   │   └── StatusBadge.jsx   # Color-coded status pills
    │   │   ├── items/
    │   │   │   └── ItemCard.jsx      # Item card with badges & actions
    │   │   └── map/
    │   │       └── CampusMap.jsx     # Architectural SVG Canteen Floor Plan
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx# Metrics & visual chart analytics
    │   │   │   ├── ManageClaims.jsx  # Side-by-side verification & approval
    │   │   │   ├── ManageMatches.jsx # System-calculated matches review
    │   │   │   ├── ManageReports.jsx # Report moderation & approvals
    │   │   │   ├── ManageReturns.jsx # Handover audit & storage ref logs
    │   │   │   └── ManageUsers.jsx   # Campus directory
    │   │   ├── ForgotPassword.jsx    # Password recovery
    │   │   ├── Home.jsx              # Student dashboard & quick actions
    │   │   ├── ItemDetail.jsx        # Detailed view with map coordinates
    │   │   ├── Login.jsx             # Gmail login with quick-fill buttons
    │   │   ├── MyReports.jsx         # 4-tab personal dashboard
    │   │   ├── Notifications.jsx     # Notification center
    │   │   ├── Register.jsx          # Gmail registration & password meter
    │   │   ├── ReportFound.jsx       # Found filing with security custody
    │   │   ├── ReportLost.jsx        # Lost filing with interactive map pin
    │   │   ├── ResetPassword.jsx     # Token-based password update
    │   │   └── Search.jsx            # Multi-parameter catalog search
    │   ├── App.jsx                   # React Router with protected guards
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Campus Security Admin** | `admin@gmail.com` | `Admin@123` | Full admin control, verification, handover |
| **Student (Aarav Sharma)** | `student@gmail.com` | `Campus@123` | ID: `2024CS014`, Phone: `+91 9876500001` |
| **Student (Sarah Thomas)** | `sarah@gmail.com` | `Campus@123` | ID: `2023EC089`, Phone: `+91 9876500002` |
| **Student (Rahul Verma)** | `rahul@gmail.com` | `Campus@123` | ID: `2024ME042`, Phone: `+91 9876500003` |

*(The login screen also includes convenient 1-click demo autofill buttons)*

---

## 🚀 How to Run the Application

### Prerequisites
- **Node.js**: v18 or v20+
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017`

### 1. Database Setup & Seeding
From the `backend` directory:
```bash
cd d:\CEP\backend
npm run seed
```

### 2. Start the Backend API Server
From the `backend` directory:
```bash
cd d:\CEP\backend
npm start
```
*The backend runs on **http://localhost:5000***.

### 3. Start the Frontend Development Server
From the `frontend` directory in a separate terminal:
```bash
cd d:\CEP\frontend
npm run dev
```
*The frontend runs on **http://localhost:5173*** (with proxy to backend configured in `vite.config.js`).

---

## 🧪 Testing the Complete Workflow

You can verify the end-to-end user journey automatically by running:
```bash
cd d:\CEP\backend
node src/test/runE2E.js
```
This script exercises:
1. Student login with JWT token generation
2. Filing a lost report with canteen coordinates and secret identifier
3. Filing a found report with matching location and custody status
4. Automated matching engine score calculation (\(> 90\%\))
5. Instant notification generation
6. Student ownership claim submission with answers to verification questions
7. Admin side-by-side inspection of claimant answers vs confidential identifier
8. Admin claim approval and physical handover recording with Storage Reference Number
9. Status transition to `RETURNED`
