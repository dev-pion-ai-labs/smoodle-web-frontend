# Smoodle Verified — Frontend Build Tasks

## Phase 0: Project Setup ✅ COMPLETED

### Task 0.1: Initialize React + Vite Project ✅
- [x] Run `npm create vite@latest . -- --template react` (in current directory)
- [x] Install core dependencies:
  ```bash
  npm install react-router-dom@6 zustand axios react-hook-form @hookform/resolvers zod lucide-react react-hot-toast recharts react-helmet-async
  ```
- [x] Install dev dependencies:
  ```bash
  npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer
  ```
- [x] Configure Tailwind with Smoodle brand colors, fonts, and content paths
- [x] Add Google Fonts (Plus Jakarta Sans, DM Sans, JetBrains Mono) to `index.html`
- [x] Set up `index.css` with Tailwind directives and custom font-family classes
- [x] Configure `vite.config.js` with path aliases (`@/` → `src/`)
- [x] Create `.env` and `.env.example` with environment variables
- [x] Create `.gitignore` (node_modules, dist, .env)
- [x] Copy logo file to `src/assets/logo.png`
- [x] Verify: `npm run dev` works ✓

### Task 0.2: Project Structure ✅
- [x] Create all directories as defined in CLAUDE.md project structure
- [x] Create placeholder files for organization
- [x] Set up path aliases in vite.config.js: `@components`, `@pages`, `@services`, `@store`, `@hooks`, `@utils`, `@assets`, `@routes`
- [x] Verify: imports with `@/` prefix work ✓

---

## Phase 1: Core Infrastructure ✅ COMPLETED

### Task 1.1: Axios API Client (`src/services/api.js`) ✅
- [x] Create Axios instance with `baseURL` from env variable
- [x] Add request interceptor: attach `Authorization: Bearer <token>` header from localStorage
- [x] Add response interceptor: on 401, attempt token refresh via `/auth/refresh`
- [x] If refresh succeeds: retry original request with new token
- [x] If refresh fails: clear auth state, redirect to `/login`
- [x] Export the configured Axios instance
- [x] Request queue to handle concurrent 401s during refresh

### Task 1.2: Zustand Stores ✅
- [x] **authStore.js**: user object, tokens, isAuthenticated, isAdmin, login/logout/setUser/updateCredits actions
- [x] **verifyStore.js**: currentResult, verificationHistory, loading states, pagination, filters
- [x] **uiStore.js**: sidebar open/close, modal states, mobile menu
- [x] Persist auth tokens in localStorage (rehydrate on app load)
- [x] Selector hooks for common use cases

### Task 1.3: Routing Setup (`src/routes/`) ✅
- [x] Create `AppRouter.jsx` with all routes defined + React.lazy() code splitting
- [x] Create `PrivateRoute.jsx`: checks isAuthenticated, redirects to `/login` if not
- [x] Create `AdminRoute.jsx`: checks isAuthenticated AND isAdmin, redirects to `/dashboard` if not admin
- [x] Define routes:
  - Public: `/`, `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/auth/google/callback`, `/pricing`
  - Private: `/dashboard`, `/history`, `/settings`
  - Admin: `/admin`
  - Catch-all: `*` → 404 page
- [x] All 13 page components created as placeholders
- [x] Suspense fallback with PageLoader

### Task 1.4: Layout Components ✅
- [x] **Navbar.jsx**: Logo, nav links (Dashboard, History, Pricing), credit balance badge, user dropdown (Settings, Logout), mobile hamburger menu
- [x] **DashboardLayout.jsx**: Wrapper with Navbar + main content area
- [x] **Footer.jsx**: Logo, links, social icons, copyright for landing page

### Task 1.5: Common UI Components ✅
All components built with Tailwind + micro-interactions:
- [x] **Button.jsx**: variants (primary/secondary/danger/outline/ghost), sizes (sm/md/lg), loading spinner, disabled state, hover:scale-[0.98] active:scale-95
- [x] **Input.jsx**: label, error message, icon support, show/hide password toggle, focus:ring-2
- [x] **Textarea.jsx**: multi-line input variant
- [x] **Select.jsx**: dropdown variant
- [x] **Card.jsx**: padding, shadow, rounded corners, hover:-translate-y-0.5 hover:shadow-lg, StatsCard variant
- [x] **Modal.jsx**: overlay fade + content scale animation, Escape to close, ConfirmModal, AlertModal variants
- [x] **Loader.jsx**: PageLoader, Spinner, InlineLoader, Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonTable, DotsLoader
- [x] **Badge.jsx**: 6 color variants, VerdictBadge, ContentTypeBadge, ConfidenceBadge, PlanBadge, StatusBadge presets
- [x] **FileUpload.jsx**: drag-and-drop with visual feedback, file preview, size validation, accepted types
- [x] **ScoreGauge.jsx**: animated SVG circle with smooth stroke-dashoffset animation, color transitions (green→amber→red), ScoreGaugeInline, ScoreComparison, ScorePill variants
- [x] Index exports for clean imports

### Build Verification ✅
- [x] `npm run build` - Success (216KB JS, 37KB CSS gzipped)
- [x] `npm run dev` - Success (localhost:5174)

---

## Phase 2: Authentication ✅ COMPLETED

### Task 2.1: Auth Service (`src/services/authService.js`) ✅
- [x] Implement all auth API calls:
  - [x] `signup(email, password, full_name)`
  - [x] `login(email, password)`
  - [x] `verifyOTP(email, otp)`
  - [x] `resendOTP(email)`
  - [x] `forgotPassword(email)`
  - [x] `resetPassword(token, new_password)`
  - [x] `getGoogleAuthUrl()` / `initiateGoogleAuth()` — redirects to Google OAuth
  - [x] `refreshToken(refresh_token)`
  - [x] `logout()`
  - [x] `getCurrentUser()` — fetch user profile
- [x] Clean error handling with user-friendly messages

### Task 2.2: Signup Page ✅
- [x] AuthLayout with centered card, Smoodle logo, background decoration
- [x] Form fields: Full Name, Email, Password, Confirm Password
- [x] Zod validation schema (email format, password strength, passwords match)
- [x] "Sign up with Google" button with AuthDivider
- [x] Submit button with loading state
- [x] Error messages displayed inline under each field
- [x] API error displayed as toast
- [x] On success: redirect to `/verify-otp` with email in state
- [x] Link to "Already have an account? Log in"

### Task 2.3: Login Page ✅
- [x] AuthLayout with centered card and logo
- [x] Form fields: Email, Password (with show/hide toggle)
- [x] "Continue with Google" button
- [x] Submit with loading state
- [x] On success: store tokens in authStore, fetch user, redirect to intended destination or `/dashboard`
- [x] "Forgot password?" link
- [x] Link to "Don't have an account? Sign up"

### Task 2.4: OTP Verification Page ✅
- [x] OTPInput component with 6 individual digit inputs
- [x] Auto-focus forward/backward on input/backspace
- [x] Auto-submit when all 6 digits entered
- [x] Handle paste (paste full OTP code)
- [x] "Resend OTP" button with 60-second cooldown timer
- [x] Display email being verified (from router state)
- [x] Redirect to signup if no email in state
- [x] On success: redirect to `/login` with success toast

### Task 2.5: Forgot Password & Reset Password Pages ✅
- [x] **Forgot Password**: email input, submit → success state with "Check your email" message
- [x] **Reset Password**: new password + confirm password, token from URL params
- [x] Invalid/expired token error state with "Request New Link" button
- [x] On success: success state with "Go to Login" button

### Task 2.6: Google OAuth Callback Page ✅
- [x] Full-page loading state with logo and spinner
- [x] "Signing you in..." text with reassurance
- [x] Extract tokens from URL search params
- [x] Fetch user profile via `getCurrentUser()`
- [x] Login with authStore
- [x] Redirect to `/dashboard`
- [x] Error state with styled error card and "Back to Login" button

### Shared Auth Components ✅
- [x] **AuthLayout**: Reusable auth page wrapper with logo, title, subtitle, background decoration
- [x] **GoogleAuthButton**: Google OAuth button with loading state
- [x] **AuthDivider**: "or" divider between OAuth and form
- [x] **OTPInput**: 6-digit input with auto-focus, paste handling, keyboard navigation

### Build Verification ✅
- [x] `npm run build` - Success (217KB JS, 39KB CSS)
- [x] `npm run dev` - Success (localhost:5174)

---

## Phase 3: Main Dashboard (Verification) ✅ COMPLETED

### Task 3.1: Verification Service (`src/services/verifyService.js`) ✅
- [x] `verifyText(text)` — POST with JSON body
- [x] `verifyImage(file)` — POST with FormData + progress callback
- [x] `verifyAudio(file)` — POST with FormData + progress callback
- [x] `verifyVideo(file)` — POST with FormData + progress callback
- [x] `getHistory(page, limit, type_filter)` — GET with query params
- [x] `getVerification(id)` — GET single result
- [x] `deleteVerification(id)` — DELETE
- [x] User Service created: `getProfile()`, `updateProfile()`, `getCredits()`, `getSubscription()`, `deleteAccount()`

### Task 3.2: Dashboard Page — Tab Interface ✅
- [x] Page title: "Verify Content"
- [x] Credit balance displayed prominently in header
- [x] 4 tabs with icons: Text (FileText), Image (Image), Audio (Mic), Video (Video)
- [x] Active tab indicator (underline in brand red)
- [x] Tab content area switches based on selection
- [x] Smooth tab transition animation (animate-in fade-in)
- [x] Credit cost badge shown per tab

### Task 3.3: Text Verification Tab ✅
- [x] Large textarea (10 rows) with placeholder: "Paste your text here to verify if it's AI-generated or human-written..."
- [x] Character count display (min 50, max 150,000)
- [x] "Verify Text" button (disabled if invalid, loading state during API call)
- [x] Credit cost badge: "Costs 1 credit"
- [x] Pre-check: if credits < cost, trigger upgrade modal
- [x] On submit: call API, show result
- [x] Clear button when text is present

### Task 3.4: File Verification Tabs (Image/Audio/Video) ✅
- [x] Drag-and-drop zone with dashed border, icon, and "Drop file here or click to browse"
- [x] On file selected: show file preview (image thumbnail) or file name + size
- [x] File type validation per type (image: jpg/png/gif/webp, audio: mp3/wav/ogg/m4a, video: mp4/mov/avi/mkv)
- [x] File size validation with clear error message (limits from constants)
- [x] "Verify" button with credit cost badge
- [x] Remove file button (X)
- [x] Upload progress bar with percentage during upload
- [x] "Analyzing..." state after upload completes
- [x] Pre-check credits before submission

### Task 3.5: Verification Result Display ✅
- [x] Slides in from right with fade animation (animate-in fade-in slide-in-from-right-4)
- [x] **ScoreGauge**: large circular animated gauge showing AI probability (0-100%)
- [x] Color-coded: Red (>70% AI), Amber (30-70%), Green (<30% AI)
- [x] **Verdict badge**: "AI Generated" (red), "Human Created" (green), "Mixed" (amber), "Inconclusive" (gray)
- [x] **Confidence level**: High / Medium / Low badge
- [x] **Credits used**: displayed inline
- [x] **Details section**: expandable accordion with JSON breakdown
- [x] "Verify Another" button to reset the form
- [x] "View History" link button
- [x] Compact result variant for history/sidebar

### Task 3.6: Recent Verifications Sidebar ✅
- [x] Right sidebar (desktop via grid) or below results (mobile)
- [x] Shows last 5 verifications from store
- [x] Each item: type icon, truncated content preview, score pill, time ago
- [x] Click to view full details in main panel
- [x] "View All" link → `/history`
- [x] Refresh button with loading state
- [x] Empty state: "No verifications yet"
- [x] Loading skeleton state

### Task 3.7: Upgrade Credits Modal ✅
- [x] Modal shown when user has insufficient credits
- [x] Displays current credits vs required credits
- [x] Credit costs reference table
- [x] Quick top-up credit pack options with links to pricing
- [x] Pro subscription upsell section
- [x] "Get Credits" CTA button

### Build Verification ✅
- [x] `npm run build` - Success (217KB JS, 41KB CSS gzipped)
- [x] All components compile without errors

---

## Phase 4: History & User Features ✅ COMPLETED

### Task 4.1: History Page ✅
- [x] Page title: "Verification History"
- [x] Filter bar: type dropdown (All/Text/Image/Audio/Video), sort dropdown (Newest/Oldest)
- [x] Results as cards with responsive design
- [x] Each item shows: type icon, content preview (truncated text or filename), AI score with color, verdict badge, date
- [x] Click item → opens detail modal with full result info
- [x] Delete button per item (with confirmation modal)
- [x] Pagination at bottom (Previous / Page X of Y / Next)
- [x] Empty state: "No verifications yet. Start verifying content!"
- [x] Loading skeleton state while fetching
- [x] Error state with retry button

### Task 4.2: Verification Detail Modal ✅
- [x] Modal displays full verification details
- [x] ScoreGauge with AI probability
- [x] Verdict and confidence badges
- [x] Content preview (text or file)
- [x] Image preview for image verifications
- [x] Metadata: credits used, verification date
- [x] Expandable technical details accordion

### Task 4.3: User Service (`src/services/userService.js`) ✅
- [x] `getProfile()` — GET /users/me
- [x] `updateProfile(data)` — PATCH /users/me
- [x] `getCredits()` — GET /users/me/credits
- [x] `getSubscription()` — GET /users/me/subscription
- [x] `deleteAccount()` — DELETE /users/me

### Task 4.4: Settings Page ✅
- [x] **Profile section:** Full name (editable), email (read-only), save button with loading
- [x] **Plan & Credits section:** Current plan badge, credits balance, upgrade button
- [x] **Subscription section:** Plan details, status, next billing date, cancel button
- [x] **Danger Zone:** Delete account with type-to-confirm modal ("Type DELETE")
- [x] Cancel subscription confirmation modal
- [x] Form validation with Zod schema

### Build Verification ✅
- [x] `npm run build` - Success (218KB JS, 42KB CSS gzipped)
- [x] All components compile without errors

---

## Phase 5: Payments & Pricing ✅ COMPLETED

### Task 5.1: Payment Service (`src/services/paymentService.js`) ✅
- [x] `createOrder(data)` — POST to create Razorpay order (pack_id or plan_id)
- [x] `verifyPayment(data)` — POST to verify payment signature
- [x] `subscribe(planId)` — POST to create subscription
- [x] `cancelSubscription()` — POST to cancel subscription
- [x] `getPaymentHistory(page, limit)` — GET payment history
- [x] `getCreditPacks()` — GET available credit packs (with fallback defaults)
- [x] `getSubscriptionPlans()` — GET subscription plans (with fallback defaults)

### Task 5.2: Razorpay Integration Utility (`src/utils/razorpay.js`) ✅
- [x] `loadRazorpayScript()` — dynamically inject Razorpay checkout.js script
- [x] `openRazorpayCheckout(options)` — open checkout modal with order details
- [x] Options: order_id, amount, currency, name, description, prefill (email, name)
- [x] Success callback handling with payment verification
- [x] Error callback handling with error display
- [x] Modal dismiss callback handling
- [x] `isRazorpayAvailable()` — check if Razorpay is loaded
- [x] Script caching to prevent duplicate loads
- [x] Smoodle brand color (#E8453C) in checkout theme

### Task 5.3: Pricing Page ✅
- [x] Hero section: "Simple, Transparent Pricing"
- [x] 3 plan cards side by side (stacked on mobile):
  - [x] **Free**: ₹0, 10 credits on signup, basic features
  - [x] **Pro**: ₹499/month, 500 credits/month, "Most Popular" badge, elevated styling
  - [x] **Enterprise**: ₹2,499/month, 5000 credits/month, API access, "Contact Sales"
- [x] Feature comparison list per card with checkmarks
- [x] Current plan detection and "Current Plan" disabled button
- [x] CTA buttons: "Current Plan" / "Upgrade to Pro" / "Contact Sales"
- [x] Upgrade flow: click → create order → open Razorpay → verify → update credits → toast

### Task 5.4: Credit Packs Section ✅
- [x] 4 credit pack cards: Starter (50), Popular (200), Pro (500), Enterprise (2000)
- [x] "Best Value" badge on popular pack
- [x] Credits amount, price, and "Buy Now" button
- [x] Loading states per pack during purchase
- [x] Login required message for unauthenticated users
- [x] URL query param support (?pack=popular) for deep linking from upgrade modal

### Task 5.5: Additional Sections ✅
- [x] "Why Choose Smoodle?" features section (4 icons)
- [x] FAQ section with 4 common questions
- [x] CTA section with "Ready to Get Started?"
- [x] Navbar and Footer integration
- [x] Razorpay script preloading on page mount

### Build Verification ✅
- [x] `npm run build` - Success (218KB JS, 43KB CSS gzipped)
- [x] All components compile without errors

---

## Phase 6: Admin Dashboard ✅ COMPLETED

### Task 6.1: Admin Service (`src/services/adminService.js`) ✅
- [x] `getStats()` — dashboard statistics
- [x] `getUsers(page, limit, search)` — paginated user list with search
- [x] `getUserDetails(id)` — single user details
- [x] `adjustCredits(id, amount, reason)` — adjust user credits
- [x] `getVerifications(page, limit, type)` — all verifications with filter
- [x] `getPayments(page, limit)` — all payments
- [x] `getSubscriptions(page, limit)` — all subscriptions
- [x] `getVerificationChartData(period)` — chart data for verifications
- [x] `getRevenueChartData(period)` — chart data for revenue
- [x] Mock data fallbacks for development

### Task 6.2: Admin Dashboard Page ✅
- [x] Admin-only layout with DashboardLayout
- [x] **Stats Cards row**: Total Users, Verifications, Revenue (₹), Active Subscriptions
- [x] Trend indicators on each stat card (up/down percentage)
- [x] **Verifications Line Chart**: Using Recharts with period selector (7d/30d/90d)
- [x] **Revenue Bar Chart**: Using Recharts with formatted Y-axis
- [x] Tab interface for Users/Verifications/Payments

### Task 6.3: Users Table ✅
- [x] Search bar for filtering by email or name
- [x] Table columns: User, Email, Plan, Credits, Joined, Actions
- [x] PlanBadge for user plan display
- [x] "Adjust Credits" button per row
- [x] Pagination with showing X to Y of Z

### Task 6.4: Adjust Credits Modal ✅
- [x] User info display (name, email, current credits)
- [x] Add/Remove toggle buttons
- [x] Amount input field (positive or negative)
- [x] Optional reason field
- [x] Loading state during API call
- [x] Refresh users table after adjustment

### Task 6.5: Verifications Table ✅
- [x] Table columns: Type, User, Score, Verdict, Credits, Date
- [x] Type icons for text/image/audio/video
- [x] Color-coded score display
- [x] VerdictBadge for verdict display
- [x] Pagination

### Task 6.6: Payments Table ✅
- [x] Table columns: User, Amount, Type, Status, Date
- [x] Formatted currency display (₹)
- [x] StatusBadge for payment status
- [x] Pagination

### Build Verification ✅
- [x] `npm run build` - Success (219KB JS + 383KB AdminDashboard with Recharts)
- [x] All components compile without errors

---

## Phase 7: App Polish & Cleanup ✅ COMPLETED

> **Note**: This is the authenticated web application only. The marketing site is hosted separately at smoodle.ai. This app is hosted at app.smoodle.ai. No landing page needed.

### Task 7.1: Documentation Updates ✅
- [x] Update CLAUDE.md to remove landing page references
- [x] Update CLAUDE.md to note app vs marketing site separation
- [x] Add deployment info (Vercel at app.smoodle.ai)
- [x] Update FRONTEND_TASKS.md with Phase 7 changes

### Task 7.2: Routing & Cleanup ✅
- [x] Fix "/" route: redirect to `/dashboard` if authenticated, `/login` if not
- [x] Delete `Landing.jsx` (not needed - marketing site is separate)
- [x] Delete `Footer.jsx` (not needed - this is an app, not a marketing site)
- [x] Remove Footer references from any layouts

### Task 7.3: Navbar Improvements ✅
- [x] Make Navbar feel like Linear/Vercel dashboard navbar
- [x] Clean, minimal design with subtle hover states
- [x] Compact layout with good spacing
- [x] Smooth transitions
- [x] User dropdown polish
- [x] Mobile hamburger menu polish

### Task 7.4: Auth Pages Polish ✅
- [x] Polish Login page (first impression since no landing page)
- [x] Polish Signup page (uses same AuthLayout)
- [x] Add subtle animations and transitions
- [x] Ensure brand consistency
- [x] Review error states and loading states

### Task 7.5: 404 Page ✅
- [x] Smoodle-branded 404 design
- [x] "Page not found" message
- [x] "Go to Dashboard" and "Go to Login" buttons (based on auth state)
- [x] Verify: navigating to unknown route shows 404

### Task 7.6: Pricing Page Cleanup ✅
- [x] Remove "Why Choose Smoodle?" section (marketing fluff)
- [x] Remove FAQ section (marketing fluff)
- [x] Remove CTA section (marketing fluff)
- [x] Keep only: plan cards, credit packs, clean layout
- [x] Uses DashboardLayout - in-app page, not marketing page

### Task 7.7: Final Polish ✅
- [x] Pricing page now uses DashboardLayout
- [x] Loading and error states review
- [x] Build verification: `npm run build` - Success
- [x] Verify: app feels polished and production-ready

### Build Verification ✅
- [x] `npm run build` - Success (219KB JS, 46KB CSS gzipped)

---

## Phase 8: Build & Deployment ✅ COMPLETED

> **Note**: App is already deployed on Vercel at app.smoodle.ai

### Task 8.1: Production Build ✅
- [x] Run `npm run build`
- [x] Fix any build errors or warnings
- [x] Test production build with `npm run preview`
- [x] Verify: production build works identically to dev

### Task 8.2: Deployment Configuration ✅
- [x] Deployed on Vercel (auto-deploys from GitHub main branch)
- [x] SPA redirect rules configured (all routes → index.html)
- [x] Production env variables set
- [x] Verify: deployed app works with live backend at app.smoodle.ai

---

## Acceptance Criteria for Each Phase

Before moving to the next phase:
1. All tasks in the phase are complete
2. No console errors or warnings
3. All API integrations tested against live backend
4. Responsive on mobile and desktop
5. Loading and error states implemented
6. Git commit with descriptive message
