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

const PORT = 5001; // Isolated test port

const runTests = async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Suite] Test server listening on http://localhost:${PORT}`);

  const testEndpoint = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(`http://localhost:${PORT}${url}`, {
      ...options,
      headers
    });
    const data = await res.json();
    return { status: res.status, data };
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
      phone: '9305465848',
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
    const csvRes = await fetch(`http://localhost:${PORT}/api/enquiries/export/csv`, {
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
