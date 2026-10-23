// server/controllers/receptionistController.js
// Express API controller for Veronica AI Receptionist operations

const receptionistService = require('../services/receptionistService');

const startCall = (req, res) => {
  try {
    const { callerPhone, callerName } = req.body || {};
    const result = receptionistService.startCall({ callerPhone, callerName });
    return res.status(201).json({
      success: true,
      message: 'Call session initiated with Veronica',
      data: result
    });
  } catch (error) {
    console.error('receptionist startCall error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate receptionist call' });
  }
};

const sendCallMessage = async (req, res) => {
  try {
    const { callId, message } = req.body;
    if (!callId || !message) {
      return res.status(400).json({ success: false, message: 'callId and message are required' });
    }

    const result = await receptionistService.processCallMessage(callId, message);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('receptionist sendCallMessage error:', error);
    return res.status(500).json({ success: false, message: 'Error processing receptionist message' });
  }
};

const endCall = (req, res) => {
  try {
    const { callId, notes } = req.body;
    if (!callId) {
      return res.status(400).json({ success: false, message: 'callId is required' });
    }

    const result = receptionistService.endCall(callId, notes);
    return res.json({
      success: true,
      message: 'Call ended and logged to operations archive',
      data: result
    });
  } catch (error) {
    console.error('receptionist endCall error:', error);
    return res.status(500).json({ success: false, message: 'Error ending receptionist call' });
  }
};

const getCalls = (req, res) => {
  try {
    const calls = receptionistService.getCallsList();
    return res.json({
      success: true,
      count: calls.length,
      data: calls
    });
  } catch (error) {
    console.error('receptionist getCalls error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve call logs' });
  }
};

const getAppointments = (req, res) => {
  try {
    const appointments = receptionistService.getAppointmentsList();
    return res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('receptionist getAppointments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments' });
  }
};

const getTickets = (req, res) => {
  try {
    const tickets = receptionistService.getTicketsList();
    return res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('receptionist getTickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tickets' });
  }
};

const getCallbacks = (req, res) => {
  try {
    const callbacks = receptionistService.getPendingCallbacksList();
    return res.json({
      success: true,
      count: callbacks.length,
      data: callbacks
    });
  } catch (error) {
    console.error('receptionist getCallbacks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve pending callbacks' });
  }
};


/**
 * Inbound PSTN Telephony Webhook: Incoming Call
 * Generates initial TwiML / Telephony XML with mandatory AI transparency disclosure
 */
const handleIncomingVoiceWebhook = (req, res) => {
  try {
    const callerPhone = req.body.From || req.query.From || 'Anonymous PSTN Caller';
    const callSid = req.body.CallSid || req.query.CallSid || ('CALL-TEL-' + Date.now());

    const result = receptionistService.startCall({
      callerPhone,
      callerName: req.body.CallerName || 'Inbound Caller',
      callSid
    });

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" timeout="5" speechTimeout="auto" action="/api/receptionist/webhook/gather" method="POST" language="en-IN">
    <Say voice="Polly.Aditi" language="en-IN">Hello! Thank you for calling Kandhari Tent and Caterers and Dwarka Shri Lawn. I am Veronica, an artificial intelligence receptionist. How can I help you with your event today?</Say>
  </Gather>
  <Redirect>/api/receptionist/webhook/voice</Redirect>
</Response>`;

    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('telephony voice webhook error:', error);
    res.set('Content-Type', 'text/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">Thank you for calling Kandhari Tent and Caterers and Dwarka Shri Lawn. I am Veronica, an artificial intelligence receptionist. Please hold while we connect you.</Say>
  <Hangup/>
</Response>`);
  }
};

/**
 * Inbound PSTN Telephony Webhook: Speech Gather
 * Processes speech-to-text transcript and generates conversational TwiML response
 */
const handleVoiceGatherWebhook = async (req, res) => {
  try {
    const speechResult = req.body.SpeechResult || req.body.Digits || req.query.SpeechResult || '';
    const callerPhone = req.body.From || req.query.From || '';
    const callSid = req.body.CallSid || req.query.CallSid || '';

    // Find active session by callSid or callerPhone
    const activeCalls = receptionistService.getCallsList();
    let call = activeCalls.find(c => c.callSid === callSid || c.callerPhone === callerPhone);
    let callId = call ? call.callId : null;

    if (!callId) {
      const init = receptionistService.startCall({ callerPhone, callSid });
      callId = init.callId;
    }

    const result = await receptionistService.processCallMessage(callId, speechResult);
    const replyText = (result.reply || '').replace(/[&<>"']/g, ' ');

    let twiml = '';
    if (result.actionTaken === 'escalated_to_human') {
      const forwardNumber = process.env.BUSINESS_OWNER_FORWARD_PHONE || '+9118008903456';
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">I am connecting you with Mr. Kandhari right now. Please hold.</Say>
  <Dial>${forwardNumber}</Dial>
</Response>`;
    } else if (result.actionTaken === 'appointment_booked' || result.actionTaken === 'ticket_created' || speechResult.toLowerCase().includes('bye') || speechResult.toLowerCase().includes('thank')) {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">${replyText}</Say>
  <Gather input="speech dtmf" timeout="4" action="/api/receptionist/webhook/gather" method="POST" language="en-IN">
    <Say voice="Polly.Aditi" language="en-IN">Is there anything else I can assist you with?</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">Thank you for calling Kandhari Tent House. Your requirements have been recorded for the owner to review. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;
    } else {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" timeout="5" speechTimeout="auto" action="/api/receptionist/webhook/gather" method="POST" language="en-IN">
    <Say voice="Polly.Aditi" language="en-IN">${replyText}</Say>
  </Gather>
  <Redirect>/api/receptionist/webhook/voice</Redirect>
</Response>`;
    }

    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('telephony gather webhook error:', error);
    res.set('Content-Type', 'text/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">Thank you for calling Kandhari Tent House. We have recorded your number and will call you back shortly.</Say>
  <Hangup/>
</Response>`);
  }
};

/**
 * Inbound PSTN Telephony Webhook: Status Callback
 */
const handleVoiceStatusWebhook = (req, res) => {
  try {
    const callSid = req.body.CallSid || req.query.CallSid;
    const duration = parseInt(req.body.CallDuration, 10) || 0;
    const status = req.body.CallStatus || 'completed';

    const activeCalls = receptionistService.getCallsList();
    const call = activeCalls.find(c => c.callSid === callSid);
    if (call) {
      receptionistService.endCall(call.callId, `Telephony carrier call status: ${status}, duration: ${duration}s`);
    }

    res.set('Content-Type', 'text/xml');
    return res.send('<Response/>');
  } catch (error) {
    return res.status(200).send('<Response/>');
  }
};

/**
 * GET /api/receptionist/telephony-config
 * Reports live status of telephony integrations, numbers, and webhook URLs
 */
const getTelephonyConfig = (req, res) => {
  const host = req.get('host') || 'kandharitent.vercel.app';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const isTwilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

  return res.json({
    success: true,
    data: {
      provider: isTwilioConfigured ? 'Twilio Voice (PSTN Telephony Active)' : 'Telephony Webhook Engine Ready (Pending Carrier Credential Binding)',
      assistantName: 'Veronica',
      publicTollFreeNumber: '1800-890-3456',
      webhookEndpoints: {
        voiceUrl: `${baseUrl}/api/receptionist/webhook/voice`,
        gatherUrl: `${baseUrl}/api/receptionist/webhook/gather`,
        statusUrl: `${baseUrl}/api/receptionist/webhook/status`
      },
      configuredVariables: {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Missing',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Configured' : 'Missing',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER : 'Not set',
        BUSINESS_OWNER_FORWARD_PHONE: process.env.BUSINESS_OWNER_FORWARD_PHONE ? 'Configured (Private)' : 'Missing'
      },
      instructions: [
        '1. In your Twilio Console (Phone Numbers -> Manage -> Active Numbers), click your provisioned number.',
        '2. Under "Voice Configuration", set "A CALL COMES IN" to "Webhook" with HTTP POST.',
        `3. Set the Webhook URL to: ${baseUrl}/api/receptionist/webhook/voice`,
        `4. Set "Call Status Changes" to: ${baseUrl}/api/receptionist/webhook/status`,
        '5. Calls placed to your number will immediately be answered live by Veronica with real-time speech interaction.'
      ]
    }
  });
};

/**
 * POST /api/receptionist/simulate-incoming
 * Simulates a full inbound PSTN phone call for testing without telephony carrier bills
 */
const simulateIncomingCall = async (req, res) => {
  try {
    const { callerPhone, callerName, userMessages } = req.body;
    const phone = callerPhone || '9876543210';
    const name = callerName || 'Test Telecom Caller';

    const start = receptionistService.startCall({ callerPhone: phone, callerName: name });
    const callId = start.callId;

    const turns = [];
    const messages = Array.isArray(userMessages) && userMessages.length > 0 
      ? userMessages 
      : ['I need to book Dwarka Shri Lawn for a wedding on 15 November 2026 for 500 guests'];

    for (const msg of messages) {
      const turnRes = await receptionistService.processCallMessage(callId, msg);
      turns.push({ userMessage: msg, veronicaReply: turnRes.reply, action: turnRes.actionTaken });
    }

    const end = receptionistService.endCall(callId, 'Verified simulated PSTN incoming call');

    return res.status(201).json({
      success: true,
      callId,
      callerPhone: phone,
      callerName: name,
      turns,
      summary: end.summary
    });
  } catch (error) {
    console.error('simulateIncomingCall error:', error);
    return res.status(500).json({ success: false, message: 'Simulation error' });
  }
};

module.exports = {
  startCall,
  sendCallMessage,
  endCall,
  getCalls,
  getAppointments,
  getTickets,
  getCallbacks,
  handleIncomingVoiceWebhook,
  handleVoiceGatherWebhook,
  handleVoiceStatusWebhook,
  getTelephonyConfig,
  simulateIncomingCall
};
