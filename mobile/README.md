# Kandhari Tent & Caterers — Android & iOS Mobile Application

Official cross-platform mobile application for **Kandhari Tent & Caterers** and **Dwarka Shri Lawn** (Kanpur Road, Lucknow, Uttar Pradesh).

Built with **React Native / Expo** with full integration to the Kandhari Tent Node.js Express backend and pricing engine.

---

## 🌟 Key Features

1. **Full Rental Catalogue**:
   - 30 equipment items across 8 categories (Chairs & Sofas, Banquet Tables, Tents & Pandals, Stages & Mandaps, Coolers & Fans, 3D Carpets, Barricades, Welcome Gates).
   - Real-time search and category filtering.
   - Rigid 4:3 card aspect ratio and detailed dimensional specs.
   - Ground area calculator for pandals and tents (Length × Width in feet).

2. **Frictionless Add-to-Cart & Pricing Engine**:
   - Zero login walls for browsing and adding items to cart.
   - Multi-day duration rental multiplier.
   - Automated distance-band cartage calculation (0–3 km: ₹500, 3–7 km: ₹1,000, >7 km: ₹1,500).
   - Distance-band labour charges with tent rigging surcharges.
   - Promotional coupon code validation (`WELCOME100`, `FIRST200`, `EARLYBIRD10`).

3. **Veronica AI Receptionist**:
   - 24/7 autonomous telephony receptionist integration.
   - One-tap callback request triggering the backend voice queue (`/api/receptionist/call/start`).
   - Interactive voice simulation dialogue with mandatory AI transparency disclosure.

4. **Quotation & Order Tracking**:
   - In-app quotation request submission to `/api/enquiries`.
   - Real-time booking pipeline tracking (`ENQ-YYYY-XXXX`).

5. **Executive Admin Command**:
   - Dual-identifier authentication (login via `varunkandhari612@gmail.com` or `admin`).
   - Quick KPI metrics for inquiries, active calls, Daya attendance, and deducted staff advances.

---

## 🚀 Running the Mobile App

### Prerequisites
- Node.js (v18+)
- Android Studio / Android Emulator OR Expo Go on a physical Android device.

### Setup & Launch
```bash
cd mobile
npm install
npm run android
```

### Backend API Configuration
The app automatically routes network requests based on the running environment:
- **Android Emulator**: `http://10.0.2.2:5050/api`
- **Physical Device**: Configure your LAN IP (e.g., `http://192.168.1.X:5050/api`) in `app.json`.
- **Production Cloud**: `https://kandharitent.vercel.app/api`
