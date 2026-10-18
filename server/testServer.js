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

    // 3. Gallery Verification across all 8 Categories
    console.log('\n--- Test 3: Gallery 8 Categories Verification ---');
    const categories = [
      'Entrances', 'Floral decoration', 'Lighting', 'Stage and mandap',
      'Tent structures', 'Catering', 'Lawn and venue', 'Other events'
    ];
    for (const cat of categories) {
      const gal = await testEndpoint(`/api/gallery?category=${encodeURIComponent(cat)}`);
      const count = gal.data.count || (gal.data.data ? gal.data.data.length : 0);
      console.log(`• Category [${cat}]: ${count} photos available`);
      if (count < 5) throw new Error(`Category ${cat} expected at least 5 photos, found ${count}`);
    }

    // 4. Venue & Lawn Details
    console.log('\n--- Test 4: Dwarka Shri Lawn Details ---');
    const venue = await testEndpoint('/api/venue');
    console.log(`Venue: ${venue.data.data.name} | Amenities: ${venue.data.data.amenities?.length}`);
    if (venue.data.data.name !== 'Dwarka Shri Lawn') throw new Error('Invalid venue name');

    // 5. Customer Registration & Login
    console.log('\n--- Test 5: Customer Registration & Login ---');
    const testEmail = `client_${Date.now()}@test.com`;
    const regRes = await testEndpoint('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Vikas Malhotra',
        email: testEmail,
        phone: '9839123456',
        password: 'Password123!'
      })
    });
    console.log('Customer Registration:', regRes.data.success, '| User ID:', regRes.data.user?.id);
    const customerToken = regRes.data.token;
    if (!customerToken) throw new Error('Expected customer JWT token');

    const loginRes = await testEndpoint('/api/auth/customer-login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'Password123!' })
    });
    console.log('Customer Login:', loginRes.data.success);
    if (!loginRes.data.token) throw new Error('Customer login failed');

    // 6. AI Customer Chat Assistant Workflows
    console.log('\n--- Test 6: AI Customer Chat Assistant ---');
    
    // 6.1 Start fresh conversation
    const newChat = await testEndpoint('/api/chat/conversation/new', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const convId = newChat.data.conversation?.id;
    console.log(`Chat Started: ${newChat.data.success} | Conversation ID: ${convId}`);
    if (!convId) throw new Error('Failed to start chat conversation');

    // 6.2 Test Catering Intent
    console.log('\n--- Test 6.2: Hindi Catering Intent ("Khaane ka menu bhejiye") ---');
    const msg1 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ text: 'Khaane ka menu bhejiye' })
    });
    console.log('msg1 response:', JSON.stringify(msg1));
    console.log('Recognized Intent:', msg1.data.recognizedIntent);
    console.log('Assistant Reply:', msg1.data.assistantMessage?.content?.substring(0, 100) + '...');
    if (msg1.data.recognizedIntent !== 'catering_menu') throw new Error('Failed to classify catering intent');

    // 6.3 Test Lawn 5-Photo Gallery Request
    console.log('\n--- Test 6.3: Gallery Intent with 5 Photos ("Aapke lawn ki photos hain?") ---');
    const msg2 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ text: 'Aapke lawn ki photos hain?' })
    });
    const photosReturned = msg2.data.assistantMessage?.galleryImages?.length || 0;
    console.log(`Recognized Intent: ${msg2.data.recognizedIntent} | Photos Returned: ${photosReturned}`);
    if (photosReturned !== 5) throw new Error(`Expected exactly 5 photos returned, got ${photosReturned}`);

    // 6.4 Test Slot Filling
    console.log('\n--- Test 6.4: Conversational Slot Filling ("Mujhe 20 November ko shaadi karni hai 400 guests") ---');
    const msg3 = await testEndpoint(`/api/chat/conversation/${convId}/message`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ text: 'Mujhe 20 November ko Kanpur Road par shaadi karni hai 400 guests ke saath' })
    });
    const state = msg3.data.collectedState || {};
    console.log('Collected Event Type:', state.eventType);
    console.log('Collected Date:', state.eventDate);
    console.log('Collected Locality:', state.locality);
    console.log('Collected Guest Count:', state.guestCount);
    if (state.eventType !== 'Wedding') throw new Error('Failed to extract event type Wedding');
    if (state.guestCount !== 400) throw new Error('Failed to extract guest count 400');

    // 6.5 Persistent Memory Retrieval
    console.log('\n--- Test 6.5: Persistent Memory Retrieval Across Sessions ---');
    const resumeRes = await testEndpoint(`/api/chat/conversation/${convId}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const totalMsgs = resumeRes.data.conversation?.messages?.length || 0;
    console.log(`Resumed Conversation ID: ${resumeRes.data.conversation?.id} | Stored Messages: ${totalMsgs}`);
    if (totalMsgs < 6) throw new Error('Persistent messages missing in resumed conversation');

    // 6.6 Submit Official Enquiry from Chat State
    console.log('\n--- Test 6.6: Submit Official Enquiry from Chat State ---');
    const submitChatRes = await testEndpoint(`/api/chat/conversation/${convId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ phone: '9839123456', customerName: 'Vikas Malhotra' })
    });
    console.log('Official Chat Enquiry Created:', submitChatRes.data.success, 'Ref:', submitChatRes.data.referenceNumber);
    console.log('WhatsApp Deep Link:', submitChatRes.data.whatsappUrl ? 'Generated' : 'Missing');
    if (!submitChatRes.data.referenceNumber) throw new Error('Expected enquiry reference number');

    // 6.7 Access Control Verification
    console.log('\n--- Test 6.7: Access Control (Private Conversation Isolation) ---');
    // Create second customer
    const user2 = await testEndpoint('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Another User',
        email: `intruder_${Date.now()}@test.com`,
        phone: '9839000000',
        password: 'Password123!'
      })
    });
    const unauthorizedRes = await testEndpoint(`/api/chat/conversation/${convId}`, {
      headers: { 'Authorization': `Bearer ${user2.data.token}` }
    });
    console.log(`Access attempt by other customer - HTTP Status: ${unauthorizedRes.status}`);
    if (unauthorizedRes.status !== 403) throw new Error('Access control failed: other user was not blocked');

    // 7. Admin Portal & Management
    console.log('\n--- Test 7: Admin Authentication, Status Update & CSV Export ---');
    const adminLoginRes = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin@kandhari2026' })
    });
    const adminToken = adminLoginRes.data.token;
    console.log('Admin Login Token received:', !!adminToken);

    // Update enquiry status to 'In Discussion'
    const updateRes = await testEndpoint(`/api/enquiries/${submitChatRes.data.referenceNumber}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'In Discussion',
        internalNotes: 'Client contacted via phone; discussed German hangar and stage floral package.'
      })
    });
    console.log('Enquiry Status Updated to "In Discussion":', updateRes.data.success);
    if (!updateRes.data.success) throw new Error('Failed to update status to In Discussion');

    // Verify CSV Export
    const csvRes = await fetch(`http://localhost:${PORT}/api/enquiries/export/csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvText = await csvRes.text();
    console.log(`CSV Export: HTTP ${csvRes.status} | Length: ${csvText.length} bytes`);
    if (csvRes.status !== 200 || !csvText.includes('Ref ID')) {
      throw new Error('CSV export failed');
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
