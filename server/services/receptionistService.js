// server/services/receptionistService.js
// Conversational AI Receptionist Named Veronica
// Voice & Telephony Operations for Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow

const { getLocalDb, saveLocalStore } = require('../config/db');

// Ensure database collections for receptionist operations
const ensureReceptionistInit = (db) => {
  if (!db.receptionistCalls) db.receptionistCalls = [];
  if (!db.appointments) db.appointments = [];
  if (!db.supportTickets) db.supportTickets = [];
  if (!db.pendingCallbacks) db.pendingCallbacks = [];
};

const MANDATED_DISCLOSURE = "Namaste! I am Veronica, an AI event receptionist for Kandhari Tent & Caterers and Dwarka Shri Lawn, Lucknow. How may I assist you with your wedding or celebration today?";

// Active in-memory call sessions
const activeSessions = new Map();

function generateId(prefix) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

function parseDate(text) {
  if (!text) return new Date().toISOString().split('T')[0];
  const str = text.toLowerCase();
  if (str.includes('today') || str.includes('आज')) return new Date().toISOString().split('T')[0];
  
  const monthMap = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
    aug: '08', august: '08', sep: '09', september: '09', oct: '10', october: '10',
    nov: '11', november: '11', dec: '12', december: '12'
  };

  const dmyMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:,)?\s+(\d{4})/i);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const mStr = dmyMatch[2].toLowerCase();
    const month = monthMap[mStr] || monthMap[mStr.substring(0, 3)];
    if (month) return `${dmyMatch[3]}-${month}-${day}`;
  }

  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  return new Date().toISOString().split('T')[0];
}

/**
 * Start a new inbound call session
 */
function startCall({ callerPhone, callerName } = {}) {
  const db = getLocalDb();
  ensureReceptionistInit(db);

  const callId = generateId('CALL');
  const session = {
    callId,
    callerPhone: callerPhone || 'Anonymous Caller',
    callerName: callerName || 'Valued Guest',
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    intent: 'general_inquiry',
    eventDate: null,
    guestCount: null,
    notes: '',
    escalated: false,
    appointment: null,
    ticket: null,
    transcript: [
      {
        speaker: 'Veronica',
        text: MANDATED_DISCLOSURE,
        timestamp: new Date().toISOString()
      }
    ]
  };

  activeSessions.set(callId, session);
  return {
    callId,
    greeting: MANDATED_DISCLOSURE,
    session
  };
}

/**
 * Process a turn in the call
 */
async function processCallMessage(callId, userMessage) {
  const db = getLocalDb();
  ensureReceptionistInit(db);

  let session = activeSessions.get(callId);
  if (!session) {
    // Check if stored in DB
    session = (db.receptionistCalls || []).find(c => c.callId === callId);
    if (!session) {
      // Re-initialize session gracefully
      const created = startCall();
      session = created.session;
      callId = session.callId;
    }
  }

  const timestamp = new Date().toISOString();
  session.transcript.push({
    speaker: 'Caller',
    text: userMessage,
    timestamp
  });

  const textLower = userMessage.toLowerCase().trim();

  // Extract phone if spoken
  const phoneMatch = userMessage.match(/(?:\+91|0)?[6-9]\d{9}/);
  if (phoneMatch && (!session.callerPhone || session.callerPhone === 'Anonymous Caller')) {
    session.callerPhone = phoneMatch[0];
  }

  // Extract guest count
  const guestMatch = userMessage.match(/(\d{2,4})\s*(?:guests?|people|pax|मेहमान)/i);
  if (guestMatch) {
    session.guestCount = parseInt(guestMatch[1], 10);
  }

  // Extract date
  const parsedD = parseDate(userMessage);
  if (parsedD && parsedD !== new Date().toISOString().split('T')[0]) {
    session.eventDate = parsedD;
  }

  let replyText = '';
  let actionTaken = null;

  // 1. Human Escalation Intent
  if (textLower.includes('talk to owner') || textLower.includes('speak to manager') || textLower.includes('human') || textLower.includes('kandhari ji') || textLower.includes('मालिक') || textLower.includes('connect me')) {
    session.intent = 'human_escalation';
    session.escalated = true;
    session.status = 'escalated';
    actionTaken = 'escalated_to_human';
    
    replyText = "Certainly. Allow me to have Mr. Kandhari's coordination desk connect with you immediately. I have prioritized your callback in our urgent dispatch queue. You may also reach our toll-free helpline desk at 1800-890-3456 anytime.";

    // Record pending callback
    db.pendingCallbacks.unshift({
      id: generateId('CBK'),
      callId: session.callId,
      callerName: session.callerName,
      callerPhone: session.callerPhone,
      requestTime: timestamp,
      status: 'Pending',
      reason: 'Caller requested senior manager consultation'
    });
  }
  // 2. Appointment Booking Intent (Lawn Walkthrough / In-Person Visit)
  else if (textLower.includes('appointment') || textLower.includes('visit') || textLower.includes('walkthrough') || textLower.includes('see lawn') || textLower.includes('मुलाकात') || textLower.includes('देखना')) {
    session.intent = 'appointment';
    const appointmentId = generateId('APT');
    const aptDate = session.eventDate || parseDate(userMessage);
    const aptTime = textLower.includes('morning') ? '11:00 AM' : (textLower.includes('evening') ? '05:00 PM' : '03:00 PM');

    const appointment = {
      appointmentId,
      callId: session.callId,
      customerName: session.callerName,
      phone: session.callerPhone,
      date: aptDate,
      time: aptTime,
      venue: 'Dwarka Shri Lawn, Opp. Pillar No. 37, Kanpur Road, Lucknow',
      purpose: 'Lawn Walkthrough & Menu Tasting Consultation',
      status: 'Confirmed',
      createdAt: timestamp
    };

    db.appointments.unshift(appointment);
    session.appointment = appointment;
    actionTaken = 'appointment_booked';

    replyText = `Wonderful! I have scheduled an in-person lawn walkthrough for you at Dwarka Shri Lawn on ${aptDate} at ${aptTime}. Your appointment reference number is ${appointmentId}. Our manager will welcome you opposite Pillar No. 37, Kanpur Road.`;
  }
  // 3. Support & Complaint Ticket Intent
  else if (textLower.includes('complaint') || textLower.includes('issue') || textLower.includes('problem') || textLower.includes('refund') || textLower.includes('damage') || textLower.includes('शिकायत') || textLower.includes('दिक्कत')) {
    session.intent = 'support_ticket';
    const ticketId = generateId('TCK');
    const isUrgent = textLower.includes('urgent') || textLower.includes('emergency') || textLower.includes('refund') || textLower.includes('turant');

    const ticket = {
      ticketId,
      callId: session.callId,
      customerName: session.callerName,
      phone: session.callerPhone,
      issue: userMessage,
      category: textLower.includes('refund') ? 'Billing / Refund' : 'Service Quality',
      severity: isUrgent ? 'Urgent' : 'Normal',
      status: 'Open',
      assignedTo: 'Operations Desk',
      createdAt: timestamp
    };

    db.supportTickets.unshift(ticket);
    session.ticket = ticket;
    actionTaken = 'ticket_created';

    replyText = `I understand your concern and apologize for the inconvenience. I have officially generated support ticket ${ticketId} with ${ticket.severity} priority. Our operations supervisor has been notified and will contact you directly to resolve this.`;
  }
  // 4. Lawn Capacity & Specifications
  else if (textLower.includes('lawn') || textLower.includes('dwarka') || textLower.includes('capacity') || textLower.includes('location') || textLower.includes('address') || textLower.includes('parking')) {
    session.intent = 'lawn_booking';
    replyText = "Dwarka Shri Lawn is our signature outdoor venue on Kanpur Road opposite Pillar No. 37, Daroga Kheda, Lucknow. We comfortably host up to 1,200+ guests with dedicated paved parking for 200+ vehicles, all-weather German hangar banquet shade, 2 luxury AC bridal suites, and a silent 62.5 KVA generator backup. Would you like to schedule an appointment to view the lawn?";
  }
  // 5. Tent & Equipment Rental Pricing
  else if (textLower.includes('tent') || textLower.includes('chair') || textLower.includes('sofa') || textLower.includes('rate') || textLower.includes('price') || textLower.includes('cost') || textLower.includes('quote')) {
    session.intent = 'tent_rental';
    replyText = "We offer transparent rates: Standard Shamiana tents are ₹5 per square foot per day, all-weather German waterproof hangars are ₹30 per square foot, and banquet seating ranges from ₹15 for PVC chairs to ₹45 for velvet banquet chairs. We also provide full Awadhi wedding catering from ₹250 to ₹850 per person. May I know your event date and estimated guest count to customize a quotation?";
  }
  // 6. Contact / Phone Inquiries (Privacy Enforcement)
  else if (textLower.includes('phone') || textLower.includes('mobile') || textLower.includes('number') || textLower.includes('contact') || textLower.includes('whatsapp')) {
    replyText = "You can reach our official 24/7 helpline desk toll-free at 1800-890-3456. We also offer direct WhatsApp support and an online quotation builder at kandharitent.vercel.app. May I note your phone number so our senior team can send you the brochure?";
  }
  // Default Polite Turn
  else {
    replyText = "Thank you for sharing. Kandhari Tent & Caterers has been Lucknow's trusted celebration partner for over two decades. Whether you need lawn booking at Dwarka Shri Lawn, royal tents, or authentic Awadhi catering, I am here to help. What date is your upcoming celebration?";
  }

  session.transcript.push({
    speaker: 'Veronica',
    text: replyText,
    timestamp: new Date().toISOString()
  });

  saveLocalStore();

  return {
    callId,
    replyText,
    actionTaken,
    session
  };
}

/**
 * End a call session and persist to history
 */
function endCall(callId, notes = '') {
  const db = getLocalDb();
  ensureReceptionistInit(db);

  let session = activeSessions.get(callId);
  if (!session) {
    session = (db.receptionistCalls || []).find(c => c.callId === callId);
  }

  if (session) {
    session.endedAt = new Date().toISOString();
    if (session.status !== 'escalated') {
      session.status = 'completed';
    }
    session.notes = notes || session.notes || 'Call completed successfully via Veronica Receptionist';

    // Calculate duration in seconds
    const startMs = new Date(session.startedAt).getTime();
    const endMs = new Date(session.endedAt).getTime();
    session.durationSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));

    // Persist to database if not already there
    const existingIdx = db.receptionistCalls.findIndex(c => c.callId === callId);
    if (existingIdx >= 0) {
      db.receptionistCalls[existingIdx] = session;
    } else {
      db.receptionistCalls.unshift(session);
    }

    saveLocalStore();
    activeSessions.delete(callId);
  }

  return {
    success: true,
    callId,
    summary: session ? {
      durationSeconds: session.durationSeconds,
      intent: session.intent,
      status: session.status,
      appointment: session.appointment,
      ticket: session.ticket,
      turnsCount: session.transcript.length
    } : null
  };
}

function getCallsList() {
  const db = getLocalDb();
  ensureReceptionistInit(db);
  return db.receptionistCalls || [];
}

function getAppointmentsList() {
  const db = getLocalDb();
  ensureReceptionistInit(db);
  return db.appointments || [];
}

function getTicketsList() {
  const db = getLocalDb();
  ensureReceptionistInit(db);
  return db.supportTickets || [];
}

function getPendingCallbacksList() {
  const db = getLocalDb();
  ensureReceptionistInit(db);
  return db.pendingCallbacks || [];
}

module.exports = {
  MANDATED_DISCLOSURE,
  startCall,
  processCallMessage,
  endCall,
  getCallsList,
  getAppointmentsList,
  getTicketsList,
  getPendingCallbacksList
};
