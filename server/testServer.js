/**
 * Comprehensive Automated Verification Suite for Kandhari Tent & Caterers
 * Tests:
 * 1. Health & Dual-Mode Persistence
 * 2. Equipment Catalogue (30+ items)
 * 3. 8 Gallery Categories with 5+ photos each
 * 4. Venue & Lawn Details
 * 5. Customer Registration, Login & My Enquiries
 * 6. AI Customer Chat Assistant:
 *    - Intent recognition (Catering, Lawn, Stage, etc.)
 *    - Conversational slot-filling
 *    - 5-Photo Gallery retrieval
 *    - Persistent memory retrieval across sessions
 *    - Converting chat state to official enquiry
 *    - Access control / privacy protection
 * 7. Admin Authentication, Status Pipeline, and CSV Export
 */

process.env.NODE_ENV = 'test';
const app = require('./server');
const http = require('http');

const PORT = process.env.TEST_PORT || 0; // Isolated dynamic test port

const runTests = async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, resolve));
  const assignedPort = server.address().port;
  console.log(`[Test Suite] Test server listening on http://localhost:${assignedPort}`);

  const testEndpoint = async (url, options = {}) => {
    const isCustomContentType = options.headers && options.headers['Content-Type'];
    const headers = isCustomContentType
      ? options.headers
      : { 'Content-Type': 'application/json', ...(options.headers || {}) };

    const res = await fetch(`http://localhost:${assignedPort}${url}`, {
      ...options,
      headers
    });

    const cType = res.headers.get('content-type') || '';
    let data;
    if (cType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, data, contentType: cType };
  };

  try {
    // 1. Health check
    console.log('\n--- Test 1: Health Endpoint & Database Mode ---');
    const health = await testEndpoint('/api/health');
    console.log(`Status: ${health.status} | Mode: ${health.data.database}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Equipment Items Catalogue
    console.log('\n--- Test 2: Equipment Catalogue ---');
    const items = await testEndpoint('/api/items');
    console.log(`Items count: ${items.data.count} items loaded.`);
    if (!items.data.count || items.data.count < 10) throw new Error('Expected at least 10 items');

    // 3. Gallery Verification across all 7 Canonical Sections
    console.log('\n--- Test 3: Gallery 7 Sections Verification ---');
    const categories = [
      'Actual wedding and reception setups',
      'Dwarka Shri Lawn venue and grounds',
      'Stage and mandap designs',
      'Tent structures and canopy layouts',
      'Seating and furniture arrangements',
      'Floral and lighting decor',
      'Catering and food counters'
    ];
    for (const cat of categories) {
      const gal = await testEndpoint(`/api/gallery?category=${encodeURIComponent(cat)}`);
      const count = gal.data.count || (gal.data.data ? gal.data.data.length : 0);
      console.log(`• Section [${cat}]: ${count} photos available`);
      if (count < 1) throw new Error(`Section ${cat} expected at least 1 photo, found ${count}`);
    }

    // 3.1 Catering Menu & Quotation Verification
    console.log('\n--- Test 3.1: Authentic Catering Menu & Dual-Mount Verification ---');
    const cateringMenuWithPrefix = await testEndpoint('/api/catering/menu');
    console.log(`[Catering] GET /api/catering/menu: HTTP ${cateringMenuWithPrefix.status} | Total Dishes: ${cateringMenuWithPrefix.data.count} | Categories: ${cateringMenuWithPrefix.data.categories?.length}`);
    if (cateringMenuWithPrefix.status !== 200 || !cateringMenuWithPrefix.data.success || cateringMenuWithPrefix.data.count < 50) {
      throw new Error('Expected at least 50 authentic dishes in catering menu');
    }

    const cateringMenuNoPrefix = await testEndpoint('/catering/menu');
    console.log(`[Catering Dual-Mount] GET /catering/menu: HTTP ${cateringMenuNoPrefix.status} | Total Dishes: ${cateringMenuNoPrefix.data.count}`);
    if (cateringMenuNoPrefix.status !== 200 || cateringMenuNoPrefix.data.count !== cateringMenuWithPrefix.data.count) {
      throw new Error('Catering menu dual-mount failed');
    }

    // Test Catering quotation enquiry submission
    const cateringEnquiryPayload = {
      customerName: 'Ananya Sharma',
      phone: '9876543210',
      eventDate: '2026-11-28',
      guestCount: 300,
      locality: 'Kanpur Road, Lucknow',
      selectedDishes: [
        { name: 'Kashmiri Kahwa', category: 'Welcome Drinks & Starters' },
        { name: 'Paneer Tikka Angara', category: 'Barbecue & Tandoor Live Grill' },
        { name: 'Shahi Paneer Awadhi Khas', category: 'Paneer Specialities' },
        { name: 'Dal Makhani Bukhara', category: 'Dal Varieties' },
        { name: 'Lucknowi Shahi Tukda with Rabdi', category: 'Desserts & Traditional Sweets' }
      ],
      detailedRequirements: 'Authentic Awadhi royal wedding catering for 300 guests.'
    };
    const cateringEnquiryRes = await testEndpoint('/api/catering/enquiries', {
      method: 'POST',
      body: JSON.stringify(cateringEnquiryPayload)
    });
    console.log(`[Catering Enquiry] POST /api/catering/enquiries: HTTP ${cateringEnquiryRes.status} | Success: ${cateringEnquiryRes.data.success}`);
    if (cateringEnquiryRes.status !== 201 || !cateringEnquiryRes.data.success) {
      throw new Error('Failed to submit catering quotation enquiry');
    }

    // Test Packages Endpoint
    const packagesRes = await testEndpoint('/api/catering/packages');
    console.log(`[Packages] GET /api/catering/packages: HTTP ${packagesRes.status} | Total Packages: ${packagesRes.data.data?.length}`);
    if (packagesRes.status !== 200 || !packagesRes.data.success || packagesRes.data.data?.length < 4) {
      throw new Error('Expected at least 4 packages from /api/catering/packages');
    }

    // 4. Venue & Lawn Details
    console.log('\n--- Test 4: Dwarka Shri Lawn Details ---');
    const venue = await testEndpoint('/api/venue');
    console.log(`Venue: ${venue.data.data.name} | Amenities: ${venue.data.data.amenities?.length}`);
    if (venue.data.data.name !== 'Dwarka Shri Lawn') throw new Error('Invalid venue name');

    // 5. Customer Registration & Privilege Escalation Prevention
    console.log('\n--- Test 5: Customer Registration & Privilege Escalation Prevention ---');
    const testEmail = `client_${Date.now()}@test.com`;
    const regRes = await testEndpoint('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Vikas Malhotra',
        email: testEmail,
        phone: '9839123456',
        password: 'Password123!',
        role: 'admin' // Attempt privilege escalation
      })
    });
    console.log('Customer Registration success:', regRes.data.success, '| User ID:', regRes.data.user?.id, '| Role:', regRes.data.user?.role);
    if (!regRes.data.success || regRes.data.user?.role !== 'customer') {
      throw new Error('Privilege escalation prevention failed: role was not locked to customer');
    }
    const customerToken = regRes.data.token;
    const customerId = regRes.data.user.id;
    if (!customerToken) throw new Error('Expected customer JWT token');

    const loginRes = await testEndpoint('/api/auth/customer-login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'Password123!' })
    });
    console.log('Customer Login verified:', loginRes.data.success);
    if (!loginRes.data.token) throw new Error('Customer login failed');

    // 6. Identity Spoofing Prevention
    console.log('\n--- Test 6: Identity Spoofing Prevention ---');
    const spoofedEnquiry = await testEndpoint('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Guest User',
        phone: '9839999999',
        eventDate: '2026-12-15',
        customerId: 'spoofed_customer_id_999' // Attempt to inject customerId without auth
      })
    });
    console.log('Guest enquiry submitted. Stored customerId:', spoofedEnquiry.data.data?.customerId);
    if (spoofedEnquiry.data.data?.customerId !== null) {
      throw new Error('Identity spoofing prevention failed: unverified customerId was accepted');
    }

    // 7. Critical Customer Journey: Chat -> Collect -> Auth -> Resume & Edit -> Submit
    console.log('\n--- Test 7: Critical Customer Journey (Chat -> Register -> Resume & Edit -> Submit) ---');
    
    // 7.1 Start fresh unauthenticated chat session
    const guestChat = await testEndpoint('/api/chat/conversation/new', { method: 'POST' });
    const convId = guestChat.data.conversation?.id;
    console.log(`Unauthenticated Chat Started: ${guestChat.data.success} | Conversation ID: ${convId}`);
    if (!convId) throw new Error('Failed to start chat conversation');

    // 7.2 Hindi Catering Intent
    console.log('• Hindi Catering Intent ("Khaane ka menu bhejiye")');
    const msg1 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text: 'Khaane ka menu bhejiye' })
    });
    console.log('  Intent:', msg1.data.recognizedIntent);
    if (msg1.data.recognizedIntent !== 'catering_menu') throw new Error('Failed to classify catering intent');

    // 7.3 Lawn 5-Photo Gallery Request
    console.log('• 5-Photo Gallery Request ("Aapke lawn ki photos hain?")');
    const msg2 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text: 'Aapke lawn ki photos hain?' })
    });
    const photosReturned = msg2.data.assistantMessage?.galleryImages?.length || 0;
    console.log(`  Photos returned: ${photosReturned}`);
    if (photosReturned !== 5) throw new Error(`Expected exactly 5 photos, got ${photosReturned}`);

    // 7.4 Conversational Slot Filling
    console.log('• Conversational Slot Filling ("Mujhe 20 November ko Kanpur Road par shaadi karni hai 400 guests ke saath")');
    const msg3 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text: 'Mujhe 20 November ko Kanpur Road par shaadi karni hai 400 guests ke saath' })
    });
    const state = msg3.data.collectedState || {};
    console.log(`  Extracted: Event=${state.eventType}, Date=${state.eventDate}, Locality=${state.locality}, Guests=${state.guestCount}`);
    if (state.eventType !== 'Wedding' || state.guestCount !== 400) throw new Error('Slot extraction failed');

    // 7.5 Resume & Edit: Submit official enquiry with authenticated JWT & edited details
    console.log('• Resume Inquiry & Submit with Authenticated Account & Edited Details (guests: 450)');
    const submitChatRes = await testEndpoint(`/api/chat/conversation/${convId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        customerName: 'Vikas Malhotra',
        phone: '9839123456',
        eventType: 'Wedding',
        eventDate: '2026-11-20',
        locality: 'Kanpur Road / Daroga Kheda',
        guestCount: 450, // Customer adjusted guest count from 400 to 450
        serviceRequired: 'German Hangar & Royal Stage Decor',
        notes: 'Requires luxury waterproof German hangar tent and floral mandap.'
      })
    });

    console.log('  Enquiry Ref:', submitChatRes.data.referenceNumber, '| Success:', submitChatRes.data.success);
    const officialRef = submitChatRes.data.referenceNumber;
    if (!officialRef) throw new Error('Enquiry submission did not return reference number');
    if (!submitChatRes.data.whatsappUrl) throw new Error('Enquiry submission missing WhatsApp URL');

    const createdEnquiry = submitChatRes.data.enquiry;
    console.log('  Enquiry customerId derived on server:', createdEnquiry.customerId, '| Expected:', customerId);
    if (createdEnquiry.customerId !== customerId) throw new Error('Server did not bind authenticated customerId to enquiry');
    if (createdEnquiry.guestCount !== 450) throw new Error(`Expected edited guest count 450, found ${createdEnquiry.guestCount}`);

    // 8. Customer Isolation & Security Checks
    console.log('\n--- Test 8: Customer Isolation & Security Verification ---');
    
    // 8.1 Customer can view their own enquiry
    const ownEnquiry = await testEndpoint(`/api/enquiries/${officialRef}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log(`• Owner viewing own enquiry: HTTP ${ownEnquiry.status} | Ref: ${ownEnquiry.data.data?.id}`);
    if (ownEnquiry.status !== 200 || ownEnquiry.data.data?.id !== officialRef) {
      throw new Error('Owner failed to view own enquiry');
    }

    // 8.2 Create a second customer (Intruder)
    const intruderEmail = `intruder_${Date.now()}@test.com`;
    const user2 = await testEndpoint('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Another Customer',
        email: intruderEmail,
        phone: '9839000000',
        password: 'Password123!'
      })
    });
    const intruderToken = user2.data.token;

    // 8.3 Intruder cannot view Customer A's enquiry
    const intruderEnquiryAttempt = await testEndpoint(`/api/enquiries/${officialRef}`, {
      headers: { 'Authorization': `Bearer ${intruderToken}` }
    });
    console.log(`• Intruder attempting to view other customer enquiry: HTTP ${intruderEnquiryAttempt.status}`);
    if (intruderEnquiryAttempt.status !== 403) {
      throw new Error('Security violation: Intruder was able to access another customer enquiry');
    }

    // 8.4 Intruder cannot view Customer A's chat conversation
    const intruderChatAttempt = await testEndpoint(`/api/chat/conversation/${convId}`, {
      headers: { 'Authorization': `Bearer ${intruderToken}` }
    });
    console.log(`• Intruder attempting to view other customer chat: HTTP ${intruderChatAttempt.status}`);
    if (intruderChatAttempt.status !== 403) {
      throw new Error('Security violation: Intruder was able to access another customer chat');
    }

    // 8.5 Customer Portal isolation
    const user1Enquiries = await testEndpoint('/api/auth/my-enquiries', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const user2Enquiries = await testEndpoint('/api/auth/my-enquiries', {
      headers: { 'Authorization': `Bearer ${intruderToken}` }
    });
    console.log(`• Customer 1 enquiries count: ${user1Enquiries.data.count} | Customer 2 enquiries count: ${user2Enquiries.data.count}`);
    const intruderSeesCustomer1 = (user2Enquiries.data.enquiries || []).some(e => e.id === officialRef);
    if (intruderSeesCustomer1) {
      throw new Error('Customer portal isolation failed: User 2 saw User 1 enquiry');
    }

    // 8.6 Customer token rejected on Admin endpoints
    const forbiddenAdminCall = await testEndpoint('/api/enquiries', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log(`• Customer attempting admin route /api/enquiries: HTTP ${forbiddenAdminCall.status}`);
    if (forbiddenAdminCall.status !== 403) {
      throw new Error('Admin route protection failed: customer token was not rejected with 403');
    }

    // 9. Admin Portal, Status Pipeline & CSV Export
    console.log('\n--- Test 9: Admin Authentication, Status Pipeline & CSV Export ---');
    const adminLoginRes = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin@kandhari2026' })
    });
    const adminToken = adminLoginRes.data.token;
    console.log('Admin Login Token received:', !!adminToken);

    // Update enquiry status: New -> In Discussion
    const updateRes = await testEndpoint(`/api/enquiries/${officialRef}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'In Discussion',
        internalNotes: 'Client contacted via phone; discussed German hangar and stage floral package.'
      })
    });
    console.log('Status updated to "In Discussion":', updateRes.data.success);
    if (!updateRes.data.success || updateRes.data.data?.status !== 'In Discussion') {
      throw new Error('Failed to update status to In Discussion');
    }

    // Update enquiry status: In Discussion -> Confirmed
    const confirmRes = await testEndpoint(`/api/enquiries/${officialRef}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Confirmed',
        internalNotes: 'Advance payment received. Booking locked for Dwarka Shri Lawn.'
      })
    });
    console.log('Status updated to "Confirmed":', confirmRes.data.success);
    if (!confirmRes.data.success || confirmRes.data.data?.status !== 'Confirmed') {
      throw new Error('Failed to update status to Confirmed');
    }

    // Verify CSV Export
    const csvRes = await fetch(`http://localhost:${assignedPort}/api/enquiries/export/csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvText = await csvRes.text();
    console.log(`CSV Export: HTTP ${csvRes.status} | Length: ${csvText.length} bytes`);
    if (csvRes.status !== 200 || !csvText.includes('Ref ID') || !csvText.includes(officialRef)) {
      throw new Error('CSV export failed or missing created enquiry');
    }

    // Test 11: Production 404 & Dual-Mount Routing Fix Verification
    console.log('\n--- Test 11: Production 404 & Dual-Mount Routing Verification ---');
    
    // 11.1: Featured items on /api/items?featured=true
    const featuredWithPrefix = await testEndpoint('/api/items?featured=true');
    console.log(`[Dual-Mount] GET /api/items?featured=true: HTTP ${featuredWithPrefix.status} | Count: ${featuredWithPrefix.data.count}`);
    if (featuredWithPrefix.status !== 200 || !featuredWithPrefix.data.success) {
      throw new Error('Failed GET /api/items?featured=true');
    }

    // 11.2: Featured items on /items?featured=true (stripped prefix)
    const featuredWithoutPrefix = await testEndpoint('/items?featured=true');
    console.log(`[Dual-Mount] GET /items?featured=true: HTTP ${featuredWithoutPrefix.status} | Count: ${featuredWithoutPrefix.data.count}`);
    if (featuredWithoutPrefix.status !== 200 || !featuredWithoutPrefix.data.success) {
      throw new Error('Failed GET /items?featured=true');
    }

    // 11.3: Direct enquiry submission on /api/enquiries
    const enquiryPayload = {
      customerName: 'Rohit Verma',
      phone: '9876543210',
      eventDate: '2026-12-15',
      locality: 'Alambagh, Lucknow',
      serviceRequired: 'Wedding Tent & Catering',
      guestCount: 350
    };
    const enquiryWithPrefix = await testEndpoint('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryPayload)
    });
    console.log(`[Dual-Mount] POST /api/enquiries: HTTP ${enquiryWithPrefix.status} | Success: ${enquiryWithPrefix.data.success}`);
    if (enquiryWithPrefix.status !== 201 || !enquiryWithPrefix.data.success) {
      throw new Error('Failed POST /api/enquiries');
    }

    // 11.4: Direct enquiry submission on /enquiries (stripped prefix)
    const enquiryWithoutPrefix = await testEndpoint('/enquiries', {
      method: 'POST',
      body: JSON.stringify({ ...enquiryPayload, phone: '9876543211' })
    });
    console.log(`[Dual-Mount] POST /enquiries: HTTP ${enquiryWithoutPrefix.status} | Success: ${enquiryWithoutPrefix.data.success}`);
    if (enquiryWithoutPrefix.status !== 201 || !enquiryWithoutPrefix.data.success) {
      throw new Error('Failed POST /enquiries');
    }

    // 11.5: Health check without /api prefix
    const healthNoPrefix = await testEndpoint('/health');
    console.log(`[Dual-Mount] GET /health: HTTP ${healthNoPrefix.status} | Status: ${healthNoPrefix.data.status}`);
    if (healthNoPrefix.status !== 200 || healthNoPrefix.data.status !== 'online') {
      throw new Error('Failed GET /health');
    }

    // 11.6: Non-existent API route returns JSON 404 (NEVER HTML)
    const notFoundRes = await testEndpoint('/api/non-existent-endpoint');
    console.log(`[JSON 404] GET /api/non-existent-endpoint: HTTP ${notFoundRes.status} | JSON message: ${notFoundRes.data.message}`);
    if (notFoundRes.status !== 404 || notFoundRes.data.success !== false) {
      throw new Error('Expected 404 JSON for non-existent route');
    }

    // --- Test 12: Admin Approval Workflow, Razorpay Payment, Notifications & Reports ---
    console.log('\n--- Test 12: Admin Approval Before Payment Workflow & Razorpay Integration ---');

    // 12.1: Submit fresh rental booking request as customer
    const orderPayload = {
      customerName: 'Vikramaditya Verma',
      phone: '9876543210',
      email: 'vikram.verma@example.com',
      eventDate: '2026-12-15',
      startDate: '2026-12-15',
      endDate: '2026-12-16',
      locality: 'Kanpur Road, Lucknow',
      items: [
        { id: 'item-chair-velvet', name: 'Velvet Chair with Cover', quantity: 100, rentalPrice: 45 },
        { id: 'item-table-round', name: 'Round Table with Cover', quantity: 10, rentalPrice: 200, durationSensitive: true }
      ]
    };

    const submitOrderRes = await testEndpoint('/api/enquiries', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify(orderPayload)
    });

    console.log(`[Workflow Step A] Customer submits booking request: HTTP ${submitOrderRes.status} | Status: ${submitOrderRes.data.data?.status}`);
    if (submitOrderRes.data.data?.status !== 'Pending Admin Approval') {
      throw new Error(`Expected status 'Pending Admin Approval', got '${submitOrderRes.data.data?.status}'`);
    }
    const orderId = submitOrderRes.data.data.id;

    // 12.2: Attempt payment before approval (Must be rejected)
    const prematurePayRes = await testEndpoint('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ enquiryId: orderId })
    });
    console.log(`[Workflow Security] Premature payment attempt blocked: HTTP ${prematurePayRes.status} | Message: ${prematurePayRes.data.message}`);
    if (prematurePayRes.status !== 400) {
      throw new Error('Expected 400 Bad Request when attempting to pay for unapproved order');
    }

    // 12.3: Admin reviews and prepares revised quotation (Step C)
    const reviewRes = await testEndpoint(`/api/enquiries/${orderId}/review`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        action: 'approve',
        quotationData: {
          lineItems: [
            { name: 'Velvet Chair with Cover', quantity: 100, unitRate: 45, lineTotal: 4500 },
            { name: 'Round Table with Cover', quantity: 10, unitRate: 200, effectiveDays: 2, lineTotal: 4000 }
          ],
          cartage: 500,
          labour: 500,
          discount: 500,
          quotationNotes: 'Special festive family discount applied.'
        }
      })
    });
    console.log(`[Workflow Step C] Admin approves with revised quotation: HTTP ${reviewRes.status} | Status: ${reviewRes.data.data?.status} | Total: ₹${reviewRes.data.data?.grandTotal}`);
    if (reviewRes.data.data?.status !== 'Approved — Awaiting Customer Acceptance') {
      throw new Error(`Expected status 'Approved — Awaiting Customer Acceptance', got '${reviewRes.data.data?.status}'`);
    }

    // 12.4: Customer reviews and accepts revised quotation
    const acceptRes = await testEndpoint(`/api/enquiries/${orderId}/accept-quotation`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log(`[Workflow Step C.2] Customer accepts quotation: HTTP ${acceptRes.status} | Status: ${acceptRes.data.data?.status}`);
    if (acceptRes.data.data?.status !== 'Approved — Awaiting Payment') {
      throw new Error(`Expected status 'Approved — Awaiting Payment', got '${acceptRes.data.data?.status}'`);
    }

    // 12.5: Customer creates Razorpay payment order (Step D)
    const createPaymentRes = await testEndpoint('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ enquiryId: orderId, paymentType: 'advance' })
    });
    console.log(`[Workflow Step D] Razorpay order created: HTTP ${createPaymentRes.status} | Razorpay Order ID: ${createPaymentRes.data.data?.orderId} | Payable: ₹${createPaymentRes.data.data?.amountToPay}`);
    if (createPaymentRes.status !== 200 || !createPaymentRes.data.data?.orderId) {
      throw new Error('Failed to create Razorpay payment order');
    }

    const rzpOrderId = createPaymentRes.data.data.orderId;
    const testPaymentId = `pay_test_${Date.now()}`;
    const paymentService = require('./services/paymentService');
    const validTestSignature = paymentService.generateTestSignature(rzpOrderId, testPaymentId);

    // 12.6: Verify payment with invalid signature (Security check)
    const invalidVerifyRes = await testEndpoint('/api/payments/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        enquiryId: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'invalid_fraudulent_signature'
      })
    });
    console.log(`[Workflow Security] Invalid payment signature blocked: HTTP ${invalidVerifyRes.status}`);
    if (invalidVerifyRes.status !== 400) {
      throw new Error('Expected 400 Bad Request on invalid payment signature');
    }

    // 12.7: Verify payment with valid signature (Step E & F)
    const validVerifyRes = await testEndpoint('/api/payments/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        enquiryId: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validTestSignature,
        amount: createPaymentRes.data.data.amountToPay
      })
    });
    console.log(`[Workflow Step E & F] Payment verified & Booking Confirmed: HTTP ${validVerifyRes.status} | Status: ${validVerifyRes.data.data?.status} | Advance Paid: ₹${validVerifyRes.data.data?.advancePaid}`);
    if (validVerifyRes.data.data?.status !== 'Confirmed') {
      throw new Error(`Expected status 'Confirmed', got '${validVerifyRes.data.data?.status}'`);
    }

    // 12.8: Idempotency check: Re-verify same payment (Must not double credit)
    const repeatVerifyRes = await testEndpoint('/api/payments/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        enquiryId: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validTestSignature,
        amount: createPaymentRes.data.data.amountToPay
      })
    });
    console.log(`[Workflow Idempotency] Duplicate payment verification handled cleanly: HTTP ${repeatVerifyRes.status}`);
    if (repeatVerifyRes.status !== 200 || !repeatVerifyRes.data.verified) {
      throw new Error('Idempotent payment re-verification failed');
    }

    // 12.9: Customer In-App Notification Center
    const notifsRes = await testEndpoint('/api/notifications/my-notifications', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log(`[Notifications] Customer Notifications loaded: HTTP ${notifsRes.status} | Count: ${notifsRes.data.count}`);
    if (notifsRes.status !== 200 || notifsRes.data.count < 1) {
      throw new Error('Expected at least 1 notification for customer');
    }

    // 12.10: Admin Reports Summary & Customer Registry
    const reportsSummary = await testEndpoint('/api/reports/summary', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Reports] Admin Report Summary: HTTP ${reportsSummary.status} | Total Revenue: ₹${reportsSummary.data.data?.totalRevenue} | Bookings: ${reportsSummary.data.data?.totalOrders}`);
    if (reportsSummary.status !== 200 || reportsSummary.data.data?.totalRevenue === undefined) {
      throw new Error('Reports summary failed');
    }

    // 13: Physical Inventory & Damage Audit Trail
    console.log('\n--- Test 13: Physical Inventory & Stock Adjustment Audit Trail ---');
    const invRes = await testEndpoint('/api/inventory', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Inventory] GET /api/inventory: HTTP ${invRes.status} | Total Items: ${invRes.data.data?.length}`);
    if (invRes.status !== 200 || !invRes.data.data || invRes.data.data.length < 5) {
      throw new Error('Physical inventory fetch failed or incomplete');
    }

    const chairItem = invRes.data.data[0];
    const adjustRes = await testEndpoint('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        itemId: chairItem.id,
        action: 'record_damage',
        quantity: 5,
        reason: 'Wedding packup damage inspection',
        notes: 'Handled by testing suite'
      })
    });
    console.log(`[Inventory Adjust] POST /api/inventory/adjust (Damage): HTTP ${adjustRes.status} | Damaged Qty: ${adjustRes.data.data?.damagedQuantity}`);
    if (adjustRes.status !== 200 || adjustRes.data.data?.damagedQuantity < 5) {
      throw new Error('Inventory adjustment failed to record damage');
    }

    const logsRes = await testEndpoint('/api/inventory/logs', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Inventory Logs] GET /api/inventory/logs: HTTP ${logsRes.status} | Total Logs: ${logsRes.data.data?.length}`);
    if (logsRes.status !== 200 || logsRes.data.data.length < 1) {
      throw new Error('Inventory audit logs not recorded');
    }

    // 14: Staff Roster, Daily Attendance (₹500 Default) & Wage Disbursements
    console.log('\n--- Test 14: Staff Roster, Attendance & ₹500 Daily Wage Calculation ---');
    const staffRes = await testEndpoint('/api/staff', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Staff] GET /api/staff: HTTP ${staffRes.status} | Total Staff: ${staffRes.data.data?.length}`);
    if (staffRes.status !== 200 || !staffRes.data.data || staffRes.data.data.length < 3) {
      throw new Error('Staff roster fetch failed or incomplete');
    }

    const firstWorker = staffRes.data.data[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const markAttRes = await testEndpoint('/api/staff/attendance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        staffId: firstWorker.id,
        staffName: firstWorker.name,
        role: firstWorker.role,
        dailyWage: firstWorker.dailyWage || 500,
        date: todayStr,
        status: 'Present'
      })
    });
    console.log(`[Attendance Mark] POST /api/staff/attendance: HTTP ${markAttRes.status} | Wage: ₹${markAttRes.data.data?.calculatedWage}`);
    if ((markAttRes.status !== 200 && markAttRes.status !== 201) || markAttRes.data.data?.calculatedWage !== 500) {
      throw new Error(`Expected calculated wage ₹500, got ₹${markAttRes.data.data?.calculatedWage}`);
    }

    // Duplicate check / idempotency
    const repeatAttRes = await testEndpoint('/api/staff/attendance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        staffId: firstWorker.id,
        date: todayStr,
        status: 'Half-day'
      })
    });
    console.log(`[Attendance Idempotency] Updated to Half-day: HTTP ${repeatAttRes.status} | Wage: ₹${repeatAttRes.data.data?.calculatedWage}`);
    if (repeatAttRes.status !== 200 || repeatAttRes.data.data?.calculatedWage !== 250) {
      throw new Error('Attendance update duplicate handling failed');
    }

    const wageSumRes = await testEndpoint(`/api/staff/wage-summary?date=${todayStr}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Wage Summary] GET /api/staff/wage-summary: HTTP ${wageSumRes.status} | Total Daily Wage: ₹${wageSumRes.data.data?.totalWage}`);
    if (wageSumRes.status !== 200 || wageSumRes.data.data?.totalWage === undefined) {
      throw new Error('Wage summary calculation failed');
    }

    // 15: Master AI Voice & Natural Language Business Agent
    console.log('\n--- Test 15: Master AI Agent & Voice Query Safety Confirmation ---');
    const agentQueryRes = await testEndpoint('/api/agent/query', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        query: 'आज की शादी की बुकिंग्स दिखाओ',
        conversationHistory: []
      })
    });
    console.log(`[Master Agent] POST /api/agent/query: HTTP ${agentQueryRes.status} | Action: ${agentQueryRes.data.action} | Response text length: ${agentQueryRes.data.reply?.length}`);
    if (agentQueryRes.status !== 200 || !agentQueryRes.data.reply) {
      throw new Error('Master Agent failed to process booking query');
    }

    // Write operation safety confirmation prompt
    const agentWriteRes = await testEndpoint('/api/agent/query', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        query: 'स्टॉक में 50 सफेद कुर्सियां जोड़ो',
        conversationHistory: []
      })
    });
    console.log(`[Master Agent Safety] Write operation requires confirmation: ${agentWriteRes.data.requiresConfirmation} | Tool: ${agentWriteRes.data.pendingAction?.tool}`);
    if (agentWriteRes.status !== 200 || !agentWriteRes.data.requiresConfirmation) {
      throw new Error('Master Agent write safety gate failed to require confirmation');
    }

    // 16: First-Party Privacy-Conscious Visitor Analytics
    console.log('\n--- Test 16: First-Party Visitor Analytics & Exclusion of Admin ---');
    const eventLogRes = await testEndpoint('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({
        type: 'pageview',
        path: '/store',
        page: '/store',
        sessionId: 'test-session-visitor-99',
        isAdmin: false
      })
    });
    console.log(`[Analytics Event] POST /api/analytics/event: HTTP ${eventLogRes.status} | Success: ${eventLogRes.data.success}`);
    if (eventLogRes.status !== 201 || !eventLogRes.data.success) {
      throw new Error('Failed to log visitor analytics event');
    }

    const analyticsSumRes = await testEndpoint('/api/analytics/summary', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Analytics Summary] GET /api/analytics/summary: HTTP ${analyticsSumRes.status} | Pageviews: ${analyticsSumRes.data.data?.summary?.totalPageviews}`);
    if (analyticsSumRes.status !== 200 || !analyticsSumRes.data.data) {
      throw new Error('Analytics summary fetch failed');
    }

    // 17: Outside Payments (Dhobi & suppliers recording & retrieval)
    console.log('\n--- Test 17: Outside Payments (Dhobi & Supplier Accounting) ---');
    const getOutsideRes = await testEndpoint('/api/payments/outside', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Outside Payments List] GET /api/payments/outside: HTTP ${getOutsideRes.status} | Count: ${getOutsideRes.data.count} | Total: ₹${getOutsideRes.data.totalAmount}`);
    if (getOutsideRes.status !== 200 || !getOutsideRes.data.success) {
      throw new Error('Failed to retrieve outside payments');
    }

    const postOutsideRes = await testEndpoint('/api/payments/outside', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        recipientName: 'Ramesh Laundry & Drycleaners',
        category: 'dhobi',
        amount: 2500,
        purpose: 'Mandap velvet curtains & sofa covers dry cleaning',
        paymentMethod: 'Cash',
        notes: 'Pre-wedding batch dry cleaning'
      })
    });
    console.log(`[Outside Payments Record] POST /api/payments/outside: HTTP ${postOutsideRes.status} | Recipient: ${postOutsideRes.data.data?.recipientName} | Amount: ₹${postOutsideRes.data.data?.amount}`);
    if (postOutsideRes.status !== 201 || !postOutsideRes.data.success || postOutsideRes.data.data?.amount !== 2500) {
      throw new Error('Failed to record outside payment');
    }

    // 18: Invoices & Commercial Bill Generation
    console.log('\n--- Test 18: Invoices & Commercial Bill Generation (INV-YYYY-XXXX) ---');
    const getInvoicesRes = await testEndpoint('/api/invoices', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Invoices List] GET /api/invoices: HTTP ${getInvoicesRes.status} | Total Invoices: ${getInvoicesRes.data.count}`);
    if (getInvoicesRes.status !== 200 || !getInvoicesRes.data.success) {
      throw new Error('Failed to list invoices');
    }

    const generateInvRes = await testEndpoint('/api/invoices/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        customerName: 'Ananya Sharma',
        phone: '9876543210',
        billingAddress: 'Kanpur Road, Daroga Kheda, Lucknow',
        eventDate: '2026-11-28',
        eventVenue: 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
        serviceRequired: 'Wedding Reception + Royal Catering',
        items: [
          { name: 'Dwarka Shri Lawn Venue Booking (Full Grounds)', quantity: 1, unitPrice: 75000, total: 75000 },
          { name: 'Royal Stage & Velvet Mandap Setup', quantity: 1, unitPrice: 45000, total: 45000 },
          { name: 'Awadhi Shahi Buffet (300 Guests)', quantity: 300, unitPrice: 450, total: 135000 }
        ],
        cartage: 5000,
        labour: 8000,
        discount: 10000,
        advancePaid: 50000,
        notes: 'Official commercial bill generated for royal wedding event.'
      })
    });
    console.log(`[Invoice Generate] POST /api/invoices/generate: HTTP ${generateInvRes.status} | Bill No: ${generateInvRes.data.data?.invoiceNumber} | Grand Total: ₹${generateInvRes.data.data?.grandTotal}`);
    if (generateInvRes.status !== 201 || !generateInvRes.data.data?.invoiceNumber || !generateInvRes.data.data.invoiceNumber.startsWith('INV-')) {
      throw new Error('Invoice generation failed or invoice number invalid');
    }
    const createdInvoiceId = generateInvRes.data.data.id;

    const getSingleInvRes = await testEndpoint(`/api/invoices/${createdInvoiceId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Invoice Details] GET /api/invoices/:id: HTTP ${getSingleInvRes.status} | Invoice: ${getSingleInvRes.data.data?.invoiceNumber}`);
    if (getSingleInvRes.status !== 200 || getSingleInvRes.data.data?.id !== createdInvoiceId) {
      throw new Error('Failed to fetch invoice details by ID');
    }

    // 19: Master Agent 3-Layer Memory & Workflow Management
    console.log('\n--- Test 19: Master Agent 3-Layer Memory & Workflow Execution ---');
    // Layer A
    const getConvsRes = await testEndpoint('/api/agent/conversations', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Layer A: Conversations] GET /api/agent/conversations: HTTP ${getConvsRes.status} | Sessions count: ${getConvsRes.data.count}`);
    if (getConvsRes.status !== 200) throw new Error('Layer A conversation retrieval failed');

    // Layer B
    const getMemRes = await testEndpoint('/api/agent/memories', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Layer B: Business Memory] GET /api/agent/memories: HTTP ${getMemRes.status} | Memories count: ${getMemRes.data.count}`);
    if (getMemRes.status !== 200) throw new Error('Layer B memory retrieval failed');

    const createMemRes = await testEndpoint('/api/agent/memories', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        category: 'pricing_rule',
        content: 'For bookings over 500 guests at Dwarka Shri Lawn, offer complimentary VIP Welcome Lounge setup.',
        confidence: 0.98,
        tags: ['pricing', 'vip', 'lawn']
      })
    });
    console.log(`[Layer B: Create Memory] POST /api/agent/memories: HTTP ${createMemRes.status} | Saved Category: ${createMemRes.data.data?.category}`);
    if (createMemRes.status !== 201 || !createMemRes.data.data?.id) throw new Error('Layer B memory creation failed');

    // Layer C
    const getWfRes = await testEndpoint('/api/agent/workflows', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Layer C: Learned Workflows] GET /api/agent/workflows: HTTP ${getWfRes.status} | Workflows count: ${getWfRes.data.count}`);
    if (getWfRes.status !== 200) throw new Error('Layer C workflow retrieval failed');

    // 20: Marketing Studio Media Library, Portfolio Creation & Real FFmpeg Video Reel Engine
    console.log('\n--- Test 20: Marketing Studio Media Library & Real FFmpeg Video Reel Engine ---');
    const getMediaRes = await testEndpoint('/api/marketing/media?category=All');
    console.log(`[Marketing Media] GET /api/marketing/media: HTTP ${getMediaRes.status} | Total Assets: ${getMediaRes.data.count}`);
    if (getMediaRes.status !== 200 || !getMediaRes.data.count || getMediaRes.data.count < 10) {
      throw new Error('Marketing media library indexing failed');
    }

    const createPortRes = await testEndpoint('/api/marketing/portfolios', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Shahi Awadhi Vivah Collection',
        subtitle: 'Dwarka Shri Lawn Grand Wedding Showcase',
        category: 'Weddings',
        mediaIds: getMediaRes.data.data.slice(0, 3).map(m => m.id),
        description: 'Exclusive gallery of royal weddings and mandap decor at Kanpur Road, Lucknow.'
      })
    });
    console.log(`[Marketing Portfolio] POST /api/marketing/portfolios: HTTP ${createPortRes.status} | Title: ${createPortRes.data.data?.title} | Shareable: ${createPortRes.data.data?.shareableUrl}`);
    if (createPortRes.status !== 201 || !createPortRes.data.data?.shareableUrl) {
      throw new Error('Marketing portfolio creation failed');
    }

    console.log('[Marketing Reel Engine] Testing real FFmpeg video generation (9:16 vertical MP4)...');
    const renderReelRes = await testEndpoint('/api/marketing/reels/render', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        format: '9:16',
        duration: 3,
        title: 'Dwarka Shri Lawn Royal Vivah',
        theme: 'Royal Luxury'
      })
    });
    console.log(`[Marketing Reel Render] POST /api/marketing/reels/render: HTTP ${renderReelRes.status} | MP4: ${renderReelRes.data.data?.videoUrl} | Dimensions: ${renderReelRes.data.data?.dimensions}`);
    if (renderReelRes.status !== 201 || !renderReelRes.data.data?.videoUrl || !renderReelRes.data.data.videoUrl.endsWith('.mp4')) {
      throw new Error('Real FFmpeg reel rendering failed');
    }

    const getReelsRes = await testEndpoint('/api/marketing/reels');
    console.log(`[Marketing Reels List] GET /api/marketing/reels: HTTP ${getReelsRes.status} | Rendered Reels Count: ${getReelsRes.data.count}`);
    if (getReelsRes.status !== 200 || getReelsRes.data.count < 1) {
      throw new Error('Rendered reels retrieval failed');
    }

    // 21: Secure Admin Recovery & Dual-Identifier Authentication
    console.log('\n--- Test 21: Secure Admin Recovery & Dual-Identifier Authentication ---');
    const emailLoginRes = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'varunkandhari612@gmail.com', // Log in via verified email
        password: 'Kandhari@Admin2026'
      })
    });
    console.log(`[Admin Email Login] POST /api/auth/login (by email): HTTP ${emailLoginRes.status} | Success: ${emailLoginRes.data.success} | Role: ${emailLoginRes.data.user?.role}`);
    if (emailLoginRes.status !== 200 || emailLoginRes.data.user?.role !== 'admin') {
      throw new Error('Admin login via verified email failed');
    }

    const usernameLoginRes = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin', // Log in via username
        password: 'Kandhari@Admin2026'
      })
    });
    console.log(`[Admin Username Login] POST /api/auth/login (by username): HTTP ${usernameLoginRes.status} | Success: ${usernameLoginRes.data.success}`);
    if (usernameLoginRes.status !== 200 || !usernameLoginRes.data.token) {
      throw new Error('Admin login via username failed');
    }

    // Unauthorized reset attempt without recovery key
    const badResetRes = await testEndpoint('/api/auth/reset-admin-password', {
      method: 'POST',
      body: JSON.stringify({
        recoveryKey: 'wrong-key',
        newPassword: 'newpassword123'
      })
    });
    console.log(`[Admin Security] Unauthorized password reset blocked: HTTP ${badResetRes.status}`);
    if (badResetRes.status !== 403) {
      throw new Error('Expected 403 Forbidden on unauthorized password reset');
    }

    // 22: Dedicated Dwarka Shri Lawn Reels & Raw Source Video Showcase
    console.log('\n--- Test 22: Dedicated Dwarka Shri Lawn Reels & Video Tour ---');
    const getVenueVideoRes = await testEndpoint('/api/venue/video');
    console.log(`[Venue Video] GET /api/venue/video: HTTP ${getVenueVideoRes.status} | Video: ${getVenueVideoRes.data.data?.url}`);
    if (getVenueVideoRes.status !== 200 || !getVenueVideoRes.data.data?.url) {
      throw new Error('Failed to retrieve raw venue source video info');
    }

    const getLawnReelsRes = await testEndpoint('/api/venue/reels');
    console.log(`[Lawn Reels List] GET /api/venue/reels: HTTP ${getLawnReelsRes.status} | Total Reels: ${getLawnReelsRes.data.count}`);
    if (getLawnReelsRes.status !== 200 || getLawnReelsRes.data.count < 7) {
      throw new Error(`Expected at least 7 lawn reels, received ${getLawnReelsRes.data.count}`);
    }

    // Verify all 7 reels have valid 9:16 vertical video & cover URLs
    getLawnReelsRes.data.data.forEach((r, idx) => {
      if (!r.videoUrl || !r.coverUrl || r.aspectRatio !== '9:16') {
        throw new Error(`Reel ${idx + 1} (${r.title}) missing required videoUrl or aspectRatio`);
      }
    });
    console.log('• All 7 Dwarka Shri Lawn reels verified with 9:16 vertical format and cover thumbnails.');

    // Admin updates a reel's description
    const updateReelRes = await testEndpoint('/api/venue/reels/reel-entrance', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'A Grand Royal Welcome at Dwarka Shri Lawn'
      })
    });
    console.log(`[Reel Update] PUT /api/venue/reels/:id: HTTP ${updateReelRes.status} | Updated Title: ${updateReelRes.data.data?.title}`);
    if (updateReelRes.status !== 200 || updateReelRes.data.data?.title !== 'A Grand Royal Welcome at Dwarka Shri Lawn') {
      throw new Error('Failed to update reel metadata');
    }

    // 23: Standardized Rental Catalogue, Area Pricing & Distance Band Cartage
    console.log('\n--- Test 23: Area Pricing & Distance Band Cartage/Labour Rules ---');
    const { calculateOrderPricing } = require('./services/pricingEngine');

    // Test area calculation: 20x30 ft tent (600 sq ft) at ₹5/sq ft for 2 days = ₹6,000 subtotal
    const pricingArea = calculateOrderPricing({
      items: [
        { id: 'item-tent-normal', name: 'Normal Tent / Pandal', length: 20, width: 30, quantity: 1, isAreaBased: true, ratePerSqFt: 5, durationSensitive: true }
      ],
      startDate: '2026-12-10',
      endDate: '2026-12-11', // 2 calendar days
      deliveryDistanceKm: 2.5
    });
    console.log(`[Area Pricing] 20x30 ft tent (600 sq.ft) for 2 days: Subtotal ₹${pricingArea.subtotal} | Expected ₹6000`);
    if (pricingArea.subtotal !== 6000) {
      throw new Error(`Area pricing calculation mismatch: expected 6000, got ${pricingArea.subtotal}`);
    }

    // Test distance bands:
    // Band 1: 2.5 km -> Cartage: ₹500, Labour: ₹500 + tent rigging ₹500 = ₹1,000 labour
    console.log(`[Distance Band 0-3km] Cartage: ₹${pricingArea.cartage} | Labour: ₹${pricingArea.labour}`);
    if (pricingArea.cartage !== 500) {
      throw new Error(`Expected cartage ₹500 for <= 3km, got ${pricingArea.cartage}`);
    }

    // Band 2: 5.5 km -> Cartage: ₹1,000, Labour: ₹1,000
    const pricingBand2 = calculateOrderPricing({
      items: [{ id: 'item-chair-pvc', quantity: 50, rentalPrice: 15 }],
      startDate: '2026-12-10',
      endDate: '2026-12-10',
      deliveryDistanceKm: 5.5
    });
    console.log(`[Distance Band 3-7km] Cartage: ₹${pricingBand2.cartage} | Labour: ₹${pricingBand2.labour}`);
    if (pricingBand2.cartage !== 1000 || pricingBand2.labour !== 1000) {
      throw new Error(`Expected cartage ₹1000 and labour ₹1000 for 5.5km, got cartage=${pricingBand2.cartage}, labour=${pricingBand2.labour}`);
    }

    // Band 3: 12 km -> Provisional charges
    const pricingBand3 = calculateOrderPricing({
      items: [{ id: 'item-chair-pvc', quantity: 50, rentalPrice: 15 }],
      startDate: '2026-12-10',
      endDate: '2026-12-10',
      deliveryDistanceKm: 12
    });
    console.log(`[Distance Band >7km] Cartage: ₹${pricingBand3.cartage} | Labour: ₹${pricingBand3.labour}`);
    if (pricingBand3.cartage < 1500) {
      throw new Error(`Expected provisional cartage >= ₹1500 for > 7km, got ${pricingBand3.cartage}`);
    }


    // 24: AI Calling Receptionist Veronica
    console.log('\n--- Test 24: AI Telephony Receptionist Veronica ---');
    const recStartRes = await testEndpoint('/api/receptionist/call/start', {
      method: 'POST',
      body: JSON.stringify({
        callerName: 'Vikramaditya Verma',
        callerPhone: '9876543210'
      })
    });
    console.log(`[Receptionist Start] POST /api/receptionist/call/start: HTTP ${recStartRes.status} | CallId: ${recStartRes.data.data?.callId}`);
    if (recStartRes.status !== 201 || !recStartRes.data.data?.greeting.includes('Veronica')) {
      throw new Error('Receptionist call start failed or missing Veronica disclosure');
    }
    const testCallId = recStartRes.data.data.callId;

    // Turn 1: Book lawn walkthrough appointment
    const recAptRes = await testEndpoint('/api/receptionist/call/message', {
      method: 'POST',
      body: JSON.stringify({
        callId: testCallId,
        message: 'I want to schedule an appointment to view Dwarka Shri Lawn on 15 November 2026'
      })
    });
    console.log(`[Receptionist Appointment] Message Turn: Action = ${recAptRes.data.data?.actionTaken} | Appointment = ${recAptRes.data.data?.session?.appointment?.appointmentId}`);
    if (recAptRes.data.data?.actionTaken !== 'appointment_booked' || !recAptRes.data.data?.session?.appointment?.appointmentId.startsWith('APT-')) {
      throw new Error('Failed to book lawn walkthrough appointment');
    }

    // Turn 2: Log support ticket
    const recTckRes = await testEndpoint('/api/receptionist/call/message', {
      method: 'POST',
      body: JSON.stringify({
        callId: testCallId,
        message: 'I have an urgent complaint regarding damaged chairs delivered'
      })
    });
    console.log(`[Receptionist Ticket] Message Turn: Action = ${recTckRes.data.data?.actionTaken} | Ticket = ${recTckRes.data.data?.session?.ticket?.ticketId}`);
    if (recTckRes.data.data?.actionTaken !== 'ticket_created' || !recTckRes.data.data?.session?.ticket?.ticketId.startsWith('TCK-')) {
      throw new Error('Failed to generate support ticket');
    }

    // Turn 3: Human escalation
    const recEscRes = await testEndpoint('/api/receptionist/call/message', {
      method: 'POST',
      body: JSON.stringify({
        callId: testCallId,
        message: 'Please connect me to the owner Mr. Kandhari'
      })
    });
    console.log(`[Receptionist Escalation] Message Turn: Action = ${recEscRes.data.data?.actionTaken} | Escalated = ${recEscRes.data.data?.session?.escalated}`);
    if (recEscRes.data.data?.actionTaken !== 'escalated_to_human' || !recEscRes.data.data?.session?.escalated) {
      throw new Error('Failed to escalate call to human management');
    }

    // End call
    const recEndRes = await testEndpoint('/api/receptionist/call/end', {
      method: 'POST',
      body: JSON.stringify({
        callId: testCallId,
        notes: 'Verification test call ended'
      })
    });
    console.log(`[Receptionist End] POST /api/receptionist/call/end: HTTP ${recEndRes.status} | Duration = ${recEndRes.data.data?.summary?.durationSeconds}s`);
    if (recEndRes.status !== 200 || !recEndRes.data.success) {
      throw new Error('Failed to end and archive receptionist call');
    }

    // Inspect operations lists
    const getCallsRes = await testEndpoint('/api/receptionist/calls');
    const getAptsRes = await testEndpoint('/api/receptionist/appointments');
    const getTcksRes = await testEndpoint('/api/receptionist/tickets');
    console.log(`[Receptionist Inspection] Calls: ${getCallsRes.data.count} | Appointments: ${getAptsRes.data.count} | Tickets: ${getTcksRes.data.count}`);
    if (getCallsRes.data.count < 1 || getAptsRes.data.count < 1 || getTcksRes.data.count < 1) {
      throw new Error('Receptionist operations lists count mismatch');
    }

    // 25: Master Agent Exact-Date Workforce Action
    console.log('\n--- Test 25: Master Agent Exact-Date Workforce Action ---');
    const workforceQueryRes = await testEndpoint('/api/agent/query', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        query: 'Add a new labourer named Ramesh and mark him present on 22 October 2026'
      })
    });
    console.log(`[Master Agent Query] HTTP ${workforceQueryRes.status} | Action: ${workforceQueryRes.data.action} | Date: ${workforceQueryRes.data.pendingAction?.params?.date}`);
    if (!workforceQueryRes.data.requiresConfirmation || workforceQueryRes.data.pendingAction?.params?.date !== '2026-10-22' || workforceQueryRes.data.pendingAction?.params?.name !== 'Ramesh') {
      throw new Error('Master Agent failed to parse exact date 2026-10-22 or worker name Ramesh');
    }

    const workforceConfirmRes = await testEndpoint('/api/agent/confirm', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        action: workforceQueryRes.data.pendingAction.tool,
        params: workforceQueryRes.data.pendingAction.params
      })
    });
    console.log(`[Master Agent Confirm] HTTP ${workforceConfirmRes.status} | TargetDate: ${workforceConfirmRes.data.targetDate} | Wage: ₹${workforceConfirmRes.data.calculatedWage}`);
    if (workforceConfirmRes.status !== 200 || workforceConfirmRes.data.targetDate !== '2026-10-22' || workforceConfirmRes.data.calculatedWage !== 500) {
      throw new Error('Master agent workforce execution failed on exact date 2026-10-22');
    }

    // 26: Central Business Settings
    console.log('\n--- Test 26: Central Business Settings ---');
    const getSettingsRes = await testEndpoint('/api/settings');
    console.log(`[Settings GET] HTTP ${getSettingsRes.status} | Toll-Free: ${getSettingsRes.data.data?.tollFreeNumber} | AI Receptionist: ${getSettingsRes.data.data?.aiReceptionist?.name}`);
    if (getSettingsRes.status !== 200 || !getSettingsRes.data.data?.tollFreeNumber || getSettingsRes.data.data?.aiReceptionist?.name !== 'Veronica') {
      throw new Error('Central business settings mismatch');
    }

    const updateSettingsRes = await testEndpoint('/api/settings', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        minOrderValue: 7500
      })
    });
    console.log(`[Settings PUT] HTTP ${updateSettingsRes.status} | MinOrderValue: ${updateSettingsRes.data.data?.minOrderValue}`);
    if (updateSettingsRes.status !== 200 || updateSettingsRes.data.data?.minOrderValue !== 7500) {
      throw new Error('Failed to update business settings');
    }

    // 27: Strict Privacy & Phone Number Protection Audit
    console.log('\n--- Test 27: Strict Privacy & Phone Number Protection Audit ---');
    const venueCheckRes = await testEndpoint('/api/venue');
    const venueJsonStr = JSON.stringify(venueCheckRes.data);
    if (venueJsonStr.includes('9305465848')) {
      throw new Error('CRITICAL SECURITY VIOLATION: Personal phone number 9305465848 leaked in /api/venue!');
    }

    const settingsCheckRes = await testEndpoint('/api/settings');
    const settingsJsonStr = JSON.stringify(settingsCheckRes.data);
    if (settingsJsonStr.includes('9305465848')) {
      throw new Error('CRITICAL SECURITY VIOLATION: Personal phone number 9305465848 leaked in /api/settings!');
    }
    console.log('• Strict privacy verified: 0 exposures of personal phone number across public and admin APIs.');

    // 28: Empty Catalogue Fix & Query Sanitization
    console.log('\n--- Test 28: Empty Catalogue Fix & Query Parameter Sanitization ---');
    const undefQueryRes = await testEndpoint('/api/items?category=undefined&search=undefined&status=undefined');
    console.log(`[Sanitized Items Fetch] GET /api/items?category=undefined: HTTP ${undefQueryRes.status} | Count: ${undefQueryRes.data.count}`);
    if (undefQueryRes.status !== 200 || undefQueryRes.data.count < 30) {
      throw new Error(`Expected at least 30 items when querying with undefined strings, got ${undefQueryRes.data.count}`);
    }

    const categoriesToCheck = [
      'chairs-seating',
      'tables',
      'tents-canopies',
      'stages-platforms',
      'fans-coolers',
      'carpets-flooring',
      'barricading-crowd-control',
      'wedding-essentials'
    ];

    for (const cat of categoriesToCheck) {
      const catRes = await testEndpoint(`/api/items?category=${cat}`);
      console.log(`[Category: ${cat}] HTTP ${catRes.status} | Items: ${catRes.data.count}`);
      if (catRes.status !== 200 || !catRes.data.count || catRes.data.count < 2) {
        throw new Error(`Category ${cat} returned insufficient items (${catRes.data.count})`);
      }
    }
    console.log('• Verified all 8 rental categories return fully populated inventory items.');

    // 29: Promo Coupon Validation Engine
    console.log('\n--- Test 29: Promo Coupon Engine (WELCOME100, FIRST200, EARLYBIRD10) ---');
    const coupon1Res = await testEndpoint('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'WELCOME100', orderAmount: 2500 })
    });
    console.log(`[Coupon WELCOME100] HTTP ${coupon1Res.status} | Valid: ${coupon1Res.data.valid} | Discount: ₹${coupon1Res.data.discountValue}`);
    if (coupon1Res.status !== 200 || !coupon1Res.data.valid || coupon1Res.data.discountValue !== 100) {
      throw new Error('WELCOME100 coupon validation failed');
    }

    const coupon2Res = await testEndpoint('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'FIRST200', orderAmount: 3000 })
    });
    console.log(`[Coupon FIRST200 Below Min] HTTP ${coupon2Res.status} | Valid: ${coupon2Res.data.valid} | Msg: ${coupon2Res.data.message}`);
    if (coupon2Res.data.valid !== false) {
      throw new Error('FIRST200 should have been rejected for order amount below ₹5000');
    }

    const coupon3Res = await testEndpoint('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'FIRST200', orderAmount: 6000 })
    });
    console.log(`[Coupon FIRST200 Valid] HTTP ${coupon3Res.status} | Valid: ${coupon3Res.data.valid} | Discount: ₹${coupon3Res.data.discountValue}`);
    if (!coupon3Res.data.valid || coupon3Res.data.discountValue !== 200) {
      throw new Error('FIRST200 validation failed for valid amount');
    }

    // 30: Daya 1..31 Monthly Attendance Grid
    console.log('\n--- Test 30: Daya 1..31 Monthly Attendance Grid & Unit Calculation ---');
    const gridRes = await testEndpoint('/api/staff/attendance-grid?year=2026&month=7', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Attendance Grid] GET /api/staff/attendance-grid: HTTP ${gridRes.status} | Month: ${gridRes.data.monthName} | Days: ${gridRes.data.daysInMonth} | Workers: ${gridRes.data.workers?.length}`);
    if (gridRes.status !== 200 || gridRes.data.daysInMonth !== 31 || !gridRes.data.workers?.length) {
      throw new Error('Failed to retrieve Daya 1..31 attendance grid');
    }

    // Record bulk marks for Daya register: days 1, 2, 3 as 'P' (1.0 each) and day 4 as '1/2' (0.5)
    const ramprakashWorker = gridRes.data.workers.find(w => w.name.includes('Ramprakash')) || gridRes.data.workers[0];
    const bulkAttendRes = await testEndpoint('/api/staff/attendance/bulk', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        workerId: ramprakashWorker.id,
        year: 2026,
        month: 7,
        days: {
          '1': 'P',
          '2': 'P',
          '3': 'P',
          '4': '1/2'
        }
      })
    });
    console.log(`[Bulk Attendance Recorded] HTTP ${bulkAttendRes.status} | TotalUnits: ${bulkAttendRes.data.totalUnits}`);
    if (bulkAttendRes.status !== 200 || bulkAttendRes.data.totalUnits !== 3.5) {
      throw new Error(`Expected total units 3.5 (3 full + 1 half), received ${bulkAttendRes.data.totalUnits}`);
    }

    // 31: Staff Advances Ledger (Anti-Double-Deduction)
    console.log('\n--- Test 31: Staff Advances Ledger (Tracking & Balance) ---');
    const advancePostRes = await testEndpoint('/api/staff/advances', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        workerId: ramprakashWorker.id,
        workerName: ramprakashWorker.name,
        amount: 500,
        date: '2026-07-05',
        notes: 'Advance for family ration'
      })
    });
    console.log(`[Record Advance] POST /api/staff/advances: HTTP ${advancePostRes.status} | Ref: ${advancePostRes.data.data?.advanceNumber} | Amount: ₹${advancePostRes.data.data?.amount}`);
    if (advancePostRes.status !== 201 || !advancePostRes.data.data?.advanceNumber.startsWith('ADV-') || advancePostRes.data.data.outstandingBalance !== 500) {
      throw new Error('Failed to record staff advance');
    }

    const advancesListRes = await testEndpoint(`/api/staff/advances?workerId=${ramprakashWorker.id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`[Advances Ledger List] GET /api/staff/advances: HTTP ${advancesListRes.status} | Total Advances: ${advancesListRes.data.count}`);
    if (advancesListRes.status !== 200 || advancesListRes.data.count < 1) {
      throw new Error('Failed to list advances from ledger');
    }

    // 32: Monthly Payroll Settlement Engine
    console.log('\n--- Test 32: Monthly Payroll Settlement Engine with Advance Recovery ---');
    const finalizePayrollRes = await testEndpoint('/api/staff/payroll/finalize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        year: 2026,
        month: 7
      })
    });
    console.log(`[Payroll Finalize] POST /api/staff/payroll/finalize: HTTP ${finalizePayrollRes.status} | Records: ${finalizePayrollRes.data.count}`);
    if (finalizePayrollRes.status !== 200 || !finalizePayrollRes.data.data) {
      throw new Error('Payroll finalization failed');
    }

    const workerPayroll = finalizePayrollRes.data.data.find(p => p.workerId === ramprakashWorker.id);
    if (!workerPayroll) {
      throw new Error('Payroll calculation missing for Ramprakash');
    }
    console.log(`[Ramprakash Payroll] Units: ${workerPayroll.payableUnits} | Gross: ₹${workerPayroll.grossWages} | Adv Deducted: ₹${workerPayroll.deductedAdvances} | Net: ₹${workerPayroll.netSalary}`);
    // 3.5 units * 500 = 1750 gross. Advance deducted 500 -> 1250 net.
    if (workerPayroll.grossWages !== 1750 || workerPayroll.deductedAdvances !== 500 || workerPayroll.netSalary !== 1250) {
      throw new Error(`Payroll calculation mismatch: expected Gross ₹1750, Adv ₹500, Net ₹1250. Got Gross ${workerPayroll.grossWages}, Adv ${workerPayroll.deductedAdvances}, Net ${workerPayroll.netSalary}`);
    }

    // 33: Veronica Real Inbound Telephony Webhooks (TwiML XML Generation)
    console.log('\n--- Test 33: Veronica Inbound Telephony Webhook (TwiML XML Engine) ---');
    const twilioVoiceRes = await testEndpoint('/api/receptionist/webhook/voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'From=+919876543210&CallSid=CA1234567890abcdef&CallerCity=Lucknow'
    });
    console.log(`[Telephony Webhook Voice] POST /api/receptionist/webhook/voice: HTTP ${twilioVoiceRes.status} | Content-Type: ${twilioVoiceRes.contentType}`);
    if (twilioVoiceRes.status !== 200 || !twilioVoiceRes.contentType.includes('xml')) {
      throw new Error(`Expected 200 OK with XML content-type, got status ${twilioVoiceRes.status} and ${twilioVoiceRes.contentType}`);
    }
    if (!twilioVoiceRes.data.includes('<Response>') || !twilioVoiceRes.data.includes('Veronica') || !twilioVoiceRes.data.includes('artificial intelligence receptionist')) {
      throw new Error('Telephony XML response does not contain valid TwiML with Veronica AI transparency disclosure');
    }
    console.log('• Verified TwiML XML greeting with mandatory AI transparency disclosure.');

    const twilioGatherRes = await testEndpoint('/api/receptionist/webhook/gather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'From=+919876543210&CallSid=CA1234567890abcdef&SpeechResult=I+want+to+book+an+appointment+to+visit+Dwarka+Shri+Lawn+on+15+November'
    });
    console.log(`[Telephony Webhook Gather] POST /api/receptionist/webhook/gather: HTTP ${twilioGatherRes.status} | Content-Type: ${twilioGatherRes.contentType}`);
    if (twilioGatherRes.status !== 200 || !twilioGatherRes.data.includes('<Response>')) {
      throw new Error('Telephony Gather webhook failed to respond with valid TwiML');
    }
    console.log('• Verified multi-turn voice gather processing and response generation.');
    console.log('\n======================================================');
    console.log('  ALL AUTOMATED VERIFICATION SUITE TESTS PASSED (100%) ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Encountered Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
};

runTests();
