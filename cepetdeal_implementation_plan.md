# CepetDeal - Car Marketplace Implementation Plan

## Project Overview

Membangun website marketplace mobil baru dan bekas dengan fitur multi-role user system, listing management, dan favoriting system.

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS + Custom CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Storage:** Cloudinary (images)
- **Deployment:** Vercel (Frontend) + Railway/Supabase (Database)

**Brand Colors:**
- Primary: `#ff6348` (Coral Red)
- Secondary: `#2d3436` (Dark Gray)
- Accent: `#00b894` (Green)

---

## Core Features

### 1. Multi-Role User System
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access: manage users, listings, dealers, articles, banners, testimonials, site settings |
| **DEALER** | Create/manage used car listings, view inquiries, dealer profile management |
| **SELLER** | Create/manage used car listings (max 5 active), view inquiries |
| **BUYER** | Browse listings, save favorites, send messages, use calculator |

### 2. Car Listings
- **New Cars (Mobil Baru)**: ONLY Admin can create/edit/delete new car listings
- **Used Cars (Mobil Bekas)**: Dealers and Sellers can create/edit/delete their listings
- Featured listings support
- Multi-image uploads (up to 10 images)
- YouTube video embed support
- View counter tracking

### 3. Search & Filter
- Filter by: Brand, Model, Year, Price, Transmission, Fuel Type, Mileage, Location
- Sort by: Newest, Price (Low/High), Mileage
- Grid/List view toggle

### 4. User Interactions
- Favorites/Wishlist system
- Messaging system between buyers and sellers
- View history tracking

### 5. Articles/Blog System
- CMS untuk membuat dan mengelola artikel
- Admin-only article creation and management
- Categories: News, Reviews, Tips, Buying Guide
- SEO-friendly URLs

### 6. Dealer Verification
- Dealer application with document upload
- Admin approval workflow
- Verified dealer badge

### 7. Admin Panel
- Dashboard with statistics
- User management
- Listing moderation (approve/reject)
- Dealer verification
- Banner management
- Testimonial management
- **Article management (CMS)**
- Site settings

### 8. Additional Features
- Credit calculator
- Car comparison (up to 3 cars)
- Promo banner slider on homepage
- Customer testimonials slider

### 9. Monetization Features
- **Premium Dealer Plans** - Subscription packages for dealers
- **Listing Boost/Featured** - Pay to promote listings
- **Banner Ads** - Third-party banner advertisement slots

### 10. Trust & Safety Features
- **Report System** - Report suspicious listings and users
- **Reviews & Ratings** - Rate sellers/dealers after transactions
- **Verification Badges** - Verified badges for trusted sellers

### 11. Communication & Notifications
- **Email Notifications** - Automated email alerts
- **Saved Searches** - Save search criteria with alerts
- **Price Alerts** - Get notified when prices drop
- **Live Chat Support** - Customer support widget

### 12. SEO & Marketing
- **Dynamic Meta Tags** - SEO-optimized per page
- **Structured Data (Schema)** - Schema.org for car listings
- **Social Share Optimization** - Open Graph, Twitter Cards
- **Google Analytics Integration** - Event tracking

### 13. Dealer/Seller Tools
- **Bulk Upload** - CSV/Excel import for multiple listings
- **Listing Expiration** - Auto-expire after X days
- **Analytics Dashboard** - Track views and inquiries
- **Lead Management** - Manage and track leads

### 14. Advanced Features
- **Map Integration** - Show dealer/seller locations
- **Social Login** - Google/Facebook authentication
- **Multi-language Support** - Indonesian/English toggle
- **Virtual Tours** - 360° photo viewer

---

## Application Flow

### User Registration & Authentication Flow
```
┌─────────────┐
│ Visit Site  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Login       │────▶│ Dashboard   │
│ Register    │     │ (By Role)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────────┐
│ Select Role During Registration     │
│ ○ Buyer  ○ Seller  ○ Dealer         │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Dealer Applicants Only              │
│ → Upload Documents                  │
│ → Wait for Admin Approval           │
└─────────────────────────────────────┘
```

### Listing Creation Flow
```
┌─────────────────────────────────────────────────────────┐
│                   NEW CAR (Mobil Baru)                  │
│                     🔒 ADMIN ONLY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Admin → /admin/listings/new → Select "New" Condition   │
│         → Fill Details → Upload Images → Publish        │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 USED CAR (Mobil Bekas)                  │
│              👤 DEALER & SELLER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dealer/Seller → /dashboard/listings/new                │
│               → Select "Used" Condition                 │
│               → Fill Details → Upload Images            │
│               → Submit for Approval                     │
│                     ↓                                   │
│               Admin Review → Approve/Reject             │
│                     ↓                                   │
│               Listing Published                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Article Management Flow (CMS)
```
┌─────────────────────────────────────────────────────────┐
│                   ARTICLE MANAGEMENT                    │
│                     🔒 ADMIN ONLY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Admin → /admin/articles → Click "New Article"          │
│         → Enter Title, Content, Category                │
│         → Upload Featured Image                         │
│         → Set SEO Meta (slug, description)              │
│         → Publish as Draft or Active                    │
│                     ↓                                   │
│         Article appears on /artikel page                │
│         Related articles shown on car detail pages      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Buyer Journey Flow
```
┌─────────────┐
│ Browse Cars │
└──────┬──────┘
       │
       ▼
┌───────────────────────┐
│ Search & Filter       │
│ - Brand/Model         │
│ - Price Range         │
│ - Location            │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐     ┌──────────────────┐
│ View Listing Detail   │────▶│ Add to Favorites │
│ - Image Slider        │     │ Send Message     │
│ - YouTube Video       │     │ Share Listing    │
│ - Spec Table          │     └──────────────────┘
│ - Features Tab        │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ Contact Seller        │
│ - WhatsApp Direct     │
│ - Internal Message    │
└──────┬────────────────┘
       │
       ▼
┌───────────────────────┐
│ Use Calculator        │
│ Compare Cars          │
└───────────────────────┘
```

### Admin Moderation Flow
```
┌─────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Pending      │  │ Dealer       │  │ Article      │ │
│  │ Listings     │  │ Applications │  │ Management   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         ▼                 ▼                 ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Review       │  │ Review       │  │ Create/Edit  │ │
│  │ Approve/     │  │ Documents    │  │ Articles     │ │
│  │ Reject       │  │ Verify       │  │ Publish      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> **Technology Stack Confirmation**
> Please confirm if the proposed stack (Next.js + PostgreSQL + Prisma) is acceptable, or if you prefer alternative technologies.

> [!IMPORTANT]
> **Hosting Decision**
> - Where will the database be hosted? (Supabase, Railway, PlanetScale, or self-hosted)
> - Where will images be stored? (Cloudinary, AWS S3, or local)

> [!IMPORTANT]
> **Payment Integration**
> Will there be paid features (listing boost, premium dealer accounts)? If yes, which payment provider? (Midtrans, Xendit, Stripe)

---

## Proposed Changes

### Phase 1: Project Setup & Foundation

---

#### [NEW] Project Root Structure

```
f:/website/cepetdeal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes group
│   │   ├── (auth)/             # Auth routes group
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/              # Admin panel routes
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── forms/              # Form components
│   │   ├── layouts/            # Layout components
│   │   └── features/           # Feature-specific components
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── utils.ts            # Utility functions
│   │   └── constants.ts        # App constants
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── services/               # API service functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Migration files
├── public/
│   ├── images/
│   └── icons/
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

---

#### [NEW] [package.json](file:///f:/website/cepetdeal/package.json)

**Dependencies to install:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "cloudinary": "^1.41.0",
    "swr": "^2.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hot-toast": "^2.4.0",
    "sharp": "^0.33.0",
    "nodemailer": "^6.9.0",
    "resend": "^3.0.0",
    "midtrans-client": "^1.3.0",
    "xendit-node": "^1.0.0",
    "stripe": "^14.0.0",
    "papaparse": "^5.4.0",
    "xlsx": "^0.18.0",
    "@tinymce/tinymce-react": "^5.0.0",
    "react-quill": "^2.0.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "@panzoom/panzoom": "^4.5.0",
    "recharts": "^2.10.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "embla-carousel-react": "^8.0.0",
    "swiper": "^11.0.0",
    "react-dropzone": "^14.2.0",
    "yup": "^1.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "next-themes": "^0.2.0",
    "next-pwa": "^5.6.0",
    "next-seo": "^6.4.0",
    "@sentry/nextjs": "^7.100.0",
    "redis": "^4.6.0",
    "bull": "^4.12.0",
    "cron": "^3.1.0",
    "react-gtm-module": "^2.0.11",
    "zod": "^3.22.0",
    "nanoid": "^5.0.0",
    "slugify": "^1.6.0",
    "class-validator": "^0.14.0",
    "jsonwebtoken": "^9.0.0",
    "argon2": "^0.31.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/nodemailer": "^6.4.0",
    "@types/papaparse": "^5.3.0",
    "@types/leaflet": "^1.9.0",
    "@types/cron": "^2.4.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

---

#### [NEW] [tailwind.config.js](file:///f:/website/cepetdeal/tailwind.config.js)

Custom theme configuration with brand colors:
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6348',
          50: '#fff5f3',
          100: '#ffe8e4',
          500: '#ff6348',
          600: '#e5593f',
          700: '#cc4e36',
        },
        secondary: '#2d3436',
        accent: '#00b894',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

#### [NEW] [prisma/schema.prisma](file:///f:/website/cepetdeal/prisma/schema.prisma)

Complete database schema:

```prisma
// User & Authentication
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  phone         String?
  avatar        String?
  role          UserRole  @default(BUYER)
  emailVerified DateTime?
  provider      String?   @default("credentials") // credentials, google, facebook
  providerId    String?   @unique
  isSuspended   Boolean   @default(false)
  isVerified    Boolean   @default(false)
  verificationBadge String? // VERIFIED_SELLER, VERIFIED_DEALER, etc
  language      String    @default("id") // id, en
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  dealer        Dealer?
  listings      Listing[]
  favorites     Favorite[]
  sentMessages  Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  viewHistory   ViewHistory[]
  articles      Article[] @relation("ArticleAuthor")
  reviewsGiven  Review[] @relation("ReviewReviewer")
  reviewsReceived Review[] @relation("ReviewSeller")
  reportsCreated Report[] @relation("ReportReporter")
  reportsReviewed Report[] @relation("ReportReviewer")
  savedSearches SavedSearch[]
  priceAlerts   PriceAlert[]
  notifications Notification[]
  payments      Payment[]
  boostsCreated ListingBoost[]
  analytics     Analytics[]
  activityLogs  ActivityLog[] @relation("ActivityLogs")
}

enum UserRole {
  ADMIN
  DEALER
  SELLER
  BUYER
}

model Dealer {
  id           String   @id @default(cuid())
  userId       String   @unique
  companyName  String
  address      String
  city         String
  description  String?
  logo         String?
  documents    String[] // Array of document URLs
  verified     Boolean  @default(false)
  verifiedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Car Listings
model Brand {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  logo      String?
  createdAt DateTime  @default(now())

  models    Model[]
  listings  Listing[]
}

model Model {
  id        String    @id @default(cuid())
  name      String
  slug      String
  brandId   String
  createdAt DateTime  @default(now())

  brand     Brand     @relation(fields: [brandId], references: [id], onDelete: Cascade)
  listings  Listing[]

  @@unique([brandId, slug])
}

model Listing {
  id           String        @id @default(cuid())
  userId       String
  brandId      String
  modelId      String
  title        String
  slug         String        @unique
  year         Int
  price        BigInt
  condition    CarCondition
  transmission Transmission
  fuelType     FuelType
  bodyType     BodyType
  mileage      Int           // in km
  color        String
  engineSize   Int?          // in cc
  plateNumber  String?       // Plat nomor
  description  String
  location     String
  latitude     Float?
  longitude    Float?
  images       String[]      // Array of image URLs
  youtubeUrl   String?       // YouTube video URL
  virtualTourUrl String?     // 360° tour URL
  status       ListingStatus @default(PENDING)
  featured     Boolean       @default(false)
  isUrgent     Boolean       @default(false)
  isBoosted    Boolean       @default(false)
  expiresAt    DateTime?     // Listing expiration date
  views        Int           @default(0)
  contacts     Int           @default(0) // Contact button clicks
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand        Brand         @relation(fields: [brandId], references: [id])
  model        Model         @relation(fields: [modelId], references: [id])
  favorites    Favorite[]
  messages     Message[]
  viewHistory  ViewHistory[]
  features     CarFeature[]
  reviews      Review[]
  priceAlerts  PriceAlert[]
  boosts       ListingBoost[]
  analytics    Analytics[]
  leads        Lead[]
}

enum CarCondition {
  NEW
  USED
}

enum Transmission {
  MANUAL
  AUTOMATIC
  CVT
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  ELECTRIC
}

enum BodyType {
  SEDAN
  SUV
  MPV
  HATCHBACK
  COUPE
  PICKUP
  VAN
}

enum ListingStatus {
  PENDING
  ACTIVE
  SOLD
  REJECTED
  EXPIRED
}

// User Interactions
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  listingId  String?
  content    String
  readAt     DateTime?
  createdAt  DateTime @default(now())

  sender     User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  listing    Listing? @relation(fields: [listingId], references: [id], onDelete: SetNull)
}

model ViewHistory {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  viewedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
}

// Car Features (for features tab)
model CarFeature {
  id        String   @id @default(cuid())
  listingId String
  category  String   // e.g., "Eksterior", "Interior", "Keselamatan", "Hiburan"
  name      String   // e.g., "Sunroof", "Leather Seats"
  createdAt DateTime @default(now())

  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

// Homepage Banners (Promo Slider)
model Banner {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  image     String
  link      String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Customer Testimonials
model Testimonial {
  id        String   @id @default(cuid())
  name      String
  role      String?  // e.g., "Pembeli Toyota Avanza"
  avatar    String?
  content   String
  rating    Int      @default(5) // 1-5 stars
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

// Site Settings
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}

// Articles / Blog
model Article {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  content      String   @db.Text
  excerpt      String?
  featuredImage String?
  category     ArticleCategory
  tags         String[] // Array of tag strings
  authorId     String   // Admin user ID
  status       ArticleStatus @default(DRAFT)
  metaTitle    String?
  metaDescription String?
  views        Int      @default(0)
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  author       User     @relation("ArticleAuthor", fields: [authorId], references: [id], onDelete: Cascade)
}

enum ArticleCategory {
  NEWS
  REVIEW
  TIPS
  GUIDE
  PROMO
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ============================================
// NEW MODELS - MONETIZATION
// ============================================

model SubscriptionPlan {
  id             String   @id @default(cuid())
  name           String
  description    String
  price          BigInt
  currency       String   @default("IDR")
  duration       Int      // in days
  maxListings    Int
  maxFeatured    Int
  canBulkUpload  Boolean  @default(false)
  hasAnalytics   Boolean  @default(false)
  isActive       Boolean  @default(true)
  features       String[] // Array of feature strings
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  subscriptions  DealerSubscription[]
}

model DealerSubscription {
  id              String   @id @default(cuid())
  dealerId        String
  planId          String
  status          SubscriptionStatus @default(ACTIVE)
  startDate       DateTime
  endDate         DateTime
  autoRenew       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  dealer          Dealer   @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  plan            SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  payments        Payment[]
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING
}

model Payment {
  id              String   @id @default(cuid())
  userId          String
  subscriptionId  String?
  amount          BigInt
  currency        String   @default("IDR")
  status          PaymentStatus @default(PENDING)
  paymentMethod   String
  paymentChannel  String?  // e.g., "bca", "mandiri", "gopay"
  transactionId   String?  @unique
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription    DealerSubscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  EXPIRED
}

model ListingBoost {
  id              String   @id @default(cuid())
  listingId       String
  userId          String
  boostType       BoostType
  startDate       DateTime
  endDate         DateTime
  amount          BigInt
  status          BoostStatus @default(ACTIVE)
  paymentId       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  listing         Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum BoostType {
  FEATURED_HOME
  FEATURED_CATEGORY
  URGENT_BADGE
  TOP_LISTING
}

enum BoostStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

model BannerAd {
  id              String   @id @default(cuid())
  title           String
  imageUrl        String
  linkUrl         String?
  position        AdPosition
  startDate       DateTime
  endDate         DateTime?
  advertiserName  String?
  isActive        Boolean  @default(true)
  clicks          Int      @default(0)
  impressions     Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AdPosition {
  HOME_TOP
  HOME_MIDDLE
  HOME_BOTTOM
  SIDEBAR
  CATEGORY_TOP
}

// ============================================
// NEW MODELS - TRUST & SAFETY
// ============================================

model Report {
  id              String   @id @default(cuid())
  reporterId      String
  reportableType  ReportableType
  reportableId    String
  reason          ReportReason
  description     String?
  status          ReportStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  reporter        User     @relation("ReportReporter", fields: [reporterId], references: [id], onDelete: Cascade)
  reviewer        User?    @relation("ReportReviewer", fields: [reviewedBy], references: [id])
}

enum ReportableType {
  LISTING
  USER
  MESSAGE
  ARTICLE
  REVIEW
}

enum ReportReason {
  FRAUD
  SPAM
  INAPPROPRIATE_CONTENT
  FALSE_INFORMATION
  SCAM
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}

model Review {
  id              String   @id @default(cuid())
  listingId       String?
  reviewerId      String
  sellerId        String
  rating          Int      // 1-5 stars
  title           String?
  content         String
  response        String?  // Seller's response
  status          ReviewStatus @default(PENDING)
  verified        Boolean  @default(false) // Verified purchase
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  reviewer        User     @relation("ReviewReviewer", fields: [reviewerId], references: [id], onDelete: Cascade)
  seller          User     @relation("ReviewSeller", fields: [sellerId], references: [id], onDelete: Cascade)
  listing         Listing? @relation(fields: [listingId], references: [id], onDelete: SetNull)
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  HIDDEN
}

// ============================================
// NEW MODELS - USER ENGAGEMENT
// ============================================

model SavedSearch {
  id              String   @id @default(cuid())
  userId          String
  name            String
  filters         Json     // Store search filters as JSON
  isActive        Boolean  @default(true)
  emailAlert      Boolean  @default(true)
  lastAlertSentAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PriceAlert {
  id              String   @id @default(cuid())
  userId          String
  listingId       String
  maxPrice        BigInt?
  minPrice        BigInt?
  isActive        Boolean  @default(true)
  isTriggered     Boolean  @default(false)
  triggeredAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing         Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Notification {
  id              String   @id @default(cuid())
  userId          String
  type            NotificationType
  title           String
  message         String
  linkUrl         String?
  isRead          Boolean  @default(false)
  readAt          DateTime?
  sentEmail       Boolean  @default(false)
  emailSentAt     DateTime?
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  NEW_MESSAGE
  FAVORITE_PRICE_DROP
  SAVED_SEARCH_MATCH
  LISTING_APPROVED
  LISTING_REJECTED
  LISTING_SOLD
  NEW_REVIEW
  SUBSCRIPTION_EXPIRING
  PAYMENT_SUCCESS
  PAYMENT_FAILED
  SYSTEM_ANNOUNCEMENT
}

// ============================================
// NEW MODELS - DEALER/SELLER TOOLS
// ============================================

model Analytics {
  id              String   @id @default(cuid())
  userId          String
  listingId       String?
  date            DateTime @default(now())
  views           Int      @default(0)
  clicks          Int      @default(0)
  inquiries       Int      @default(0)
  favorites       Int      @default(0)
  shares          Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing         Listing? @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Lead {
  id              String   @id @default(cuid())
  listingId       String
  sellerId        String
  buyerName       String?
  buyerEmail      String?
  buyerPhone      String?
  message         String?
  status          LeadStatus @default(NEW)
  source          LeadSource @default(WEBSITE)
  notes           String?
  convertedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  listing         Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

enum LeadStatus {
  NEW
  CONTACTED
  NEGOTIATING
  CONVERTED
  LOST
}

enum LeadSource {
  WEBSITE
  WHATSAPP
  EMAIL
  PHONE
}

// ============================================
// NEW MODELS - SYSTEM & ADMIN
// ============================================

model ActivityLog {
  id              String   @id @default(cuid())
  userId          String?
  action          String
  entity          String   // e.g., "Listing", "User", "Dealer"
  entityId        String
  changes         Json?    // Store changes as JSON
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())

  user            User?    @relation("ActivityLogs", fields: [userId], references: [id], onDelete: SetNull)
}

model EmailTemplate {
  id              String   @id @default(cuid())
  name            String   @unique
  subject         String
  htmlContent     String   @db.Text
  textContent     String?
  variables       String[] // e.g., ["userName", "listingTitle"]
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SystemSettings {
  id              String   @id @default(cuid())
  key             String   @unique
  value           String
  category        String   // e.g., "general", "payment", "email"
  description     String?
  updatedAt       DateTime @updatedAt
}

model StaticPage {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  content         String   @db.Text
  metaTitle       String?
  metaDescription String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### Phase 2: Public Pages

---

#### [NEW] [src/app/page.tsx](file:///f:/website/cepetdeal/src/app/page.tsx)

Homepage with:
- **Promo Banner Slider** (carousel of promotional banners)
- Hero section with search bar
- Featured listings carousel
- Browse by brand section
- Latest listings grid
- Stats section (total cars, users, dealers)
- **Customer Testimonials section** (slider/carousel)
- CTA section

---

#### [NEW] [src/app/(public)/mobil-baru/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/mobil-baru/page.tsx)

New car listing page with:
- Filter sidebar (brand, model, year range, price range, transmission, fuel type, location)
- Sort options (newest, price low-high, price high-low)
- Grid/List view toggle
- Pagination
- Result count

---

#### [NEW] [src/app/(public)/mobil-bekas/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/mobil-bekas/page.tsx)

Used car listing page with:
- Filter sidebar (brand, model, year range, price range, transmission, fuel type, mileage range, location)
- Sort options (newest, price low-high, price high-low, mileage)
- Grid/List view toggle
- Pagination
- Result count

---

#### [NEW] [src/app/(public)/mobil-baru/[slug]/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/mobil-baru/%5Bslug%5D/page.tsx)

#### [NEW] [src/app/(public)/mobil-bekas/[slug]/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/mobil-bekas/%5Bslug%5D/page.tsx)

Car detail page with:
- **Image Slider** (carousel with thumbnails navigation)
- **YouTube Video Player** (embedded video from listing)
- **Virtual Tour** (360° photo viewer if available)
- **Tabbed Content:**
  - Tab 1: Deskripsi (description text)
  - Tab 2: Fitur (car features list by category)
  - Tab 3: Spesifikasi (specifications table)
  - Tab 4: **Lokasi** (map integration)
- Price with **Negotiable** badge
- Urgent badge (if applicable)
- Seller/dealer info card with link to profile
- **Set Price Alert** button
- **Reviews & Ratings** section
- Report listing button
- Contact buttons (WhatsApp, Message, Email)
- Share buttons (Facebook, Twitter, WhatsApp, Link)
- Related cars section
- View counter
- Last updated timestamp
- **Safety Tips** section

---

#### [NEW] [src/app/(public)/brand/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/brand/page.tsx)

Brand directory with:
- Grid of all brands with logos
- Listing count per brand
- Alphabetical sorting

---

#### [NEW] [src/app/(public)/dealer/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/dealer/page.tsx)

Dealer directory with:
- List of verified dealers
- Dealer cards with logo, name, location, inventory count
- Filter by location
- Sort by: name, listings count, rating

---

#### [NEW] [src/app/(public)/dealer/[id]/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/dealer/[id]/page.tsx)

**Public Dealer Profile Page:**
- Dealer info card (logo, name, address, description)
- Verified badge with verification date
- Contact information
- Active listings grid
- Reviews & ratings section
- Map integration showing location
- Share dealer profile button
- Average rating & total reviews

---

#### [NEW] [src/app/(public)/seller/[id]/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/seller/[id]/page.tsx)

**Public Seller Profile Page:**
- Seller info (name, avatar, join date)
- Active listings count
- Reviews & ratings
- Contact seller button
- Active listings grid

---

#### [NEW] [src/app/(public)/tentang-kami/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/tentang-kami/page.tsx)

**About Us Page:**
- Company story & mission
- Team section
- Statistics (total cars sold, active dealers, etc.)
- Company values
- Office/location info

---

#### [NEW] [src/app/(public)/kontak/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/kontak/page.tsx)

**Contact Us Page:**
- Contact form (name, email, subject, message)
- Office address with map
- Phone numbers
- Email addresses
- Social media links
- Live chat widget

---

#### [NEW] [src/app/(public)/faq/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/faq/page.tsx)

**FAQ Page:**
- Accordion-style FAQ items
- Categories: Buying, Selling, Account, Payments
- Search FAQ functionality
- Contact support link

---

#### [NEW] [src/app/(public)/syarat-ketentuan/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/syarat-ketentuan/page.tsx)

**Terms & Conditions Page:**
- Terms of service
- User responsibilities
- Listing rules
- Payment terms
- Dynamic content (editable by admin)

---

#### [NEW] [src/app/(public)/kebijakan-privasi/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/kebijakan-privasi/page.tsx)

**Privacy Policy Page:**
- Data collection practices
- Cookie policy
- User data rights
- Third-party services
- Dynamic content (editable by admin)

---

#### [NEW] [src/app/(public)/harga/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/harga/page.tsx)

**Pricing Page:**
- Subscription plans comparison
- Feature comparison table
- Boost listing prices
- FAQ about pricing
- Subscribe buttons

---

#### [NEW] [src/components/ui/](file:///f:/website/cepetdeal/src/components/ui/)

Reusable UI components:
- `Button.tsx` - Primary, secondary, outline variants
- `Input.tsx` - Text, select, checkbox inputs
- `Card.tsx` - Car listing card component
- `Badge.tsx` - Status badges (New, Used, Verified, etc.)
- `Modal.tsx` - Modal/dialog component
- `Dropdown.tsx` - Dropdown menu
- `Pagination.tsx` - Pagination component
- `Skeleton.tsx` - Loading skeletons
- `Toast.tsx` - Toast notifications
- **`HeroSlider.tsx`** - Promo banner carousel/slider
- **`ImageSlider.tsx`** - Car detail image carousel with thumbnails
- **`TestimonialCard.tsx`** - Customer testimonial card
- **`TestimonialSlider.tsx`** - Testimonials carousel
- **`YouTubePlayer.tsx`** - Embedded YouTube video player
- **`Tabs.tsx`** - Tabbed content navigation

**NEW Components:**
- **`ReportModal.tsx`** - Report listing/user modal
- **`ReviewCard.tsx`** - Review display card
- **`ReviewForm.tsx`** - Submit review form
- **`RatingStars.tsx`** - Star rating display/input
- **`PriceAlertButton.tsx`** - Set price alert button
- **`ShareButtons.tsx`** - Social share buttons
- **`VirtualTourViewer.tsx`** - 360° photo viewer
- **`MapPicker.tsx`** - Location picker for listings
- **`MapDisplay.tsx`** - Display location on map
- **`SavedSearchCard.tsx`** - Saved search display
- **`NotificationBell.tsx`** - Notification bell icon with badge
- **`NotificationDropdown.tsx`** - Notification dropdown
- **`LiveChatWidget.tsx`** - Customer support chat widget
- **`PricingCard.tsx`** - Subscription plan card
- **`FeatureComparison.tsx`** - Plan comparison table
- **`BulkUploadDropzone.tsx`** - CSV/Excel upload area
- **`BoostBadge.tsx`** - Featured/urgent badge
- **`SellerProfileCard.tsx`** - Seller info card
- **`DealerProfileCard.tsx`** - Dealer info card
- **`Accordion.tsx`** - FAQ accordion
- **`SearchAutocomplete.tsx`** - Search autocomplete
- **`FilterTags.tsx`** - Active filter tags display
- **`WhatsAppButton.tsx`** - Direct WhatsApp button
- **`TrustBadges.tsx`** - Verification/secure badges
- **`LanguageSwitcher.tsx`** - Language toggle (ID/EN)
- **`ProgressBar.tsx`** - Progress bar for multi-step forms
- **`DataTable.tsx`** - Sortable/filterable data table
- **`StatCard.tsx`** - Dashboard stat card
- **`Chart.tsx`** - Analytics chart component
- **`RichTextEditor.tsx`** - WYSIWYG text editor
- **`ImageViewer.tsx`** - Image lightbox viewer

---

### Phase 3: User Dashboards

---

#### [NEW] [src/app/(dashboard)/dashboard/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/page.tsx)

Role-based dashboard:
- **Buyer:**
  - Recent favorites
  - Unread messages
  - Recent view history
  - Active saved searches
  - Active price alerts
  - Recommended listings
- **Seller/Dealer:**
  - Listings stats (active, sold, pending)
  - Views & inquiries chart
  - Recent inquiries/leads
  - Expiring listings
  - Subscription status
  - Quick actions (Add listing, Boost)

---

#### [NEW] [src/app/(dashboard)/dashboard/favorites/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/favorites/page.tsx)

Favorites page (Buyer):
- Grid of favorited listings
- Remove from favorites
- Price change indicators
- Filter by price drop
- Bulk remove option

---

#### [NEW] [src/app/(dashboard)/dashboard/saved-searches/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/saved-searches/page.tsx)

**Saved Searches Page:**
- List of saved searches with names
- Match count for each search
- Edit/Delete saved searches
- Toggle email alerts on/off
- Create new saved search

---

#### [NEW] [src/app/(dashboard)/dashboard/price-alerts/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/price-alerts/page.tsx)

**Price Alerts Page:**
- List of active price alerts
- Target price vs current price
- Alert status (active/triggered)
- Edit/Delete alerts
- Create new price alert

---

#### [NEW] [src/app/(dashboard)/dashboard/notifications/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/notifications/page.tsx)

**Notifications Page:**
- List of all notifications
- Filter by type (messages, alerts, system)
- Mark all as read
- Notification settings/preferences
- Delete notifications

---

#### [NEW] [src/app/(dashboard)/dashboard/listings/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/listings/page.tsx)

My listings page (Seller/Dealer):
- Tabs: All, Active, Pending, Sold, Expired
- Listing cards with stats (views, favorites, inquiries)
- Quick actions (Edit, Mark as Sold, Delete, Boost)
- Filter by date, status, views
- Bulk actions (activate, deactivate, delete)

---

#### [NEW] [src/app/(dashboard)/dashboard/listings/new/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/listings/new/page.tsx)

Add new listing form (Multi-step wizard):
- Step 1: Basic info (brand, model, year, price, condition)
- Step 2: Details (transmission, fuel, mileage, color, engine)
- Step 3: Features (checklist fitur mobil by category)
- Step 4: Description & location
- Step 5: Image upload (up to 10 images)
- Step 6: YouTube Video Link (optional)
- Step 7: Virtual Tour URL (optional)
- Step 8: Review & submit

---

#### [NEW] [src/app/(dashboard)/dashboard/listings/[id]/edit/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/listings/[id]/edit/page.tsx)

Edit listing page with pre-filled form.

---

#### [NEW] [src/app/(dashboard)/dashboard/listings/[id]/boost/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/listings/[id]/boost/page.tsx)

**Boost Listing Page:**
- Boost type selection (Featured Home, Urgent Badge, Top Listing)
- Duration selection (1, 3, 7, 30 days)
- Price calculation
- Payment flow

---

#### [NEW] [src/app/(dashboard)/dashboard/analytics/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/analytics/page.tsx)

**Analytics Dashboard (Dealer/Seller):**
- Views chart (daily/weekly/monthly)
- Inquiries chart
- Top performing listings
- Geographic distribution
- Export analytics data (CSV/Excel)
- Date range filter

---

#### [NEW] [src/app/(dashboard)/dashboard/leads/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/leads/page.tsx)

**Lead Management Page:**
- List of all leads/inquiries
- Filter by status (New, Contacted, Negotiating, Converted, Lost)
- Lead detail view
- Add notes
- Update status
- Convert to sale

---

#### [NEW] [src/app/(dashboard)/dashboard/reviews/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/reviews/page.tsx)

**Reviews Page (Seller/Dealer):**
- List of received reviews
- Overall rating summary
- Respond to reviews
- Filter by rating
- Report inappropriate reviews

---

#### [NEW] [src/app/(dashboard)/dashboard/bulk-upload/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/bulk-upload/page.tsx)

**Bulk Upload Page (Dealer only):**
- CSV/Excel file upload
- Template download
- Validation preview
- Import confirmation
- Error reporting
- Import history

---

#### [NEW] [src/app/(dashboard)/dashboard/subscription/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/subscription/page.tsx)

**Subscription Page:**
- Current plan details
- Usage stats (listings used, featured used)
- Renew/cancel options
- Upgrade/downgrade options
- Payment history
- Invoice download

---

#### [NEW] [src/app/(dashboard)/dashboard/messages/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/messages/page.tsx)

Messages/Inbox:
- Conversation list sidebar
- Chat view with message history
- Related listing preview
- Send message input
- Mark as unread
- Delete conversation

---

#### [NEW] [src/app/(dashboard)/dashboard/settings/page.tsx](file:///f:/website/cepetdeal/src/app/%28dashboard%29/dashboard/settings/page.tsx)

**Settings Page:**
- Profile settings (name, phone, avatar)
- Email/phone verification
- Password change
- Notification preferences
- Privacy settings
- Language preference
- Connected accounts (Google, Facebook)
- Deactivate account

---

### Phase 4: Admin Panel

---

#### [NEW] [src/app/admin/layout.tsx](file:///f:/website/cepetdeal/src/app/admin/layout.tsx)

Admin layout with:
- Sidebar navigation with all sections
- Header with admin info
- Notification bell
- Protected route (ADMIN role only)

---

#### [NEW] [src/app/admin/page.tsx](file:///f:/website/cepetdeal/src/app/admin/page.tsx)

Admin dashboard with:
- **Stats Cards:**
  - Total users (by role)
  - Total listings (by status)
  - Pending approvals
  - Active subscriptions
  - Revenue this month
  - Open reports
- **Charts:**
  - Listings over time
  - User registrations
  - Revenue trends
  - Category distribution
- **Recent Activities** feed
- **Quick Actions**

---

#### [NEW] [src/app/admin/users/page.tsx](file:///f:/website/cepetdeal/src/app/admin/users/page.tsx)

User management:
- DataTable with all users
- Filter by role, status (active/suspended), verification
- Search by name/email
- Bulk actions (suspend, delete, change role)
- Actions: View, Edit, Verify badge, Suspend, Delete
- User detail modal with all info

---

#### [NEW] [src/app/admin/listings/page.tsx](file:///f:/website/cepetdeal/src/app/admin/listings/page.tsx)

Listing moderation:
- DataTable with all listings
- Filter by status, condition, seller
- Sort by views, date, price
- Bulk actions (approve, reject, feature, delete)
- Actions: View, Approve, Reject (with reason), Feature, Delete, Edit

---

#### [NEW] [src/app/admin/dealers/page.tsx](file:///f:/website/cepetdeal/src/app/admin/dealers/page.tsx)

Dealer verification:
- Pending applications list
- View submitted documents
- Approve/Reject with notes
- Verified dealers list
- Suspend/Revoke verification

---

#### [NEW] [src/app/admin/listings/new/page.tsx](file:///f:/website/cepetdeal/src/app/admin/listings/new/page.tsx)

**Admin-only New Car Listing Creation:**
- Only Admin can create new car listings
- Form similar to seller listing form
- Auto-approved (no moderation needed)
- Can set as featured directly
- Can set expiration date

---

#### [NEW] [src/app/admin/articles/page.tsx](file:///f:/website/cepetdeal/src/app/admin/articles/page.tsx)

Article management (CMS):
- DataTable with all articles
- Filter by status, category
- Search by title
- Bulk actions (publish, unpublish, delete)
- Actions: Edit, Delete, Publish/Unpublish

#### [NEW] [src/app/admin/articles/new/page.tsx](file:///f:/website/cepetdeal/src/app/admin/articles/new/page.tsx)

#### [NEW] [src/app/admin/articles/[id]/edit/page.tsx](file:///f:/website/cepetdeal/src/app/admin/articles/[id]/edit/page.tsx)

Article editor:
- Title input with slug auto-generation
- Category selector (News, Review, Tips, Guide, Promo)
- Featured image upload
- Rich text content editor
- Tags input
- Excerpt field
- SEO meta fields (meta title, description)
- Status toggle (Draft/Published)
- Preview mode

---

#### [NEW] [src/app/admin/banners/page.tsx](file:///f:/website/cepetdeal/src/app/admin/banners/page.tsx)

Promo banner management:
- List of all banners
- Create new banner
- Edit banner (title, image, link, order)
- Toggle active/inactive
- Reorder banners
- Delete banner

---

#### [NEW] [src/app/admin/banner-ads/page.tsx](file:///f:/website/cepetdeal/src/app/admin/banner-ads/page.tsx)

**Banner Advertisement Management:**
- List of all banner ads
- Create new ad (image, link, position, dates)
- Edit ad details
- View click/impression stats
- Toggle active/inactive
- Delete ad

---

#### [NEW] [src/app/admin/reviews/page.tsx](file:///f:/website/cepetdeal/src/app/admin/reviews/page.tsx)

**Review Moderation:**
- DataTable with all reviews
- Filter by status, rating
- Search by content
- Actions: Approve, Reject, Hide, Delete
- View seller response

---

#### [NEW] [src/app/admin/reports/page.tsx](file:///f:/website/cepetdeal/src/app/admin/reports/page.tsx)

**Report Management:**
- List of all reports
- Filter by type, status
- View report details
- Take action on reported content
- Add resolution notes
- Mark as resolved/dismissed

---

#### [NEW] [src/app/admin/subscriptions/page.tsx](file:///f:/website/cepetdeal/src/app/admin/subscriptions/page.tsx)

**Subscription Management:**
- List of all subscriptions
- Filter by status, plan
- View subscription details
- Manual subscription creation
- Extend/modify subscriptions
- Revenue reports

---

#### [NEW] [src/app/admin/subscriptions/plans/page.tsx](file:///f:/website/cepetdeal/src/app/admin/subscriptions/plans/page.tsx)

**Plan Management:**
- List of all plans
- Create/Edit/Delete plans
- Set pricing, duration, features
- Toggle active/inactive

---

#### [NEW] [src/app/admin/payments/page.tsx](file:///f:/website/cepetdeal/src/app/admin/payments/page.tsx)

**Payment Management:**
- List of all payments
- Filter by status, type
- View payment details
- Export payment data
- Revenue reports
- Refund processing

---

#### [NEW] [src/app/admin/activity-logs/page.tsx](file:///f:/website/cepetdeal/src/app/admin/activity-logs/page.tsx)

**Activity Logs:**
- Paginated list of all activities
- Filter by user, action, entity, date range
- View action details
- Export logs

---

#### [NEW] [src/app/admin/email-templates/page.tsx](file:///f:/website/cepetdeal/src/app/admin/email-templates/page.tsx)

**Email Template Management:**
- List of all email templates
- Edit template content
- Preview template
- Variable reference guide
- Toggle active/inactive

---

#### [NEW] [src/app/admin/static-pages/page.tsx](file:///f:/website/cepetdeal/src/app/admin/static-pages/page.tsx)

**Static Page Management:**
- List of static pages (About, FAQ, Terms, Privacy)
- Edit page content
- SEO meta fields
- Toggle active/inactive

---

#### [NEW] [src/app/admin/settings/page.tsx](file:///f:/website/cepetdeal/src/app/admin/settings/page.tsx)

**System Settings:**
- General settings (site name, logo, contact info)
- Payment gateway settings
- Email settings (SMTP)
- Social media links
- Google Analytics ID
- Listing settings (max images, expiration days)
- Subscription defaults

---

#### [NEW] [src/app/admin/analytics/page.tsx](file:///f:/website/cepetdeal/src/app/admin/analytics/page.tsx)

**Platform Analytics:**
- User growth chart
- Listing trends
- Geographic distribution
- Revenue reports
- Top categories
- Conversion funnels
- Export reports

---

#### [NEW] [src/app/admin/export/page.tsx](file:///f:/website/cepetdeal/src/app/admin/export/page.tsx)

**Data Export:**
- Export users (CSV/Excel)
- Export listings (CSV/Excel)
- Export transactions (CSV/Excel)
- Export reports (CSV/Excel)
- Schedule recurring exports

---

### Phase 5: Articles & Blog (Public)

---

#### [NEW] [src/app/(public)/artikel/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/artikel/page.tsx)

Articles listing page:
- Grid of published articles
- Filter by category
- Search articles
- Pagination
- Featured articles section

#### [NEW] [src/app/(public)/artikel/[slug]/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/artikel/[slug]/page.tsx)

Article detail page:
- Article title, category, date
- Featured image
- Article content
- Author info
- Share buttons
- Related articles section
- View counter

---

### Phase 6: API Routes

---

#### [NEW] API Structure [src/app/api/](file:///f:/website/cepetdeal/src/app/api/)

```
api/
├── auth/
│   ├── [...nextauth]/route.ts  # NextAuth handlers
│   ├── register/route.ts       # User registration
│   ├── verify/route.ts         # Email verification
│   └── reset-password/route.ts # Password reset
├── users/
│   ├── route.ts                # GET all, POST create
│   ├── [id]/route.ts           # GET, PUT, DELETE user
│   ├── me/route.ts             # Current user profile
│   └── [id]/reviews/route.ts   # GET user reviews
├── listings/
│   ├── route.ts                # GET all, POST create
│   ├── [id]/route.ts           # GET, PUT, DELETE listing
│   ├── [id]/favorite/route.ts  # Toggle favorite
│   ├── [id]/view/route.ts      # Track view
│   ├── [id]/contact/route.ts   # Track contact click
│   ├── search/route.ts         # Search with filters
│   └── [id]/reviews/route.ts   # GET listing reviews
├── brands/
│   ├── route.ts                # GET all, POST create
│   └── [id]/route.ts           # GET, PUT, DELETE
├── dealers/
│   ├── route.ts                # GET all dealers
│   ├── [id]/route.ts           # GET dealer profile
│   ├── [id]/listings/route.ts  # GET dealer listings
│   └── apply/route.ts          # Apply as dealer
├── messages/
│   ├── route.ts                # GET conversations
│   ├── [id]/route.ts           # GET, POST messages
│   └── unread/route.ts         # Unread count
├── articles/
│   ├── route.ts                # GET all articles (public)
│   ├── [slug]/route.ts         # GET single article by slug
│   └── related/route.ts        # GET related articles
├── reviews/
│   ├── route.ts                # POST create review
│   ├── [id]/route.ts           # GET, PUT, DELETE review
│   └── [id]/response/route.ts  # Seller response
├── reports/
│   ├── route.ts                # POST create report
│   └── [id]/route.ts           # GET report details
├── notifications/
│   ├── route.ts                # GET user notifications
│   ├── [id]/read/route.ts      # Mark as read
│   └── settings/route.ts       # Notification preferences
├── saved-searches/
│   ├── route.ts                # GET all, POST create
│   ├── [id]/route.ts           # GET, PUT, DELETE
│   └── [id]/alert/route.ts     # Trigger alert check
├── price-alerts/
│   ├── route.ts                # GET all, POST create
│   └── [id]/route.ts           # GET, DELETE alert
├── subscriptions/
│   ├── plans/route.ts          # GET all plans
│   ├── subscribe/route.ts      # POST create subscription
│   ├── [id]/route.ts           # GET subscription details
│   └── cancel/route.ts         # Cancel subscription
├── payments/
│   ├── route.ts                # POST create payment
│   ├── [id]/route.ts           # GET payment status
│   ├── callback/route.ts       # Payment gateway callback
│   └── webhook/route.ts        # Payment webhooks
├── boosts/
│   ├── route.ts                # POST create boost
│   ├── [id]/route.ts           # GET boost details
│   └── types/route.ts          # GET boost types & pricing
├── analytics/
│   ├── route.ts                # GET user analytics
│   ├── listings/route.ts       # GET listing analytics
│   └── export/route.ts         # Export analytics data
├── leads/
│   ├── route.ts                # GET all leads
│   ├── [id]/route.ts           # GET, update lead
│   └── convert/route.ts        # Mark as converted
├── bulk-upload/
│   ├── validate/route.ts       # Validate CSV/Excel
│   └── import/route.ts         # Import listings
├── search/
│   ├── autocomplete/route.ts   # Search suggestions
│   └── similar/route.ts        # Find similar listings
├── pages/
│   ├── about/route.ts          # GET about page content
│   ├── contact/route.ts         # POST contact form
│   └── faq/route.ts            # GET FAQ content
├── admin/
│   ├── stats/route.ts          # Dashboard stats
│   ├── users/route.ts          # User management
│   ├── listings/route.ts       # Listing moderation & NEW car creation (admin only)
│   ├── dealers/route.ts        # Dealer verification
│   ├── articles/route.ts       # Article CRUD (admin only)
│   ├── banners/route.ts        # Banner management
│   ├── banner-ads/route.ts     # Banner ad management
│   ├── settings/route.ts       # Site settings
│   ├── reports/route.ts        # Report management
│   ├── reviews/route.ts        # Review moderation
│   ├── subscriptions/route.ts  # Subscription management
│   ├── payments/route.ts       # Payment management
│   ├── activity-logs/route.ts  # Activity logs
│   ├── email-templates/route.ts # Email template management
│   ├── static-pages/route.ts   # Static page management
│   ├── analytics/route.ts      # Platform-wide analytics
│   └── export/route.ts         # Export data
└── upload/
    ├── image/route.ts          # Image upload with optimization
    ├── document/route.ts       # Document upload
    └── bulk/route.ts           # Bulk file upload
```

---

### Phase 7: Advanced Features

---

#### [NEW] [src/app/(public)/compare/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/compare/page.tsx)

Compare cars page:
- Add up to 3 cars to compare
- Side-by-side specifications table
- Highlight differences
- Clear comparison

---

#### [NEW] [src/app/(public)/calculator/page.tsx](file:///f:/website/cepetdeal/src/app/%28public%29/calculator/page.tsx)

Credit calculator:
- Car price input
- Down payment percentage/amount
- Loan tenor (1-7 years)
- Interest rate
- Monthly installment result
- Total payment & interest breakdown

---

## Verification Plan

### Automated Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Lint & type check
npm run lint
npm run type-check
```

### Manual Verification

| Feature | Verification Steps |
|---------|-------------------|
| Authentication | Register, login, logout for all roles |
| Listing CRUD | Create, edit, delete listing as seller |
| Favorites | Add/remove favorites as buyer |
| Search & Filter | Test all filter combinations |
| Admin Panel | Verify all admin actions work correctly |
| Responsive | Test on mobile, tablet, desktop |

### Browser Testing

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## Development Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 1** | 2-3 days | Project setup, database, auth |
| **Phase 2** | 5-7 days | Public pages & components (including new pages) |
| **Phase 3** | 5-7 days | User dashboards (all user roles) |
| **Phase 4** | 4-6 days | Admin panel (all admin features) |
| **Phase 5** | 2-3 days | Articles & Blog system (CMS) |
| **Phase 6** | 4-5 days | Monetization (subscriptions, payments, boosts) |
| **Phase 7** | 3-4 days | Trust & Safety (reports, reviews) |
| **Phase 8** | 3-4 days | API routes & integration |
| **Phase 9** | 2-3 days | SEO & Analytics |
| **Phase 10** | 3-4 days | Advanced features (bulk upload, live chat, etc.) |
| **Phase 11** | 3-4 days | Testing & optimization |
| **Phase 12** | 2-3 days | Deployment & monitoring setup |

**Total Estimate:** 38-53 days (6-8 weeks)

---

## Priority Phases (MVP vs Full Release)

### MVP (Minimum Viable Product) - 3-4 weeks
- Phase 1: Setup & Foundation
- Phase 2: Core public pages (listings, search, detail)
- Phase 3: Basic dashboards (buyers, sellers)
- Phase 4: Essential admin features
- Phase 8: Core API routes

### Post-MVP (Growth Features) - 3-4 weeks
- Phase 5: Blog/CMS
- Phase 6: Monetization features
- Phase 7: Trust & safety
- Phase 9: SEO & Analytics

### Advanced (Scale Features) - 2-3 weeks
- Phase 10: Advanced features
- Phase 11: Testing & optimization
- Phase 12: Deployment & monitoring

---

## Next Steps

1. ✅ Confirm tech stack & hosting preferences
2. ⬜ Initialize Next.js project
3. ⬜ Setup database & complete Prisma schema
4. ⬜ Implement authentication (including social login)
5. ⬜ Build Phase 1: Project foundation
6. ⬜ Build Phase 2: Public pages
7. ⬜ Build Phase 3: User dashboards
8. ⬜ Build Phase 4: Admin panel
9. ⬜ Build Phase 5: Articles/CMS system
10. ⬜ Build Phase 6: Monetization features
11. ⬜ Build Phase 7: Trust & safety
12. ⬜ Build Phase 8-9: API, SEO & Analytics
13. ⬜ Build Phase 10-12: Advanced features & deployment
14. ⬜ Deploy to production

---

## Infrastructure & Architecture

### Server Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        CDN Layer                            │
│                    (Cloudflare/Vercel)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Application Layer                        │
│              Next.js App (Vercel/Railway)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Web App    │ │  API Routes │ │  Background Jobs    │   │
│  └─────────────┘ └─────────────┘ │  (Bull Queue)       │   │
│                                   └─────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Services Layer                          │
│  ┌───────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐   │
│  │ Database  │ │  Cache   │ │ Storage │ │  Email/SMTP  │   │
│  │(PostgreSQL)│ │ (Redis)  │ │(Cloudinary)│  (Resend)   │   │
│  └───────────┘ └──────────┘ └─────────┘ └──────────────┘   │
│  ┌───────────┐ ┌──────────┐                                 │
│  │Payment GW │ │ Analytics│                                 │
│  │(Midtrans) │ │ (GA4/GTM)│                                 │
│  └───────────┘ └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."

# Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_UPLOAD_PRESET="..."

# Email
RESEND_API_KEY="..."
SMTP_HOST="..."
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."

# Payment Gateways
MIDTRANS_SERVER_KEY="..."
MIDTRANS_CLIENT_KEY="..."
XENDIT_API_KEY="..."
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."

# Redis
REDIS_URL="redis://..."

# Analytics
NEXT_PUBLIC_GA_ID="..."
NEXT_PUBLIC_GTM_ID="..."

# Sentry (Error Tracking)
SENTRY_DSN="..."
NEXT_PUBLIC_SENTRY_DSN="..."

# App Settings
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
LISTING_EXPIRY_DAYS="30"
MAX_IMAGES_PER_LISTING="10"
MAX_FREE_LISTINGS="5"
```

---

## Security Considerations

### Authentication & Authorization
- [ ] Password hashing with bcrypt/argon2
- [ ] JWT token management
- [ ] Refresh token rotation
- [ ] Session management
- [ ] OAuth 2.0 integration (Google, Facebook)
- [ ] Email verification
- [ ] Password reset flow
- [ ] 2FA (optional, future)

### API Security
- [ ] Rate limiting per user/IP
- [ ] Request validation (Zod)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] CORS configuration
- [ ] Helmet.js security headers
- [ ] API input sanitization

### Data Protection
- [ ] PII data encryption at rest
- [ ] Sensitive field encryption
- [ ] GDPR compliance (right to deletion)
- [ ] Data retention policies
- [ ] Secure file upload validation
- [ ] Private routes protection

### Monitoring & Logging
- [ ] Sentry error tracking
- [ ] Activity logging
- [ ] Audit logs for admin actions
- [ ] Failed login alerts
- [ ] Suspicious activity detection

---

## Performance Optimization

### Frontend
- [ ] Image optimization (sharp, WebP)
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading components
- [ ] ISR (Incremental Static Regeneration)
- [ ] Client-side caching (SWR)
- [ ] Bundle size optimization
- [ ] Font optimization
- [ ] Critical CSS inlining

### Backend
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Connection pooling
- [ ] Background job queue (Bull)
- [ ] Database indexing
- [ ] Pagination for large datasets
- [ ] CDN for static assets
- [ ] Edge functions for geo-distribution

### Database Indexes
```prisma
// Recommended indexes
@@index([userId])
@@index([brandId, modelId])
@@index([status, createdAt])
@@index([condition, status])
@@index([price])
@@index([location])
@@index([createdAt])
```

---

## SEO Strategy

### On-Page SEO
- [ ] Dynamic meta tags per page
- [ ] Structured data (Schema.org)
  - Vehicle schema for listings
  - Organization schema
  - BreadcrumbList schema
  - Review schema
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] XML sitemap generation
- [ ] Robots.txt configuration
- [ ] Alt text for images

### Technical SEO
- [ ] Core Web Vitals optimization
- [ ] Mobile-first indexing
- [ ] HTTPS everywhere
- [ ] Fast page load (< 3s)
- [ ] Clean URL structure
- [ ] 301 redirects for old URLs
- [ ] 404 custom page

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data populated
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] CDN configured

### Production Build
- [ ] Run type check: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm run test`
- [ ] Build production: `npm run build`
- [ ] Test production build locally

### Post-Deployment
- [ ] Smoke test all critical paths
- [ ] Monitor error rates (Sentry)
- [ ] Check analytics tracking
- [ ] Test email delivery
- [ ] Test payment gateway
- [ ] Test upload functionality
- [ ] Set up monitoring dashboards
- [ ] Configure backup jobs

---

## Monitoring & Maintenance

### Health Checks
- [ ] Uptime monitoring (Pingdom/UptimeRobot)
- [ ] API health check endpoint
- [ ] Database connection check
- [ ] Redis connection check
- [ ] External service status

### Metrics to Track
- [ ] Page load time
- [ ] API response time
- [ ] Error rate
- [ ] Active users (DAU/MAU)
- [ ] Conversion rate
- [ ] Revenue metrics
- [ ] Server resource usage

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer ready
- Database read replicas
- CDN edge caching
- Microservice-ready architecture

---

## Cost Estimation (Monthly)

| Service | Tier | Est. Cost (USD) |
|---------|------|-----------------|
| **Vercel (Hosting)** | Pro | $20 |
| **Supabase/Railway (DB)** | Basic | $10-25 |
| **Cloudinary (Images)** | Free Tier | $0 |
| **Redis (Cache)** | Free Tier | $0 |
| **Resend (Email)** | Free Tier | $0 |
| **Midtrans (Payment)** | Per Transaction | 1.5-2.5% |
| **Sentry (Error Tracking)** | Free Tier | $0 |
| **Domain** | - | $1-2/month |
| **TOTAL (MVP)** | - | **$30-50/month** |

---

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database downtime | High | Automated backups, read replicas |
| Payment gateway issues | High | Multiple gateway options |
| Image storage limits | Medium | CDN, compression, lazy loading |
| Spam/fake listings | High | Moderation, user verification, reports |
| Security breach | Critical | Regular audits, monitoring |
| Slow performance | Medium | Caching, CDN, optimization |

---

## Future Enhancements (Post-Launch)

### Phase 13: Mobile App
- React Native / Flutter app
- Push notifications
- Offline mode
- Biometric auth

### Phase 14: AI Features
- Price recommendation engine
- Image recognition for auto-fill
- Chatbot for support
- Personalized recommendations
- Fraud detection

### Phase 15: Integrations
- Bank/leasing integration for loans
- Insurance calculator integration
- Vehicle history check integration
- WhatsApp Business API
- Multi-currency support

### Phase 16: Marketplace Expansion
- Motorcycle listings
- Spare parts marketplace
- Service center booking
- Car rental marketplace

---

## Documentation Requirements

### Developer Docs
- [ ] Getting started guide
- [ ] Architecture overview
- [ ] API documentation
- [ ] Component library docs
- [ ] Deployment guide
- [ ] Contribution guidelines

### User Docs
- [ ] User manual (buyers)
- [ ] Seller manual
- [ ] Dealer manual
- [ ] Admin manual
- [ ] FAQ
- [ ] Video tutorials

---

**End of Implementation Plan**
