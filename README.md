# Kandhari Tent & Caterers & Dwarka Shri Lawn

**Digital Business Platform, Event Rental E-Commerce & Lawn Booking Operating System**  
*Location: Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow, Uttar Pradesh, India*  
*Tagline: "Making Your Celebrations Memorable"*

---

## 🌟 Overview & Problem Solved

Traditional event management and tent-house operations in Lucknow face significant friction: manual diary bookings, untracked inventory damage, unstandardized tent area rates, lack of pre-approval before advance collection, and scattered client communication across phone and WhatsApp.

**Kandhari Tent & Caterers** and **Dwarka Shri Lawn** solves this by providing a unified, production-grade operating platform tailored for the Lucknow event ecosystem:
- **For Customers:** High-definition Awadhi wedding aesthetics, interactive equipment rental catalogue with area/dimension calculators, transparent distance-band delivery quotes, 125-dish pure vegetarian catering menu, full-width cinematic video showcase of Dwarka Shri Lawn, and 7 vertical video reels with direct WhatsApp sharing.
- **For Business Owners & Operations:** A mother-friendly bilingual (Hindi-English) unified 11-section administration portal with real-time inventory management, staff daily attendance with ₹500 wage calculation, outside supplier/dhobi expense tracking, automated commercial billing (`INV-YYYY-XXXX`), and an autonomous Master AI Agent with 3-layer persistent memory.

---

## 🚀 Key Features

### 1. Dedicated Dwarka Shri Lawn Video Showcase (`/lawn`)
- **Full-Width WhatsApp Video Player:** Real source footage (`DwarakaShreevideo.mp4`, 2m 13s) featuring the complete grounds, entrance, indoor hall, and accommodation.
- **7 Pre-Cut Vertical Video Reels (9:16):** Grand Entrance, Lawn & Banquet Gallery, Setup Area, Air-Conditioned Hall, Deluxe Bridal Suite, Rooms Corridor, and Venue Teaser. Each reel features FFmpeg-extracted HD cover thumbnails, an interactive video modal player, direct MP4 download, and WhatsApp share buttons.
- **6 Visual Venue Area Tabs:** Interactive photography and amenity breakdown for Entrance, Main Lawn (25,000 sq.ft, 1,000+ capacity), Banquet Pavilion, Air-Conditioned Hall, Royal Stage/Mandap, and 7+ AC Guest Rooms.
- **Base Package:** Starting at ₹1,10,000.

### 2. Standardized Rental Catalogue & Mathematical Pricing Engine
- **Catalogue Items:** Over 19 standardized items (PVC chairs, velvet covers, round tables with frills, winter gadda sets, jumbo desert coolers, shamianas, German hangars, red carpets).
- **Area-Based Rental Calculation:** Authoritative server-side pricing for tents and carpets:  
  `Line Total = (Length × Width) × Rate per sq. ft. × Rental Days × Quantity`
  - Normal Shamiana: ₹5 / sq. ft. / day (e.g. 20 × 30 ft tent for 2 days = ₹6,000)
  - Halwai Kitchen Pandal: ₹5 / sq. ft. / day
  - Waterproof German Hangar: ₹30 / sq. ft.
  - Red Velvet Event Carpet: ₹3 / sq. ft. / day
- **Inclusive Calendar Day Rental Calculation:** Automatically calculates rental days inclusively (e.g., Dec 10 to Dec 11 = 2 calendar days).
- **Exact Distance Bands:**
  - **0 to 3 km:** Cartage ₹500 | Labour ₹500 base
  - **3 to 7 km:** Cartage ₹1,000 | Labour ₹1,000 base
  - **> 7 km:** Cartage ₹1,500 base + ₹75/km | Labour ₹1,500 base + ₹50/km (provisional)

### 3. Authentic Awadhi Catering Menu
- **125 Pure Vegetarian Dishes:** Curated across 17 traditional categories (Welcome Drinks, Soups, Awadhi Chaat Counter, Live Starters, Paneer Specialties, Shahi Awadhi Curries, Dal Counter, Tandoori Breads, Rice & Biryani, Chinese & Continental, Salads, Raita, Desserts & Mithai, Live Halwa, Ice Creams, Beverages, and Mukhwas).
- **8 Wedding & Reception Packages:** Silver, Gold, Diamond, and Royal Vivah packages with transparent per-plate pricing.

### 4. Admin Pre-Approval & Razorpay Booking Workflow
- **6-Step Customer Protection Flow:**
  1. Customer submits rental or venue booking request.
  2. Booking enters `Pending Admin Approval` (payment is securely locked).
  3. Admin inspects date availability, warehouse inventory, and distance, then approves with official quotation.
  4. Customer accepts terms and approves quotation.
  5. Razorpay payment order is generated for advance payment (e.g. 50%).
  6. Server cryptographically verifies Razorpay signature; booking is confirmed and calendar date locked.

### 5. Unified 11-Section Business Operations Portal (`/admin`)
1. **डैशबोर्ड (Dashboard Overview):** Real-time revenue KPIs, active bookings count, staff present today, pending outside payments.
2. **स्टाफ व हाजिरी (Staff & Attendance):** Roster of labourers, fitters, and drivers with one-click daily attendance marking (Present = ₹500, Half-day = ₹250, Absent = ₹0).
3. **मजदूरी व बाहरी भुगतान (Wages & Outside Payments):** Wage disbursement receipts and separate outside supplier ledger (Dhobi/Laundry, Bamboo/Bally Suppliers, Outside Transport).
4. **ग्राहक व कोटेशन (Customers & Quotations):** Customer directory, quotation revision, advance payment calculation.
5. **बुकिंग व ऑर्डर (Bookings & Orders):** Full event lifecycle pipeline with status updates (`New` ➔ `In Discussion` ➔ `Confirmed` ➔ `Closed`) and CSV export.
6. **गोदाम सामान स्टॉक (Warehouse Inventory):** Real-time stock audit for chairs, tables, tents, coolers, and damage tracking.
7. **व्यापार विश्लेषण (Business Analytics):** Revenue breakdown, monthly trends, privacy-conscious first-party visitor analytics.
8. **मास्टर एजेंट (Master Agent & 3-Layer Memory):** Autonomous conversational assistant with Layer A (Conversation History), Layer B (Business Memory Rules), and Layer C (Learned Executable Workflows) with two-step write confirmation.
9. **मार्केटिंग स्टूडियो (AI Marketing Studio):** Media asset library (468+ assets), shareable client portfolios, real FFmpeg vertical reel renderer, and dedicated Dwarka Shri Lawn reels manager.
10. **बिल व दस्तावेज (Bills & Invoices):** Formal commercial bills with auto-incrementing `INV-YYYY-XXXX` format and print letterhead.
11. **सेटिंग्स (Settings):** Business credentials, contact numbers, and operational configurations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, React Router DOM v6 |
| **Backend** | Node.js, Express 4, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS |
| **Video Engine** | FFmpeg (via Fluent-FFmpeg) for real vertical reel synthesis & poster cover generation |
| **Database** | Dual-Mode Architecture: Production MongoDB with Mongoose + Resilient Persistent Local JSON Store |
| **Payments** | Razorpay Node SDK (Order creation, signature verification, test mode fallback) |
| **DevOps & Deploy** | Vercel Serverless Ready (`vercel.json`), MinGit version control |

---

## 📂 Project Structure

```
kandhari-tent-website/
├── api/                        # Vercel serverless function entry points
│   └── index.js
├── client/                     # Vite React Frontend Application
│   ├── public/
│   │   ├── media/
│   │   │   └── lawn/          # Raw WhatsApp video & 7 vertical reels with covers
│   │   │       ├── DwarakaShreevideo.mp4
│   │   │       └── reels/     # 01_Grand_Entrance.mp4 ... 07_Venue_Teaser.mp4
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages (HomePage, LawnPage, AdminDashboardPage, etc.)
│   │   ├── services/          # Client API services (api.js)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js         # Port configured to 3050 (proxying to :5050)
├── server/                     # Express Node.js Backend Application
│   ├── controllers/           # API controllers (auth, venue, enquiries, items, payments, etc.)
│   ├── data/
│   │   └── localStore.json    # Resilient local JSON data store
│   ├── routes/                # Express API routes
│   ├── scripts/
│   │   └── resetAdmin.js      # Secure admin password reset CLI utility
│   ├── services/
│   │   ├── pricingEngine.js   # Authoritative rental & delivery pricing engine
│   │   └── reelRenderer.js    # FFmpeg video reel synthesis engine
│   ├── package.json
│   ├── server.js              # Server entry point (default port: 5050)
│   └── testServer.js          # Complete 23-test automated verification suite
├── .env.example                # Sanitized environment template
├── .gitignore                  # Comprehensive Git exclusions
├── package.json                # Root package configuration
├── vercel.json                 # Vercel deployment routes and build settings
└── README.md
```

---

## 🚀 Local Installation & Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **FFmpeg**: (Optional for local video reel rendering; static reels and player work out of the box)
- **MongoDB**: (Optional; server runs automatically on its resilient local JSON store if MongoDB is not present)

> [!IMPORTANT]
> **Port Preservation**: Ports 3000 and 5000 are strictly avoided to prevent conflicts with external developer environments. The backend runs on port **5050** and the frontend runs on port **3050**.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Varun612/kandhari-tent-house.git
cd kandhari-tent-house

# Install backend dependencies
npm install --prefix server

# Install frontend dependencies
npm install --prefix client
```

### 3. Environment Configuration

Create `.env` inside `server/` using `.env.example` as a template:

```bash
cp .env.example server/.env
```

Configure your environment variables in `server/.env`:
```env
PORT=5050
NODE_ENV=development
JWT_SECRET=your_secure_random_32_char_secret
ADMIN_EMAIL=varunkandhari612@gmail.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_chosen_admin_password
BUSINESS_PHONE=1800-890-3456
WHATSAPP_PHONE=9118008903456
```

### 4. Starting the Application

#### Start the Backend API (Port 5050):
```bash
npm start --prefix server
# Server listens on http://localhost:5050
```

#### Start the React Frontend (Port 3050):
```bash
npm run dev --prefix client
# Vite dev server runs on http://localhost:3050
```

Open **http://localhost:3050** in your browser.

---

## 🔐 Admin Authentication & Password Recovery

- **Admin Login Portal:** `http://localhost:3050/admin/login`
- **Dual-Identifier Login:** You can log in using either the verified owner email or the admin username.
- **Password Reset Tool:**
  ```bash
  # Reset password securely via CLI
  node server/scripts/resetAdmin.js "YourNewPassword"
  ```

---

## 🧪 Automated Testing & Production Build

### Running the Test Suite
The repository includes a comprehensive 23-test automated verification suite that runs against an isolated dynamic test port:

```bash
node server/testServer.js
```

### Building for Production
```bash
npm run build --prefix client
```
Compiles optimized assets to `client/dist/` in under 20 seconds.

---

## 🌐 Deployment Notes

- **Vercel Deployment:** The repository includes a production-ready `vercel.json` configured with dual routing for both API serverless endpoints (`/api/*`) and SPA client fallback routes.
- **Local JSON Store Resiliency:** If MongoDB Atlas connection is absent or timed out, the backend transparently falls back to `server/data/localStore.json`, ensuring zero downtime.

---

## 🔮 Planned Enhancements (Roadmap)

- [ ] Automated WhatsApp booking confirmation webhook via WhatsApp Business Cloud API.
- [ ] Push notifications for staff attendance and delivery dispatch.
- [ ] Multi-camera live wedding streaming integration for overseas family members.

---

## 📞 Business Contact

- **Business Name:** Kandhari Tent & Caterers
- **Venue:** Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)
- **Address:** Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow, Uttar Pradesh, India
- **Phone:** +91 1800-890-3456 | +91 9307908994 | +91 7355059566
- **WhatsApp:** +91 1800-890-3456
- **Email:** varunkandhari612@gmail.com
