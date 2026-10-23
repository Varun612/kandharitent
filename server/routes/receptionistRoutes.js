// server/routes/receptionistRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/receptionistController');
const { receptionistLimiter } = require('../middleware/rateLimiter');

// PSTN Telephony Carrier Inbound Webhooks (Twilio / Exotel / Plivo)
router.post('/webhook/voice', controller.handleIncomingVoiceWebhook);
router.get('/webhook/voice', controller.handleIncomingVoiceWebhook);
router.post('/webhook/gather', controller.handleVoiceGatherWebhook);
router.get('/webhook/gather', controller.handleVoiceGatherWebhook);
router.post('/webhook/status', controller.handleVoiceStatusWebhook);

// Configuration & Simulation
router.get('/telephony-config', controller.getTelephonyConfig);
router.post('/simulate-incoming', receptionistLimiter, controller.simulateIncomingCall);

// Interactive simulator endpoints
router.post('/call/start', receptionistLimiter, controller.startCall);
router.post('/call/message', receptionistLimiter, controller.sendCallMessage);
router.post('/call/end', controller.endCall);

// Operations inspection endpoints (Admin / Staff)
router.get('/calls', controller.getCalls);
router.get('/appointments', controller.getAppointments);
router.get('/tickets', controller.getTickets);
router.get('/callbacks', controller.getCallbacks);

module.exports = router;
