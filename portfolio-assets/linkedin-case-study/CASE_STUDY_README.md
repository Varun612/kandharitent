# Kandhari Tent & Caterers — Production Portfolio Case Study

> **A real-world full-stack web application & enterprise operations system for a premier wedding tent, luxury catering, and event venue business in Lucknow, India.**  
> **Live Production System:** [https://kandharitent.vercel.app/](https://kandharitent.vercel.app/)  
> **Target Audience:** Engineering Leads, Tech Recruiters, Hiring Managers, and Systems Architects.

---

## 📁 Package Directory Structure

This repository contains a complete, verified suite of portfolio and social proof assets:

```
portfolio-assets/linkedin-case-study/
├── kandhari-tent-case-study.pdf       # Ready-to-upload 12-page LinkedIn Document Carousel (1080x1350)
├── WALKTHROUGH.md                    # Deep-dive 3,000+ word engineering & UX documentation
├── CASE_STUDY_README.md              # This executive guide & deployment playbook
├── linkedin-post.txt                 # Formatted copy, hooks, hashtags, and resume blurbs
│
├── screenshots/                      # 23 authentic high-resolution (2x Retina) production captures
│   ├── 01_homepage_hero.png
│   ├── 02_services_section.png
│   ├── 03_rental_catalogue.png
│   ├── 04_rental_product_cards_detail.png
│   ├── 05_enquiry_cart_and_pricing.png
│   ├── 06_dwarka_shri_lawn_showcase.png
│   ├── 07_lawn_reels_and_areas.png
│   ├── 08_catering_menu.png
│   ├── 09_booking_enquiry_form.png
│   ├── 10_admin_login_portal.png
│   ├── 11_admin_dashboard_overview.png
│   ├── 12_admin_staff_and_attendance.png
│   ├── 13_admin_outside_payments.png
│   ├── 14_admin_customers_and_quotes.png
│   ├── 15_admin_bookings_pipeline.png
│   ├── 16_admin_inventory_stock.png
│   ├── 17_admin_analytics.png
│   ├── 18_admin_master_agent.png
│   ├── 19_admin_marketing_studio.png
│   ├── 20_admin_bills_and_invoices.png
│   ├── 21_mobile_homepage.png
│   ├── 22_mobile_rental_catalogue.png
│   └── 23_mobile_lawn_page.png
│
├── diagrams/                         # High-res SVG and 2x PNG architecture & flow diagrams
│   ├── customer-user-flow.svg / .png (1600x900)
│   ├── admin-workflow.svg / .png     (1600x900)
│   └── system-architecture.svg / .png(1600x950)
│
├── annotated/                        # 11 framed screenshots with UI chrome & engineering callouts
│   ├── customer_step1_discovery_hero.png
│   ├── customer_step2_rental_ecom.png
│   ├── customer_step3_cart_logic.png
│   ├── customer_step4_lawn_showcase.png
│   ├── customer_step5_catering_and_enquiry.png
│   ├── admin_step1_auth_guard.png
│   ├── admin_step2_business_overview.png
│   ├── admin_step3_staff_and_payroll.png
│   ├── admin_step4_crm_and_bookings.png
│   ├── admin_step5_inventory_control.png
│   └── admin_step6_invoicing_and_reels.png
│
└── carousel/                         # Individual 1080x1350 slide images (12 PNG slides)
    ├── slide-01.png through slide-12.png
```

---

## 🚀 How to Publish on LinkedIn

### 1. Uploading the PDF Document Carousel (Highest Reach Format)
1. Navigate to **LinkedIn** and click **Start a post**.
2. Click the **Document icon** (or "Add a document").
3. Choose `portfolio-assets/linkedin-case-study/kandhari-tent-case-study.pdf`.
4. Document Title:  
   `Kandhari Tent & Caterers — Full-Stack Production Case Study`
5. In the post text field, copy and paste the ready-to-use copy from **`linkedin-post.txt`** (Option A or Option B).
6. Click **Post**. Document carousels trigger LinkedIn's interactive slide reader, delivering 3x-5x higher engagement and dwell time.

### 2. Adding to Your LinkedIn Profile "Featured" Section
1. Go to your LinkedIn profile.
2. Under the **Featured** section, click the **+** (Add) button.
3. Select **Add media** -> upload `kandhari-tent-case-study.pdf` or `diagrams/system-architecture.png`.
4. Title: `Full-Stack Production System: Kandhari Tent & Caterers`
5. Description: Use the **LinkedIn Featured Summary** provided in `linkedin-post.txt`.

### 3. Adding to Your Resume / CV
Use the targeted 3-bullet accomplishment block from `linkedin-post.txt` under your Projects or Experience section.

---

## 🛠️ Engineering Highlights & Architecture
- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React, HTML5 Video Engine, React Router DOM v6.
- **Backend API:** Node.js, Express 4 RESTful architecture with a custom dual-mount routing engine (`mountDualRoute`) providing backwards compatibility across legacy and v1 API paths.
- **Security:** Stateless JWT authentication in `httpOnly`-ready format, bcrypt (10 salt rounds) password hashing, sanitized inputs, rate-limiting headers.
- **Resilient Dual Storage:** Seamless fallback engine bridging MongoDB Atlas cloud persistence with zero-dependency synchronous atomic local disk storage (`localStore.json`).
- **Domain Modules:** Real-time rental quoting cart, dynamic 18% GST calculation, staff payroll & daily attendance tracking, cash-flow ledger, and interactive CRM booking pipeline.
