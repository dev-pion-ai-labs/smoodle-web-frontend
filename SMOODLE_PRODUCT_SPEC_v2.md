# SMOODLE VERIFIED — Backend Product Specification

**Version:** 1.1  
**Created:** January 2026  
**Updated:** January 30, 2026  
**Author:** Rohith (Fullstack AI Engineer)  
**Status:** Pre-Development

---

## 1. Executive Summary

Smoodle Verified is an AI content verification platform that analyzes text, images, audio, and video to determine authenticity — detecting whether content is AI-generated or human-created. Think of it as "Grammarly for truth."

**One-Liner:** Did AI make that up? Find out in seconds.

**Core Value Proposition:** In a world flooded with AI-generated content, Smoodle provides instant, reliable verification with clear confidence scores.

---

## 2. Product Overview

### 2.1 What Smoodle Does

Users can submit content (text, images, audio, video) and receive:
- **Verdict:** AI-Generated or Human-Created
- **Confidence Score:** 0-100% certainty
- **Readability Score:** (for text) How easy to read
- **Attack Detection:** (for text) Zero-width spaces, homoglyph attacks

### 2.2 Verification Standards

**Binary Integrity:** Content is either verified as authentic OR flagged as AI-generated. No grey areas.
- A single AI-generated frame in a video flags the entire content
- Like DocuSign for authenticity — it's verified or it isn't

### 2.3 Content Types Supported

| Type | Max Size | Formats | Detection Provider |
|------|----------|---------|-------------------|
| Text | 150,000 chars | Plain text, paste | Winston AI |
| Images | 25 MB | jpg, png, gif, webp | SightEngine |
| Audio | 50 MB | mp3, ogg, opus, flac, wav | SightEngine |
| Video | 100 MB | mp4, webm, avi, mov, mkv | SightEngine |

### 2.4 Detection Providers

| Provider | Content Type | API |
|----------|-------------|-----|
| **Winston AI** | Text | `api.gowinston.ai/v2/ai-content-detection` |
| **SightEngine** | Image, Video, Audio | `api.sightengine.com/1.0/check.json` |

---

## 3. User Flows

### 3.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

[New User] ─┬─► [Email Signup]
            │      │
            │      ▼
            │   [Enter Email + Password]
            │      │
            │      ▼
            │   [Send OTP via Resend]
            │      │
            │      ▼
            │   [User Enters OTP]
            │      │
            │      ▼
            │   [OTP Valid?] ─No──► [Resend OTP / Error]
            │      │
            │     Yes
            │      │
            │      ▼
            │   [Create Account + 5 Free Credits]
            │      │
            │      ▼
            │   [Dashboard]
            │
            └─► [Google OAuth]
                   │
                   ▼
                [Google Consent Screen]
                   │
                   ▼
                [Callback with Token]
                   │
                   ▼
                [Create/Login Account]
                   │
                   ▼
                [Dashboard]

[Existing User] ─► [Email + Password]
                      │
                      ▼
                   [Authenticate]
                      │
                      ▼
                   [Dashboard]
```

### 3.2 Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

[User on Dashboard]
       │
       ▼
[Select Content Type: Text | Image | Audio | Video]
       │
       ├─► [Text] ──► [Paste/Type Text (min 300 chars)]
       │
       ├─► [Image] ─► [Upload File ≤25MB]
       │
       ├─► [Audio] ─► [Upload File ≤50MB]
       │
       └─► [Video] ─► [Upload File ≤100MB]
              │
              ▼
       [Check Credits]
              │
              ├─► [No Credits] ──► [Upgrade Modal]
              │                          │
              │                          ▼
              │                    [Razorpay Checkout]
              │
              └─► [Has Credits]
                     │
                     ▼
              [Deduct 1 Credit]
                     │
                     ▼
              [Upload to Railway Storage] (for files)
                     │
                     ▼
              [Send to Detection API]
              │      │
              │      ├─► Text → Winston AI
              │      └─► Image/Video/Audio → SightEngine
              │
              ▼
              [Process Response]
                     │
                     ▼
              [Store in History]
                     │
                     ▼
              [Display Results]
                     │
                     ├── Verdict: AI-Generated / Human-Created
                     ├── Confidence Score: 0-100%
                     ├── Readability Score (text only)
                     └── Attack Detection (text only)
```

### 3.3 Subscription & Credits Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 SUBSCRIPTION & CREDITS FLOW                     │
└─────────────────────────────────────────────────────────────────┘

[FREE TIER]
    │
    └── 5 Lifetime Verifications
           │
           ▼
        [Credits Exhausted]
           │
           ▼
        [Upgrade Prompt]
           │
           ├─► [PRO PLAN: ₹499/month]
           │      │
           │      ├── 500 verifications/month
           │      ├── All content types
           │      └── Buy additional credits: ₹99/50 credits
           │
           └─► [ENTERPRISE PLAN: ₹2,499/month]
                  │
                  ├── 2000 verifications/month
                  ├── All content types
                  ├── API Access (for integration)
                  └── Buy additional credits

[Credit Purchase Flow]
    │
    ▼
[Select Credit Pack]
    │
    ▼
[Razorpay Checkout]
    │
    ▼
[Webhook: payment.captured]
    │
    ▼
[Add Credits to Account]
```

---

## 4. Technical Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPS                                │
│         React Native Mobile | Next.js Web | Chrome Extension    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                            │
│                    (Railway Deployment)                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │    Auth     │ Verification │  Payments   │    Admin    │     │
│  │   Service   │   Service    │   Service   │   Service   │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PostgreSQL   │  │     Redis     │  │    Railway    │
│   (Railway)   │  │   (Railway)   │  │    Storage    │
│               │  │               │  │    Bucket     │
│  - Users      │  │  - Sessions   │  │               │
│  - Verifs     │  │  - Rate Limit │  │  - Images     │
│  - Payments   │  │  - Cache      │  │  - Audio      │
│  - History    │  │  - OTP Store  │  │  - Video      │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Winston AI   │  │  SightEngine  │  │   Razorpay    │
│  (Text Only)  │  │ (Media Files) │  │   Payments    │
│               │  │               │  │               │
│  - AI Text    │  │  - AI Image   │  │  - Subs       │
│    Detection  │  │  - AI Video   │  │  - Credits    │
│  - Human      │  │  - AI Audio   │  │  - Webhooks   │
│    Score      │  │  - Deepfake   │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                   ┌───────────────┐
                   │    Resend     │
                   │    Email      │
                   │               │
                   │  - OTP        │
                   │  - Receipts   │
                   │  - Alerts     │
                   └───────────────┘
```

### 4.2 Tech Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| **Backend Framework** | FastAPI (Python 3.11+) | Async, fast, great for AI integration |
| **Database** | PostgreSQL (Railway) | Reliable, scalable, JSON support |
| **Cache/Sessions** | Redis (Railway) | Rate limiting, OTP storage, sessions |
| **File Storage** | Railway Storage Bucket | Cost-effective, same platform |
| **Text Detection** | Winston AI | Reliable text AI detection |
| **Media Detection** | SightEngine | Image, video, audio AI detection |
| **Payments** | Razorpay | India-first, supports INR + USD |
| **Email** | Resend | Developer-friendly, reliable |
| **Auth** | JWT + OAuth2 | Secure, stateless |
| **Hosting** | Railway Pro | Simple deployment, good scaling |

### 4.3 Scaling for 5K Concurrent Users

**FastAPI Configuration:**
```python
# Async connection pooling
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 10

# Redis connection pool
REDIS_POOL_SIZE = 50

# Uvicorn workers
WORKERS = 4  # Railway Pro allows multiple workers
```

**Rate Limiting Strategy:**
```
- Global: 1000 requests/minute per IP
- Auth endpoints: 10 requests/minute per IP
- Verification: 60 requests/minute per user
- API (Enterprise): 100 requests/minute per API key
```

**Background Tasks:**
- Video processing uses async background tasks
- Webhook processing is queued
- Email sending is non-blocking

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      users      │       │  subscriptions  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ email           │   │   │ user_id (FK)    │───┐
│ password_hash   │   │   │ plan            │   │
│ name            │   │   │ status          │   │
│ auth_provider   │   │   │ razorpay_sub_id │   │
│ google_id       │   │   │ current_period_ │   │
│ email_verified  │   │   │   start/end     │   │
│ credits         │   │   │ created_at      │   │
│ lifetime_verifs │   │   └─────────────────┘   │
│ is_admin        │   │                         │
│ created_at      │   │   ┌─────────────────┐   │
│ updated_at      │   │   │    api_keys     │   │
└─────────────────┘   │   ├─────────────────┤   │
        │             │   │ id (PK)         │   │
        │             └──►│ user_id (FK)    │◄──┘
        │                 │ key_hash        │
        │                 │ name            │
        │                 │ is_active       │
        │                 │ last_used_at    │
        │                 │ created_at      │
        │                 └─────────────────┘
        │
        │             ┌─────────────────┐
        │             │  verifications  │
        │             ├─────────────────┤
        └────────────►│ id (PK)         │
                      │ user_id (FK)    │
                      │ content_type    │
                      │ file_url        │
                      │ text_content    │
                      │ verdict         │
                      │ confidence      │
                      │ human_score     │
                      │ readability     │
                      │ attack_detected │
                      │ api_response    │
                      │ created_at      │
                      └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    payments     │       │  credit_packs   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ name            │
│ amount          │       │ credits         │
│ currency        │       │ price_inr       │
│ type            │       │ price_usd       │
│ razorpay_id     │       │ is_active       │
│ status          │       └─────────────────┘
│ metadata        │
│ created_at      │
└─────────────────┘
```

### 5.2 Table Definitions

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- NULL for OAuth users
    name VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'email',  -- 'email' or 'google'
    google_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    credits INTEGER DEFAULT 5,  -- Free tier starts with 5
    lifetime_verifications INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,  -- 'free', 'pro', 'enterprise'
    status VARCHAR(50) DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
    razorpay_subscription_id VARCHAR(255),
    razorpay_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    monthly_credits_remaining INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Verifications table (History)
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,  -- 'text', 'image', 'audio', 'video'
    file_url TEXT,  -- For media files
    text_content TEXT,  -- For text verifications (stored for reference)
    file_size_bytes INTEGER,
    
    -- Results
    verdict VARCHAR(50),  -- 'ai_generated', 'human_created', 'inconclusive'
    confidence_score DECIMAL(5,4),  -- 0.0000 to 1.0000
    human_score INTEGER,  -- 0-100 (from Winston AI for text)
    readability_score INTEGER,  -- 0-100 (from Winston AI for text)
    
    -- Attack detection (text only)
    attack_detected JSONB,  -- {"zero_width_space": false, "homoglyph_attack": false}
    
    -- Raw API response for debugging
    api_response JSONB,
    api_provider VARCHAR(50),  -- 'winston' or 'sightengine'
    
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,  -- Amount in smallest currency unit (paise/cents)
    currency VARCHAR(10) DEFAULT 'INR',
    payment_type VARCHAR(50),  -- 'subscription', 'credits'
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'captured', 'failed'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table (for Enterprise)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,  -- SHA256 hash of the key
    key_prefix VARCHAR(10) NOT NULL,  -- First 10 chars for identification
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    requests_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Credit Packs table
CREATE TABLE credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price_inr INTEGER NOT NULL,  -- Price in paise
    price_usd INTEGER NOT NULL,  -- Price in cents
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OTP table (or use Redis)
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'email_verification',
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_created_at ON verifications(created_at DESC);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
```

---

## 6. API Endpoints

### 6.1 Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register with email/password |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/verify-otp` | Verify OTP for email |
| POST | `/api/v1/auth/resend-otp` | Resend OTP |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| GET | `/api/v1/auth/google` | Initiate Google OAuth |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/logout` | Logout (invalidate token) |

### 6.2 User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/me/credits` | Get credit balance |
| GET | `/api/v1/users/me/subscription` | Get subscription details |
| DELETE | `/api/v1/users/me` | Delete account |

### 6.3 Verification APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/verify/text` | Verify text content |
| POST | `/api/v1/verify/image` | Verify image file |
| POST | `/api/v1/verify/audio` | Verify audio file |
| POST | `/api/v1/verify/video` | Verify video file |
| GET | `/api/v1/verify/history` | Get verification history |
| GET | `/api/v1/verify/{id}` | Get specific verification |
| DELETE | `/api/v1/verify/{id}` | Delete verification from history |

### 6.4 Payment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-order` | Create Razorpay order |
| POST | `/api/v1/payments/verify` | Verify payment signature |
| POST | `/api/v1/payments/subscribe` | Create subscription |
| POST | `/api/v1/payments/cancel-subscription` | Cancel subscription |
| GET | `/api/v1/payments/history` | Get payment history |
| POST | `/api/v1/payments/webhook` | Razorpay webhook handler |

### 6.5 Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| GET | `/api/v1/admin/users/{id}` | Get user details |
| PATCH | `/api/v1/admin/users/{id}/credits` | Adjust user credits |
| GET | `/api/v1/admin/stats` | Dashboard statistics |
| GET | `/api/v1/admin/verifications` | All verifications |
| GET | `/api/v1/admin/payments` | All payments |
| GET | `/api/v1/admin/subscriptions` | All subscriptions |

### 6.6 Enterprise API (API Key Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/enterprise/verify` | Verify content with API key |
| GET | `/api/v1/enterprise/usage` | Get API usage stats |
| POST | `/api/v1/enterprise/keys` | Generate new API key |
| DELETE | `/api/v1/enterprise/keys/{id}` | Revoke API key |

---

## 7. External Integrations

### 7.1 Winston AI Integration (Text Detection)

**Endpoint:** `https://api.gowinston.ai/v2/ai-content-detection`

**Authentication:**
```
Header: Authorization: Bearer {WINSTON_API_KEY}
```

**Request:**
```python
import httpx

async def verify_text_winston(text: str) -> dict:
    headers = {
        "Authorization": f"Bearer {WINSTON_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "version": "latest",  # Uses latest model (4.13)
        "sentences": True,
        "language": "auto"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.gowinston.ai/v2/ai-content-detection",
            headers=headers,
            json=payload
        )
        return response.json()
```

**Response Handling:**
```python
{
    "status": 200,
    "score": 85,  # Human score: 0-100 (higher = more human)
    "sentences": [
        {"text": "First sentence.", "score": 90},
        {"text": "Second sentence.", "score": 80}
    ],
    "input": "text",
    "attack_detected": {
        "zero_width_space": false,
        "homoglyph_attack": false
    },
    "readability_score": 72,
    "credits_used": 150,
    "credits_remaining": 9850,
    "version": "4.13",
    "language": "en"
}

# Interpretation:
# score >= 70 → Human-created (high confidence)
# score 40-69 → Uncertain (mixed content)
# score < 40 → AI-generated (high confidence)
```

**Text Requirements:**
- Minimum: 300 characters
- Recommended: 600+ characters for reliable results
- Maximum: 150,000 characters per request

### 7.2 SightEngine Integration (Image/Video/Audio Detection)

**Endpoint:** `https://api.sightengine.com/1.0/check.json`

**Authentication:**
```
Query params: api_user={API_USER}&api_secret={API_SECRET}
```

#### Image Detection

```python
import httpx

async def verify_image_sightengine(image_url: str) -> dict:
    params = {
        "url": image_url,
        "models": "genai",
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.sightengine.com/1.0/check.json",
            params=params
        )
        return response.json()

# OR upload raw image:
async def verify_image_upload(file_bytes: bytes, filename: str) -> dict:
    params = {
        "models": "genai",
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    files = {"media": (filename, file_bytes)}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sightengine.com/1.0/check.json",
            data=params,
            files=files
        )
        return response.json()
```

**Response:**
```python
{
    "status": "success",
    "request": {
        "id": "req_xxx",
        "timestamp": 1491402308.4762,
        "operations": 5
    },
    "type": {
        "ai_generated": 0.01  # 0-1 score (higher = more AI)
    },
    "media": {
        "id": "med_xxx",
        "uri": "image.jpg"
    }
}

# Interpretation:
# ai_generated < 0.3 → Human-created (high confidence)
# ai_generated 0.3-0.7 → Uncertain
# ai_generated > 0.7 → AI-generated (high confidence)
```

#### Video Detection

```python
# Short video (<1 minute) - Synchronous
async def verify_video_short(file_bytes: bytes, filename: str) -> dict:
    params = {
        "models": "genai",
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    files = {"media": (filename, file_bytes)}
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.sightengine.com/1.0/video/check-sync.json",
            data=params,
            files=files
        )
        return response.json()

# Long video (>1 minute) - Asynchronous with callback
async def verify_video_long(file_bytes: bytes, filename: str, callback_url: str) -> dict:
    params = {
        "models": "genai",
        "callback_url": callback_url,
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    files = {"media": (filename, file_bytes)}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sightengine.com/1.0/video/check.json",
            data=params,
            files=files
        )
        return response.json()
```

**Video Response:**
```python
{
    "status": "success",
    "data": {
        "frames": [
            {
                "info": {"id": "med_xxx_1", "position": 0},
                "type": {"ai_generated": 0.99}
            },
            {
                "info": {"id": "med_xxx_2", "position": 1},
                "type": {"ai_generated": 0.98}
            }
        ]
    }
}
# If ANY frame has ai_generated > 0.7, flag entire video
```

#### Audio/Music Detection

```python
async def verify_audio_sightengine(file_bytes: bytes, filename: str) -> dict:
    params = {
        "models": "genai",
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    files = {"audio": (filename, file_bytes)}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.sightengine.com/1.0/audio/check.json",
            data=params,
            files=files
        )
        return response.json()
```

**Audio Response:**
```python
{
    "status": "success",
    "type": {
        "ai_generated": 0.01  # 0-1 score
    },
    "media": {
        "id": "med_xxx",
        "uri": "music.mp3"
    }
}
```

### 7.3 Score Normalization

Since Winston AI and SightEngine use different scoring systems, we normalize to a consistent 0-100 "human score":

```python
def normalize_score(api_provider: str, raw_score: float) -> int:
    """Convert API scores to 0-100 human score (higher = more human)"""
    
    if api_provider == "winston":
        # Winston already returns 0-100 human score
        return int(raw_score)
    
    elif api_provider == "sightengine":
        # SightEngine returns 0-1 AI score (higher = more AI)
        # Invert: human_score = 100 - (ai_score * 100)
        return int(100 - (raw_score * 100))

def get_verdict(human_score: int) -> str:
    """Determine verdict from normalized human score"""
    if human_score >= 70:
        return "human_created"
    elif human_score <= 30:
        return "ai_generated"
    else:
        return "inconclusive"
```

### 7.4 Razorpay Integration

**Subscription Plans:**
```python
PLANS = {
    'pro': {
        'name': 'Smoodle Pro',
        'amount': 49900,  # ₹499 in paise
        'currency': 'INR',
        'period': 'monthly',
        'credits': 500
    },
    'enterprise': {
        'name': 'Smoodle Enterprise',
        'amount': 249900,  # ₹2,499 in paise
        'currency': 'INR',
        'period': 'monthly',
        'credits': 2000
    }
}
```

**Credit Packs:**
```python
CREDIT_PACKS = {
    'pack_50': {
        'name': '50 Credits',
        'credits': 50,
        'amount': 9900,  # ₹99 in paise
        'currency': 'INR'
    },
    'pack_200': {
        'name': '200 Credits',
        'credits': 200,
        'amount': 34900,  # ₹349 in paise
        'currency': 'INR'
    }
}
```

**Webhook Events to Handle:**
- `payment.captured` → Add credits / Activate subscription
- `subscription.activated` → Set subscription active
- `subscription.charged` → Reset monthly credits
- `subscription.cancelled` → Mark subscription cancelled
- `payment.failed` → Log failure, notify user

### 7.5 Resend Email Integration

**Email Templates:**

1. **OTP Verification**
   - Subject: "Verify your Smoodle account"
   - Contains: 6-digit OTP, expires in 10 minutes

2. **Welcome Email**
   - Subject: "Welcome to Smoodle Verified!"
   - Contains: Getting started guide, 5 free credits info

3. **Password Reset**
   - Subject: "Reset your Smoodle password"
   - Contains: Reset link, expires in 1 hour

4. **Payment Receipt**
   - Subject: "Payment confirmed - Smoodle"
   - Contains: Amount, plan/credits purchased, invoice

5. **Subscription Renewal**
   - Subject: "Your Smoodle subscription renewed"
   - Contains: Next billing date, credits reset

### 7.6 Google OAuth Configuration

**Required Scopes:**
- `openid`
- `email`
- `profile`

**Callback URL:** `https://api.smoodle.ai/api/v1/auth/google/callback`

**Flow:**
1. Frontend redirects to `/api/v1/auth/google`
2. Backend redirects to Google consent screen
3. Google redirects back with authorization code
4. Backend exchanges code for tokens
5. Backend creates/updates user account
6. Backend returns JWT to frontend

---

## 8. Folder Structure

```
smoodle-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Settings and environment variables
│   ├── database.py                # Database connection and sessions
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── subscription.py
│   │   ├── verification.py
│   │   ├── payment.py
│   │   ├── api_key.py
│   │   └── otp.py
│   │
│   ├── schemas/                   # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── verification.py
│   │   ├── payment.py
│   │   └── admin.py
│   │
│   ├── api/                       # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py          # Main v1 router
│   │   │   ├── auth.py            # Auth endpoints
│   │   │   ├── users.py           # User endpoints
│   │   │   ├── verification.py    # Verification endpoints
│   │   │   ├── payments.py        # Payment endpoints
│   │   │   ├── admin.py           # Admin endpoints
│   │   │   └── enterprise.py      # Enterprise API endpoints
│   │   └── deps.py                # Shared dependencies
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── verification_service.py
│   │   ├── payment_service.py
│   │   ├── winston_service.py     # Winston AI (text detection)
│   │   ├── sightengine_service.py # SightEngine (media detection)
│   │   ├── email_service.py       # Resend integration
│   │   └── storage_service.py     # Railway storage
│   │
│   ├── core/                      # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py            # JWT, password hashing
│   │   ├── oauth.py               # Google OAuth
│   │   ├── rate_limiter.py        # Redis rate limiting
│   │   └── exceptions.py          # Custom exceptions
│   │
│   └── utils/                     # Helper functions
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
│
├── alembic/                       # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── tests/                         # Test files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_verification.py
│   └── test_payments.py
│
├── scripts/                       # Utility scripts
│   ├── seed_db.py                # Seed initial data
│   └── create_admin.py           # Create admin user
│
├── .env.example                  # Environment template
├── .gitignore
├── requirements.txt
├── Dockerfile
├── railway.toml                  # Railway configuration
└── README.md
```

---

## 9. Environment Variables

```env
# Application
APP_NAME=smoodle-api
APP_ENV=development  # development, staging, production
DEBUG=true
SECRET_KEY=your-super-secret-key-min-32-chars

# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/smoodle

# Redis (Railway)
REDIS_URL=redis://default:pass@host:6379

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Winston AI (Text Detection)
WINSTON_API_KEY=your-winston-api-key

# SightEngine (Image/Video/Audio Detection)
SIGHTENGINE_API_USER=your-api-user
SIGHTENGINE_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://api.smoodle.ai/api/v1/auth/google/callback

# Resend Email
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@smoodle.ai

# Railway Storage
RAILWAY_STORAGE_BUCKET=smoodle-files
RAILWAY_STORAGE_URL=https://storage.railway.app

# CORS
CORS_ORIGINS=https://smoodle.ai,https://app.smoodle.ai

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
```

---

## 10. Subscription & Pricing Model

### 10.1 Plans

| Feature | FREE | PRO (₹499/mo) | ENTERPRISE (₹2,499/mo) |
|---------|------|---------------|------------------------|
| Verifications | 5 lifetime | 500/month | 2000/month |
| Text | ✓ | ✓ | ✓ |
| Images | ✓ | ✓ | ✓ |
| Audio | ✓ | ✓ | ✓ |
| Video | ✓ | ✓ | ✓ |
| History | Forever | Forever | Forever |
| API Access | ✗ | ✗ | ✓ |
| Buy Credits | ✗ | ✓ | ✓ |
| Priority Support | ✗ | ✗ | ✓ |

### 10.2 Credit Packs (Pro & Enterprise only)

| Pack | Credits | Price (INR) | Price (USD) |
|------|---------|-------------|-------------|
| Starter | 50 | ₹99 | $1.20 |
| Standard | 200 | ₹349 | $4.20 |
| Power | 500 | ₹799 | $9.60 |

### 10.3 Credit Consumption

| Content Type | Credits Used |
|--------------|--------------|
| Text | 1 |
| Image | 1 |
| Audio | 1 |
| Video | 1 |

---

## 11. Security Considerations

### 11.1 Authentication Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with short expiry (30 min access, 7 day refresh)
- OTP expires in 10 minutes, max 3 attempts
- Rate limiting on auth endpoints

### 11.2 API Security
- HTTPS only (enforced by Railway)
- CORS restricted to known origins
- API keys hashed in database
- Request signing for webhooks

### 11.3 Data Security
- Files auto-deleted after 24 hours (optional)
- Sensitive data encrypted at rest
- No storage of raw passwords
- GDPR-compliant data deletion

### 11.4 Input Validation
- File type validation (MIME + extension)
- File size limits enforced
- Text length limits (300 min, 150K max)
- SQL injection prevention via ORM

---

## 12. Admin Dashboard Features

### 12.1 Dashboard Overview
- Total users (today/week/month/all-time)
- Total verifications (by type)
- Revenue (subscriptions + credits)
- Active subscriptions breakdown

### 12.2 User Management
- View all users with search/filter
- View user details and history
- Adjust user credits manually
- View user's verification history
- Disable/enable accounts

### 12.3 Verification Logs
- View all verifications
- Filter by type, verdict, date
- View detailed API response
- Export to CSV

### 12.4 Payment Management
- View all payments
- Filter by type, status, date
- Manual refund capability
- Subscription management

### 12.5 Statistics
- Daily/weekly/monthly active users
- Verification trends by content type
- Revenue charts
- Credit consumption patterns

---

## 13. Success Metrics

| Metric | MVP Target | 3-Month Target |
|--------|------------|----------------|
| Daily Active Users | 100+ | 1,000+ |
| Daily Verifications | 500+ | 10,000+ |
| Paid Conversions | 5% | 10% |
| API Response Time | <2s | <1s |
| Uptime | 99% | 99.9% |

---

## 14. Future Enhancements (Post-MVP)

1. **Chrome Extension Backend** — Dedicated endpoints for extension
2. **Batch Verification API** — Multiple files in one request
3. **Webhook Notifications** — Notify on verification complete
4. **Team/Organization Accounts** — Shared credits, admin roles
5. **White-label API** — Custom branding for enterprise
6. **Verification Certificates** — Shareable proof of authenticity
7. **Browser Widget** — Embed verification on any website

---

*Document Version: 1.1 | Last Updated: January 30, 2026*
