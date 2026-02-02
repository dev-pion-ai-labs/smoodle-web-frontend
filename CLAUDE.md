# Smoodle Verified — Frontend Web Application

## Project Overview

Smoodle Verified is an AI content verification platform that detects whether text, images, audio, and video content is AI-generated or human-created. This is the React web frontend that connects to an existing FastAPI backend already deployed on Railway.

**Important:** This is the authenticated web application only. The marketing site is hosted separately at smoodle.ai. This app is hosted at app.smoodle.ai.

**Live Backend:** `https://smoodle-backend-production.up.railway.app`
**API Docs (Swagger):** `https://smoodle-backend-production.up.railway.app/docs`
**GitHub Repo:** `https://github.com/dev-pion-ai-labs/smoodle-web-frontend`
**Live App:** `https://app.smoodle.ai` (Vercel deployment)

## Tech Stack

- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS 3.4+
- **Routing:** React Router v6
- **State Management:** Zustand (lightweight, no boilerplate)
- **HTTP Client:** Axios with interceptors for JWT refresh
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Charts (Admin):** Recharts
- **Payments:** Razorpay Web SDK (script injection, NOT npm package)
- **Language:** JavaScript (NOT TypeScript — keep it simple and fast)

## Brand Identity

### Colors (from Smoodle logo)
- **Primary Red:** `#E8453C` (main brand color from logo)
- **Primary Red Dark:** `#D13A32` (hover states)
- **Primary Red Light:** `#FEF2F1` (light backgrounds)
- **Dark:** `#1A1A2E` (text, dark sections)
- **Gray:** `#6B7280` (secondary text)
- **Light Gray:** `#F9FAFB` (backgrounds)
- **Success Green:** `#10B981`
- **Warning Amber:** `#F59E0B`
- **Error Red:** `#EF4444`
- **White:** `#FFFFFF`

### Logo
- Logo file is in the repo root: `WhatsApp Image 2026-01-22 at 12.31.12 PM.jpeg`
- Copy it to `src/assets/logo.png` during setup
- The logo shows "smoodle" in white lowercase on red background with a checkmark badge
- Use the logo on auth pages and navbar

### Typography
- **Headings:** "Plus Jakarta Sans" (Google Fonts) — modern, geometric, professional
- **Body:** "DM Sans" (Google Fonts) — clean, readable
- **Monospace (scores):** "JetBrains Mono" (Google Fonts)

### Design Direction
- Clean, modern, professional — NOT playful
- Red and white as dominant palette, dark accents
- Generous whitespace, card-based layouts
- Subtle shadows and rounded corners (rounded-xl)
- Smooth transitions and micro-interactions
- Mobile-first responsive design

## Backend API Reference

Base URL: `https://smoodle-backend-production.up.railway.app/api/v1`

### Authentication Endpoints
```
POST   /auth/signup              — Register (email, password, full_name)
POST   /auth/login               — Login (email, password) → returns access_token, refresh_token
POST   /auth/verify-otp          — Verify email OTP (email, otp)
POST   /auth/resend-otp          — Resend OTP (email)
POST   /auth/forgot-password     — Request password reset (email)
POST   /auth/reset-password      — Reset password (token, new_password)
GET    /auth/google              — Initiate Google OAuth (redirects to Google)
GET    /auth/google/callback     — Google OAuth callback (handled by backend)
POST   /auth/refresh             — Refresh JWT (refresh_token) → new access_token
POST   /auth/logout              — Logout (invalidates refresh token)
```

### User Endpoints (requires Bearer token)
```
GET    /users/me                 — Get current user profile
PATCH  /users/me                 — Update profile (full_name, etc.)
GET    /users/me/credits         — Get credit balance
GET    /users/me/subscription    — Get subscription details
DELETE /users/me                 — Delete account
```

### Verification Endpoints (requires Bearer token)
```
POST   /verify/text              — Verify text (body: { text: "..." })
POST   /verify/image             — Verify image (multipart form: file)
POST   /verify/audio             — Verify audio (multipart form: file)
POST   /verify/video             — Verify video (multipart form: file)
GET    /verify/history           — Get verification history (paginated: ?page=1&limit=10)
GET    /verify/{id}              — Get specific verification result
DELETE /verify/{id}              — Delete verification from history
```

### Payment Endpoints (requires Bearer token)
```
POST   /payments/create-order    — Create Razorpay order (body: { pack_id or plan_id })
POST   /payments/verify          — Verify Razorpay payment signature
POST   /payments/subscribe       — Create subscription
POST   /payments/cancel-subscription — Cancel active subscription
GET    /payments/history         — Get payment history
```

### Admin Endpoints (requires Bearer token + admin role)
```
GET    /admin/users              — List all users (paginated)
GET    /admin/users/{id}         — Get user details
PATCH  /admin/users/{id}/credits — Adjust user credits
GET    /admin/stats              — Dashboard statistics
GET    /admin/verifications      — All verifications (paginated)
GET    /admin/payments           — All payments
GET    /admin/subscriptions      — All subscriptions
```

### API Response Format
All API responses follow this structure:
```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": { ... }  // Response payload
}
```

### Authentication Flow
1. User signs up → receives OTP via email
2. User verifies OTP → account activated
3. User logs in → receives `access_token` (30 min) + `refresh_token` (7 days)
4. All authenticated requests include: `Authorization: Bearer <access_token>`
5. When access_token expires → call `/auth/refresh` with refresh_token
6. Store tokens in localStorage (access_token) and httpOnly approach where possible
7. Google OAuth: redirect to `/auth/google` → backend handles flow → redirects back with tokens

### Verification Response Structure
```json
{
  "id": "uuid",
  "content_type": "text|image|audio|video",
  "ai_score": 0.85,           // 0-1, higher = more likely AI
  "human_score": 0.15,        // 0-1, higher = more likely human
  "verdict": "ai_generated",  // ai_generated | human_created | mixed | inconclusive
  "confidence": "high",       // high | medium | low
  "details": { ... },         // Provider-specific breakdown
  "credits_used": 1,
  "created_at": "ISO datetime"
}
```

### Credit Costs
- Text verification: 1 credit
- Image verification: 2 credits
- Audio verification: 3 credits
- Video verification: 5 credits

### Subscription Plans
- **Free:** 10 credits on signup (one-time)
- **Pro:** ₹499/month — 500 credits/month
- **Enterprise:** ₹2,499/month — 5000 credits/month + API access

## Project Structure

```
smoodle-web-frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── ScoreGauge.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── auth/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── OTPInput.jsx
│   │   │   └── GoogleAuthButton.jsx
│   │   ├── verification/
│   │   │   ├── TextVerifier.jsx
│   │   │   ├── FileVerifier.jsx
│   │   │   ├── VerificationResult.jsx
│   │   │   └── VerificationHistory.jsx
│   │   └── payment/
│   │       └── UpgradeCreditsModal.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── VerifyOTP.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── GoogleCallback.jsx   # Handles OAuth redirect
│   │   ├── Dashboard.jsx        # Main verification page
│   │   ├── History.jsx          # Verification history
│   │   ├── Pricing.jsx          # Plans & credit packs (in-app)
│   │   ├── Settings.jsx         # User profile & settings
│   │   ├── AdminDashboard.jsx   # Admin stats & management
│   │   └── NotFound.jsx         # 404 page
│   ├── store/
│   │   ├── authStore.js         # Auth state (Zustand)
│   │   ├── verifyStore.js       # Verification state
│   │   └── uiStore.js           # UI state (modals, toasts)
│   ├── services/
│   │   ├── api.js               # Axios instance with interceptors
│   │   ├── authService.js       # Auth API calls
│   │   ├── verifyService.js     # Verification API calls
│   │   ├── paymentService.js    # Payment API calls
│   │   ├── userService.js       # User API calls
│   │   └── adminService.js      # Admin API calls
│   ├── utils/
│   │   ├── constants.js         # App constants, routes
│   │   ├── helpers.js           # Utility functions
│   │   ├── validators.js        # Zod schemas
│   │   └── razorpay.js          # Razorpay integration
│   ├── routes/
│   │   ├── AppRouter.jsx        # Main router
│   │   ├── PrivateRoute.jsx     # Auth guard
│   │   └── AdminRoute.jsx       # Admin guard
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Tailwind directives + custom styles
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── CLAUDE.md
```

## Environment Variables

```env
VITE_API_BASE_URL=https://smoodle-backend-production.up.railway.app/api/v1
VITE_GOOGLE_CLIENT_ID=837585222586-4g4ic57i3i5annvo44997tql5t2usaqa.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_test_SAMxQCgLKRhhOo
VITE_APP_NAME=Smoodle Verified
VITE_APP_URL=http://localhost:5173
```

## Page-by-Page Requirements

### 1. Root Route (`/`)
Redirects to `/dashboard` if authenticated, `/login` if not. No landing page — this is an authenticated app only.

### 2. Auth Pages (`/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`)
- Clean centered card layout with logo on subtle gradient background
- Email/password form with validation
- Google OAuth button ("Continue with Google")
- OTP page: 6-digit input with auto-focus between digits
- Show/hide password toggle
- Loading states on all buttons
- Error messages from API displayed inline
- Redirect to dashboard after successful auth
- Premium, inviting design — these are the first impression

### 3. Google OAuth Callback (`/auth/google/callback`)
- Loading spinner page
- Extracts tokens from URL params
- Stores tokens and redirects to dashboard
- Shows error if auth failed

### 4. Dashboard (`/dashboard`) — MAIN PAGE
- Navbar: Logo (links to /dashboard), nav links, credit balance pill, user dropdown
- 4 tab interface: Text | Image | Audio | Video
- **Text tab:** Large textarea, paste text, click "Verify"
- **Image tab:** Drag-and-drop or click to upload, preview image
- **Audio tab:** Drag-and-drop or click to upload, show file name
- **Video tab:** Drag-and-drop or click to upload, show file name
- File size limits displayed (Image: 25MB, Audio: 50MB, Video: 100MB)
- After verification: show results panel with:
  - Circular score gauge (animated) showing AI probability
  - Verdict badge (AI Generated / Human Created / Mixed / Inconclusive)
  - Confidence level (High / Medium / Low)
  - Credits used
  - Detailed breakdown if available
- "Verify Another" button to reset
- Recent verifications sidebar (last 5)

### 5. History Page (`/history`)
- Table/card list of all past verifications
- Columns: Type icon, Content preview, Score, Verdict, Date
- Click to expand full details
- Delete option per item
- Pagination
- Filter by type (text/image/audio/video)
- Sort by date

### 6. Pricing Page (`/pricing`) — In-App Page
- Plan comparison cards: Free / Pro / Enterprise
- Feature checkmarks per plan
- Current plan highlighted
- "Upgrade" button → triggers Razorpay checkout
- Credit packs section below (buy additional credits)
- Clean, no marketing fluff — just plan cards and credit packs

### 7. Settings Page (`/settings`)
- Profile section: name, email (read-only)
- Update profile form
- Current plan & credits display
- Subscription management (cancel option)
- Account danger zone: delete account (with confirmation modal)

### 8. Admin Dashboard (`/admin`) — Admin users only
- Stats cards: Total users, Total verifications, Revenue, Active subscriptions
- Users table with search, pagination
- Adjust credits modal
- Verifications log table
- Payment history table
- Charts: verifications over time, revenue trend

### 9. 404 Page
- Friendly "page not found" message
- "Go to Dashboard" and "Go to Login" buttons

## Key Implementation Rules

1. **ALWAYS use the Axios interceptor** for auto-refreshing expired tokens. If a 401 is received, try refreshing the token once. If refresh fails, redirect to login.

2. **Loading states everywhere.** Every button that triggers an API call must show a spinner/loading state. Every page must show a skeleton loader while data loads.

3. **Error handling for every API call.** Display user-friendly error messages from the API response. Never show raw error objects.

4. **Mobile responsive.** All pages must work on mobile (375px+). Use Tailwind responsive prefixes (sm:, md:, lg:).

5. **Protected routes.** Dashboard, History, Settings, and Admin pages require authentication. Admin pages additionally require admin role check.

6. **Credit balance checks.** Before submitting a verification, check if user has enough credits. Show a modal suggesting upgrade if insufficient.

7. **File validation.** Validate file type and size on the frontend before uploading. Show clear error messages.

8. **Smooth transitions.** Use Tailwind transition classes for hover effects, page transitions, and modal animations.

9. **Page titles.** Use document.title on every route. Format: "Page Name | Smoodle Verified"

10. **No TypeScript.** Keep everything in plain JavaScript (.jsx files). This is intentional for speed of development.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is deployed on Vercel at app.smoodle.ai. Push to main branch triggers automatic deployment.

## Important Notes

- The backend is ALREADY deployed and working. Do NOT modify any backend code.
- Test all API integrations against the live backend URL.
- The backend returns JWT tokens — store access_token in memory/localStorage, refresh_token in localStorage.
- Google OAuth: the backend handles the full OAuth flow. The frontend just redirects to `/auth/google` and handles the callback.
- Razorpay: use the test key for development. The backend handles order creation and verification.
- All file uploads use `multipart/form-data` content type.
- The backend has CORS configured for `http://localhost:3000` and `http://localhost:5173` — both should work.
