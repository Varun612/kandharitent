# Kandhari Tent & Caterers & Dwarka Shri Lawn

**Dynamic Full-Stack Web Application & Event Management Platform**  
*Location: Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh, India*  
*Tagline: "Making Your Celebrations Memorable"*

---

## 🌟 Overview

A premium, responsive, dynamic business website engineered for **Kandhari Tent & Caterers** and **Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)**. 

The application is built for real-world operations in Lucknow, providing:
1. **Multi-Item Rental Catalogue:** Dynamic equipment catalogue supporting 100+ items across 8 categories (Chairs, Tables, Tents, Stages, Coolers, Lighting, Wedding Essentials, and Other Event Equipment).
2. **Interactive Enquiry Cart & WhatsApp Quote Integration:** Customers can select items and quantities, review their enquiry list, submit their event details to the database, and instantly open a pre-formatted WhatsApp quote request to `+91 9305465848`.
3. **Dwarka Shri Lawn Venue Showcase:** Dedicated venue page with photography, suitable functions, editable facilities/amenities, and a date availability enquiry form.
4. **Services Showcase:** Deep-dives into tent rentals, decor & illumination, lawn hosting, and an official **Catering Services (Coming Soon)** section with waitlist notification.
5. **Secure Administrator Control Dashboard (`/admin`):**
   - Full CRUD for rental equipment inventory (quantities, availability toggles, notes, images)
   - Enquiry Management with status pipeline (`New` ➔ `Contacted` ➔ `Confirmed` ➔ `Closed`), team notes, and direct caller/WhatsApp links
   - Venue Content & Amenities Manager (add/edit amenities without code changes)
   - Photo Gallery Manager (upload, categorize, and delete photos)
   - Real-time inventory and enquiry statistics

---

## 🛠️ Technical Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons, React Router DOM
- **Backend:** Node.js, Express, JWT Authentication, Bcrypt password encryption, CORS
- **Database Architecture (Dual-Mode Resilient Persistence):**
  - **MongoDB with Mongoose:** Ready for production with schemas for `Item`, `Enquiry`, `Venue`, `Gallery`, and `AdminUser`.
  - **Automatic Local JSON Fallback (`server/data/localStore.json`):** If a local MongoDB instance is not yet running, the server gracefully activates its persistent local JSON store, enabling 100% of the site's dynamic features, enquiry submissions, and admin dashboard without requiring MongoDB to be pre-installed!
- **Brand Tokens:**
  - Royal Maroon / Deep Purple: `#4a0e4e`, `#581c87`, `#2e0854`
  - Accent Purple: `#7c3aed`
  - Royal Gold: `#c59a3f`, `#b4852f`
  - Cream / Ivory: `#faf7f2`, `#ffffff`

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- Optional: Local or cloud **MongoDB** instance (e.g. MongoDB Atlas or localhost:27017)

### 2. Installation
Open your terminal in the project directory:

```bash
cd C:\Users\info\.gemini\antigravity\scratch\kandhari-tent-website

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables
Both `server/.env` and `server/.env.example` are pre-configured:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kandhari_tent
JWT_SECRET=kandhari_royal_secret_key_lucknow_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@kandhari2026
ADMIN_EMAIL=contact@kandharitent.com
BUSINESS_PHONE=9305465848
WHATSAPP_PHONE=919305465848
```

### 4. Running the Application

You can run both server and client in separate terminal windows:

#### Terminal 1 — Start the Backend Server:
```bash
cd C:\Users\info\.gemini\antigravity\scratch\kandhari-tent-website\server
npm start
# Server starts at http://localhost:5000
```

#### Terminal 2 — Start the React Frontend:
```bash
cd C:\Users\info\.gemini\antigravity\scratch\kandhari-tent-website\client
npm run dev
# Frontend starts at http://localhost:3000
```

Open your browser at **`http://localhost:3000`** to view the website.

---

## 🔐 Administrator Portal Access

- **Login URL:** `http://localhost:3000/admin/login`
- **Default Username:** `admin`
- **Default Password:** `admin@kandhari2026`

Once authenticated, you will be redirected to the secure **Admin Dashboard** (`/admin/dashboard`) to manage inventory, customer enquiries, lawn amenities, and gallery media.

---

## 📞 Business Contact Details

- **Business Name:** Kandhari Tent & Caterers
- **Venue:** Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)
- **Address:** Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh, India
- **Phone Numbers:**
  - `+91 9305465848`
  - `+91 9307908994`
  - `+91 7355059566`
- **WhatsApp:** `+91 9305465848`
- **Email:** `contact@kandharitent.com`
