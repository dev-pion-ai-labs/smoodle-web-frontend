# Smoodle Verified — Frontend Build Tasks

## Phase 0: Project Setup

### Task 0.1: Initialize React + Vite Project
- Run `npm create vite@latest . -- --template react` (in current directory)
- Install core dependencies:
  ```bash
  npm install react-router-dom@6 zustand axios react-hook-form @hookform/resolvers zod lucide-react react-hot-toast recharts react-helmet-async
  ```
- Install dev dependencies:
  ```bash
  npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
  ```
- Configure Tailwind: `npx tailwindcss init -p`
- Configure `tailwind.config.js` with Smoodle brand colors, fonts, and content paths
- Add Google Fonts (Plus Jakarta Sans, DM Sans, JetBrains Mono) to `index.html`
- Set up `index.css` with Tailwind directives and custom font-family classes
- Configure `vite.config.js` with proxy for local dev (optional) and path aliases (`@/` → `src/`)
- Create `.env` and `.env.example` with environment variables
- Create `.gitignore` (node_modules, dist, .env)
- Copy logo file to `src/assets/logo.png`
- Verify: `npm run dev` works and shows default Vite page with Tailwind working

### Task 0.2: Project Structure
- Create all directories as defined in CLAUDE.md project structure
- Create placeholder files for organization
- Set up path aliases in vite.config.js: `@components`, `@pages`, `@services`, `@store`, `@hooks`, `@utils`, `@assets`
- Verify: imports with `@/` prefix work

---

## Phase 1: Core Infrastructure

### Task 1.1: Axios API Client (`src/services/api.js`)
- Create Axios instance with `baseURL` from env variable
- Add request interceptor: attach `Authorization: Bearer <token>` header from authStore
- Add response interceptor: on 401, attempt token refresh via `/auth/refresh`
- If refresh succeeds: retry original request with new token
- If refresh fails: clear auth state, redirect to `/login`
- Export the configured Axios instance
- Verify: Axios instance can make unauthenticated request to backend `/health` endpoint

### Task 1.2: Zustand Stores
- **authStore.js**: user object, tokens, isAuthenticated, isAdmin, login/logout/setUser actions
- **verifyStore.js**: currentResult, verificationHistory, loading states
- **uiStore.js**: sidebar open/close, modal states
- Persist auth tokens in localStorage (rehydrate on app load)
- Verify: stores can be imported and used

### Task 1.3: Routing Setup (`src/routes/`)
- Create `AppRouter.jsx` with all routes defined
- Create `PrivateRoute.jsx`: checks isAuthenticated, redirects to `/login` if not
- Create `AdminRoute.jsx`: checks isAuthenticated AND isAdmin, redirects to `/dashboard` if not admin
- Define routes:
  - Public: `/`, `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/auth/google/callback`, `/pricing`
  - Private: `/dashboard`, `/history`, `/settings`
  - Admin: `/admin`
  - Catch-all: `*` → 404 page
- Verify: navigation between routes works

### Task 1.4: Layout Components
- **Navbar.jsx**: Logo, nav links (Dashboard, History, Pricing), credit balance badge, user dropdown (Settings, Logout), mobile hamburger menu
- **Sidebar.jsx** (for admin): Admin nav links
- **DashboardLayout.jsx**: Wrapper with Navbar + main content area
- **Footer.jsx**: Simple footer for landing page
- Verify: layout renders on all pages

### Task 1.5: Common UI Components
Build these reusable components with Tailwind:
- **Button.jsx**: variants (primary/secondary/danger/outline), sizes (sm/md/lg), loading state with spinner, disabled state
- **Input.jsx**: label, error message, icon support, show/hide password toggle
- **Card.jsx**: padding, shadow, rounded corners, hover effect
- **Modal.jsx**: overlay, centered card, close button, animation (fade + scale)
- **Loader.jsx**: full-page spinner, inline spinner, skeleton loaders
- **Badge.jsx**: color variants for verdict types
- **FileUpload.jsx**: drag-and-drop zone, click to browse, file preview, size validation, accepted types
- **ScoreGauge.jsx**: circular progress indicator showing AI/Human score (animated SVG circle)
- Verify: all components render correctly in isolation

---

## Phase 2: Authentication

### Task 2.1: Auth Service (`src/services/authService.js`)
- Implement all auth API calls:
  - `signup(email, password, full_name)`
  - `login(email, password)`
  - `verifyOTP(email, otp)`
  - `resendOTP(email)`
  - `forgotPassword(email)`
  - `resetPassword(token, new_password)`
  - `googleAuth()` — returns Google OAuth URL
  - `refreshToken(refresh_token)`
  - `logout()`
- Each function calls the backend API and returns the response
- Verify: at least one call succeeds against live backend

### Task 2.2: Signup Page
- Centered card layout with Smoodle logo at top
- Form fields: Full Name, Email, Password, Confirm Password
- Zod validation schema (email format, password min 8 chars, passwords match)
- "Continue with Google" button (divider: "or")
- Submit button with loading state
- Error messages displayed inline under each field
- API error displayed as toast
- On success: redirect to `/verify-otp` with email in state
- Link to "Already have an account? Log in"
- Verify: can create a real account on the backend

### Task 2.3: Login Page
- Centered card layout with Smoodle logo
- Form fields: Email, Password (with show/hide toggle)
- "Continue with Google" button
- Submit with loading state
- On success: store tokens in authStore, redirect to `/dashboard`
- "Forgot password?" link
- Link to "Don't have an account? Sign up"
- Verify: can log in and receive tokens

### Task 2.4: OTP Verification Page
- 6 individual digit inputs with auto-focus forward/backward
- Auto-submit when all 6 digits entered
- "Resend OTP" button with 60-second cooldown timer
- Display email being verified (from router state)
- On success: redirect to `/login` with success toast
- Verify: OTP flow works end-to-end

### Task 2.5: Forgot Password & Reset Password Pages
- **Forgot Password**: email input, submit → "Check your email" message
- **Reset Password**: new password + confirm password, token from URL params
- On success: redirect to `/login` with success toast
- Verify: password reset flow works

### Task 2.6: Google OAuth Callback Page
- Full-page loading spinner with "Signing you in..." text
- Extract tokens from URL search params (the backend redirects here with tokens)
- Store tokens in authStore
- Fetch user profile via `/users/me`
- Redirect to `/dashboard`
- On error: show error message, link to `/login`
- Verify: Google OAuth full flow works

---

## Phase 3: Main Dashboard (Verification)

### Task 3.1: Verification Service (`src/services/verifyService.js`)
- `verifyText(text)` — POST with JSON body
- `verifyImage(file)` — POST with FormData
- `verifyAudio(file)` — POST with FormData
- `verifyVideo(file)` — POST with FormData
- `getHistory(page, limit, type_filter)` — GET with query params
- `getVerification(id)` — GET single result
- `deleteVerification(id)` — DELETE
- Verify: text verification works against live backend

### Task 3.2: Dashboard Page — Tab Interface
- Page title: "Verify Content"
- Credit balance displayed prominently
- 4 tabs with icons: Text (FileText), Image (Image), Audio (Mic), Video (Video)
- Active tab indicator (underline in brand red)
- Tab content area switches based on selection
- Smooth tab transition animation
- Verify: tabs switch correctly

### Task 3.3: Text Verification Tab
- Large textarea (8+ rows) with placeholder: "Paste your text here to verify..."
- Character count display
- "Verify Text" button (disabled if empty, loading state during API call)
- Credit cost badge: "Costs 1 credit"
- Pre-check: if credits < 1, show upgrade modal instead
- On submit: call API, show result
- Verify: can verify text and see result

### Task 3.4: File Verification Tabs (Image/Audio/Video)
- Drag-and-drop zone with dashed border, icon, and "Drop file here or click to browse"
- On file selected: show file preview (image thumbnail) or file name + size
- File type validation (image: jpg/png/gif/webp, audio: mp3/wav/ogg/m4a, video: mp4/mov/avi/mkv)
- File size validation with clear error message
- "Verify" button with credit cost badge
- Remove file button (X)
- Loading state with progress indication during upload
- Pre-check credits before submission
- Verify: can upload and verify an image

### Task 3.5: Verification Result Display
- Slides in from right or fades in after verification completes
- **ScoreGauge**: large circular animated gauge showing AI probability (0-100%)
- Color-coded: Red (>70% AI), Amber (30-70%), Green (<30% AI)
- **Verdict badge**: "AI Generated" (red), "Human Created" (green), "Mixed" (amber), "Inconclusive" (gray)
- **Confidence level**: High / Medium / Low
- **Credits used**: "1 credit deducted"
- **Details section**: expandable accordion with provider-specific breakdown
- "Verify Another" button to reset the form
- "View in History" link
- Verify: results display correctly with proper colors and animations

### Task 3.6: Recent Verifications Sidebar
- Right sidebar (desktop) or below results (mobile)
- Shows last 5 verifications
- Each item: type icon, truncated content, score, time ago
- Click to view full details
- "View All" link → `/history`
- Verify: sidebar populates after verifications

---

## Phase 4: History & User Features

### Task 4.1: History Page
- Page title: "Verification History"
- Filter bar: type dropdown (All/Text/Image/Audio/Video), sort dropdown (Newest/Oldest)
- Results as cards (mobile) or table rows (desktop)
- Each item shows: type icon, content preview (truncated text or filename), AI score with color, verdict badge, date
- Click item → expand to show full result details in a modal or slide-out panel
- Delete button per item (with confirmation)
- Pagination at bottom (Previous / Page X of Y / Next)
- Empty state: "No verifications yet. Start verifying content!"
- Verify: history loads from API, pagination works

### Task 4.2: User Service & Settings Page
- **userService.js**: `getProfile()`, `updateProfile(data)`, `getCredits()`, `getSubscription()`, `deleteAccount()`
- **Settings Page sections:**
  - Profile: name (editable), email (read-only), save button
  - Plan & Credits: current plan name, credits remaining, upgrade button
  - Subscription: plan details, next billing date, cancel button (with confirmation modal)
  - Danger Zone: "Delete Account" button with type-to-confirm modal ("Type DELETE to confirm")
- Verify: profile update works, subscription info displays

---

## Phase 5: Payments & Pricing

### Task 5.1: Payment Service (`src/services/paymentService.js`)
- `createOrder(pack_id_or_plan_id)` — POST to create Razorpay order
- `verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature)` — POST to verify
- `subscribe(plan_id)` — POST to create subscription
- `cancelSubscription()` — POST to cancel
- `getPaymentHistory()` — GET payment history
- Verify: can create a test order

### Task 5.2: Razorpay Integration Utility
- Create `src/utils/razorpay.js`:
  - `loadRazorpayScript()` — dynamically inject Razorpay checkout.js script
  - `openRazorpayCheckout(options)` — open checkout modal with order details
- Options include: order_id, amount, currency, name, description, prefill (email, name)
- Handle success callback: call `/payments/verify`, show success toast, update credits
- Handle failure callback: show error toast
- Verify: Razorpay modal opens in test mode

### Task 5.3: Pricing Page
- Hero section: "Choose Your Plan"
- 3 plan cards side by side (stacked on mobile):
  - **Free**: ₹0, 10 credits one-time, basic features, current plan highlight if applicable
  - **Pro**: ₹499/month, 500 credits/month, all features, "Most Popular" badge
  - **Enterprise**: ₹2,499/month, 5000 credits/month, API access, priority support
- Feature comparison list per card with checkmarks
- CTA button per plan: "Current Plan" (disabled) / "Upgrade" / "Contact Sales"
- Upgrade flow: click → create order → open Razorpay → verify → update UI
- **Credit Packs section** below plans:
  - Additional credit packs for one-time purchase
  - Cards showing credits amount, price, "Buy" button
- Verify: full purchase flow works in Razorpay test mode

---

## Phase 6: Admin Dashboard

### Task 6.1: Admin Service (`src/services/adminService.js`)
- `getStats()` — dashboard statistics
- `getUsers(page, limit, search)` — paginated user list
- `getUserDetails(id)` — single user
- `adjustCredits(id, amount, reason)` — adjust user credits
- `getVerifications(page, limit)` — all verifications
- `getPayments(page, limit)` — all payments
- Verify: admin endpoints return data (must be logged in as admin)

### Task 6.2: Admin Dashboard Page
- Admin-only layout with sidebar navigation
- **Stats Cards row**: Total Users, Total Verifications, Revenue (₹), Active Subscriptions — each with icon and trend indicator
- **Charts section**: Verifications over time (line chart), Revenue trend (bar chart) — using Recharts
- **Users Table**: name, email, plan, credits, joined date, actions (adjust credits)
- Search bar for users
- Click "Adjust Credits" → modal with amount input (+/-) and reason
- **Verifications Table**: user email, type, score, verdict, date
- **Payments Table**: user email, amount, type, status, date
- Pagination on all tables
- Verify: admin page shows real data, credit adjustment works

---

## Phase 7: Landing Page & Polish

### Task 7.1: Landing Page
- **Hero Section**: 
  - Large heading: "Is it real or AI? Find out in seconds."
  - Subheading explaining Smoodle's value
  - Two CTA buttons: "Try Free" (→ signup), "View Pricing" (→ pricing)
  - Hero illustration or animated graphic
- **Features Section**: 4 cards (Text, Image, Audio, Video) with icons and descriptions
- **How It Works**: 3-step visual flow (Upload → AI Analysis → Get Results)
- **Pricing Preview**: mini version of pricing cards
- **Trust/Social Proof section**: stats or testimonials placeholder
- **CTA Section**: "Ready to verify? Start for free"
- **Footer**: Logo, links (Product, Pricing, Privacy, Terms), copyright
- Verify: landing page is visually polished and responsive

### Task 7.2: 404 Page
- Smoodle-branded 404 illustration or text
- "Page not found" message
- "Go Home" and "Go to Dashboard" buttons
- Verify: navigating to unknown route shows 404

### Task 7.3: Loading & Error States
- Add skeleton loaders to Dashboard, History, Admin pages
- Add error boundaries for component crashes
- Add empty states for all list views
- Add offline detection banner
- Verify: loading states appear before data loads

### Task 7.4: Responsive Design Pass
- Test all pages at 375px, 768px, 1024px, 1440px
- Fix any overflow, text truncation, or layout issues
- Ensure mobile nav hamburger menu works
- Ensure modals are scrollable on small screens
- Verify: all pages work on mobile

### Task 7.5: Final Polish
- Page transition animations (fade in)
- Button hover/press animations
- Toast notifications styled with brand colors
- Console.log cleanup
- Environment variable validation on startup
- Favicon and page titles on all routes
- Verify: app feels polished and production-ready

---

## Phase 8: Build & Deployment Prep

### Task 8.1: Production Build
- Run `npm run build`
- Fix any build errors or warnings
- Test production build with `npm run preview`
- Verify: production build works identically to dev

### Task 8.2: Deployment Configuration
- Create `Dockerfile` for containerized deployment (if deploying to Railway)
- OR configure for Vercel/Netlify (create `vercel.json` or `netlify.toml`)
- Add SPA redirect rules (all routes → index.html)
- Set production env variables
- Verify: deployed app works with live backend

---

## Acceptance Criteria for Each Phase

Before moving to the next phase:
1. All tasks in the phase are complete
2. No console errors or warnings
3. All API integrations tested against live backend
4. Responsive on mobile and desktop
5. Loading and error states implemented
6. Git commit with descriptive message
