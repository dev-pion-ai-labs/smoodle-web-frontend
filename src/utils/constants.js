// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smoodle Verified'
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

// External Services
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

// Route Paths
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  GOOGLE_CALLBACK: '/auth/google/callback',
  PRICING: '/pricing',

  // Protected routes
  DASHBOARD: '/dashboard',
  HISTORY: '/history',
  SETTINGS: '/settings',

  // Enterprise routes
  AUDIT: '/audit',
  AUDIT_RESULT: '/audit/:auditId',
  AUDIT_HISTORY: '/audit/history',

  // Admin routes
  ADMIN: '/admin',
}

// Credit Costs (all types cost 1 credit currently)
export const CREDIT_COSTS = {
  text: 1,
  image: 1,
  audio: 1,
  video: 1,
}

export const AUDIT_CREDIT_COST = 10

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 25 * 1024 * 1024, // 25MB
  audio: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
  audit: 50 * 1024 * 1024, // 50MB
}

// Accepted File Types
export const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
  audit: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'],
}

// File Extensions for Display
export const FILE_EXTENSIONS = {
  image: '.jpg, .jpeg, .png, .gif, .webp',
  audio: '.mp3, .wav, .ogg, .m4a',
  video: '.mp4, .mov, .avi, .mkv, .webm',
  audit: '.pdf, .docx, .doc, .txt',
}

// Verdict Types
export const VERDICTS = {
  AI_GENERATED: 'ai_generated',
  HUMAN_CREATED: 'human_created',
  MIXED: 'mixed',
  INCONCLUSIVE: 'inconclusive',
}

// Confidence Levels
export const CONFIDENCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

// Subscription Plans
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
}

// Plan Details
export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 10,
    period: 'one-time',
    features: [
      '10 free credits',
      'Text verification',
      'Image verification',
      'Audio verification',
      'Video verification',
      'Verification history',
    ],
  },
  pro: {
    name: 'Pro',
    price: 499,
    credits: 500,
    period: 'month',
    features: [
      '500 credits per month',
      'All verification types',
      'Priority processing',
      'Buy additional credits',
      'Verification history',
      'Email support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 2499,
    credits: 5000,
    period: 'month',
    features: [
      '5000 credits per month',
      'All verification types',
      'Priority processing',
      'API access',
      'Document Audit (fact-checking)',
      'Buy additional credits',
      'Priority support',
    ],
  },
}

// Audit Pipeline Steps
export const AUDIT_STEPS = [
  { key: 'pending', label: 'Queued' },
  { key: 'parsing', label: 'Parsing Document' },
  { key: 'detecting', label: 'Detecting Context' },
  { key: 'skill_building', label: 'Building Verification Skill' },
  { key: 'extracting', label: 'Extracting Claims' },
  { key: 'verifying', label: 'Verifying Claims' },
  { key: 'generating_report', label: 'Generating Report' },
  { key: 'complete', label: 'Complete' },
]
