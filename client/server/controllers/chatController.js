/**
 * Persistent AI Chat Controller
 * Manages conversational sessions, persistent MongoDB / LocalStore memory,
 * 5-photo gallery responses, and seamless conversion of chat state to official enquiries.
 */

const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Conversation = require('../models/Conversation');
const Enquiry = require('../models/Enquiry');
const Gallery = require('../models/Gallery');
const { processChatMessage } = require('../services/aiService');
const crypto = require('crypto');

const generateId = (prefix = 'conv') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

// Auto-record / update customer interaction in enquiries database & notes for instant Excel export
const syncChatToEnquiry = async (conv, aiResult = {}, reqUser = null) => {
  try {
    const state = conv.collectedState || {};
    const transcript = (conv.messages || [])
      .map(m => `[${(m.role || 'user').toUpperCase()} - ${new Date(m.timestamp || Date.now()).toLocaleTimeString()}]: ${m.content}`)
      .join('\n\n');

    const defaultRef = (conv.collectedState && conv.collectedState.enquiryReference) || `CHAT-${conv.id.replace('conv-', '').substring(0, 8).toUpperCase()}`;

    if (isMongoConnected()) {
      let existing = await Enquiry.findOne({ conversationId: conv.id });
      if (existing) {
        if (state.customerName && (!existing.customerName || existing.customerName.includes('Visitor'))) {
          existing.customerName = state.customerName;
        }
        if (state.phone && (!existing.phone || existing.phone.includes('Pending'))) {
          existing.phone = state.phone;
          existing.whatsappNumber = state.whatsappNumber || state.phone;
        }
        if (state.eventType) existing.eventType = state.eventType;
        if (state.eventDate) existing.eventDate = state.eventDate;
        if (state.locality) existing.locality = state.locality;
        if (state.guestCount) existing.guestCount = state.guestCount;
        existing.notes = `Customer Chat Interaction Transcript:\n${transcript}`;
        existing.internalNotes = `Approached website via AI Chat. Latest Intent: ${aiResult.intent || conv.recognizedIntent || 'general'}. Auto-synced at ${new Date().toLocaleString()}`;
        await existing.save();
      } else {
        const newEnq = new Enquiry({
          id: defaultRef,
          customerId: conv.customerId || (reqUser ? reqUser.id : null),
          conversationId: conv.id,
          enquiryType: 'chat',
          customerName: state.customerName || (reqUser ? reqUser.name : 'Website Visitor (Chat)'),
          phone: state.phone || (reqUser ? reqUser.phone : 'Pending from chat'),
          whatsappNumber: state.whatsappNumber || state.phone || '',
          preferredContactMethod: state.preferredContactMethod || 'Phone',
          serviceRequired: (state.selectedServices && state.selectedServices.length > 0)
            ? state.selectedServices.join(', ')
            : `Chat: ${aiResult.intent || 'Event Consultation'}`,
          servicesList: state.selectedServices || [],
          eventDate: state.eventDate || '',
          locality: state.locality || 'Lucknow, Uttar Pradesh',
          eventType: state.eventType || 'Celebration',
          guestCount: state.guestCount || 0,
          budgetRange: state.budget || 'Flexible',
          detailedRequirements: `Customer approached via website chat. Latest query: "${conv.messages && conv.messages.length > 1 ? conv.messages[conv.messages.length - 2]?.content : ''}"`,
          notes: `Customer Chat Interaction Transcript:\n${transcript}`,
          consentGiven: true,
          status: 'New',
          referredTo: '',
          nextFollowUpDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
          internalNotes: `Auto-logged chat interaction. Intent: ${aiResult.intent || 'general'}. Conversation ID: ${conv.id}`,
          createdAt: new Date().toISOString()
        });
        await newEnq.save();
        conv.collectedState.enquiryReference = defaultRef;
      }
    } else {
      const localDb = getLocalDb();
      if (!localDb.enquiries) localDb.enquiries = [];
      let existing = localDb.enquiries.find(e => e.conversationId === conv.id);
      if (existing) {
        if (state.customerName && (!existing.customerName || existing.customerName.includes('Visitor'))) {
          existing.customerName = state.customerName;
        }
        if (state.phone && (!existing.phone || existing.phone.includes('Pending'))) {
          existing.phone = state.phone;
          existing.whatsappNumber = state.whatsappNumber || state.phone;
        }
        if (state.eventType) existing.eventType = state.eventType;
        if (state.eventDate) existing.eventDate = state.eventDate;
        if (state.locality) existing.locality = state.locality;
        if (state.guestCount) existing.guestCount = state.guestCount;
        existing.notes = `Customer Chat Interaction Transcript:\n${transcript}`;
        existing.internalNotes = `Approached website via AI Chat. Latest Intent: ${aiResult.intent || conv.recognizedIntent || 'general'}. Auto-synced at ${new Date().toLocaleString()}`;
      } else {
        const newEnq = {
          id: defaultRef,
          customerId: conv.customerId || (reqUser ? reqUser.id : null),
          conversationId: conv.id,
          enquiryType: 'chat',
          customerName: state.customerName || (reqUser ? reqUser.name : 'Website Visitor (Chat)'),
          phone: state.phone || (reqUser ? reqUser.phone : 'Pending from chat'),
          whatsappNumber: state.whatsappNumber || state.phone || '',
          preferredContactMethod: state.preferredContactMethod || 'Phone',
          serviceRequired: (state.selectedServices && state.selectedServices.length > 0)
            ? state.selectedServices.join(', ')
            : `Chat: ${aiResult.intent || 'Event Consultation'}`,
          servicesList: state.selectedServices || [],
          eventDate: state.eventDate || '',
          locality: state.locality || 'Lucknow, Uttar Pradesh',
          eventType: state.eventType || 'Celebration',
          guestCount: state.guestCount || 0,
          budgetRange: state.budget || 'Flexible',
          detailedRequirements: `Customer approached via website chat. Latest query: "${conv.messages && conv.messages.length > 1 ? conv.messages[conv.messages.length - 2]?.content : ''}"`,
          notes: `Customer Chat Interaction Transcript:\n${transcript}`,
          consentGiven: true,
          status: 'New',
          referredTo: '',
          nextFollowUpDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
          internalNotes: `Auto-logged chat interaction. Intent: ${aiResult.intent || 'general'}. Conversation ID: ${conv.id}`,
          createdAt: new Date().toISOString()
        };
        localDb.enquiries.unshift(newEnq);
        conv.collectedState.enquiryReference = defaultRef;
      }
    }
  } catch (err) {
    console.error('Error auto-syncing chat to enquiry:', err);
  }
};

// 1. Start new conversation
const startConversation = async (req, res) => {
  try {
    const customerId = req.user ? req.user.id : null;
    const convId = generateId('conv');

    const newConv = {
      id: convId,
      customerId,
      status: 'active',
      recognizedIntent: 'general_inquiry',
      collectedState: {
        customerName: req.user ? req.user.name : '',
        phone: req.user ? req.user.phone : '',
        whatsappNumber: req.user ? req.user.phone : '',
        preferredContactMethod: 'Phone',
        eventType: '',
        eventDate: '',
        locality: '',
        guestCount: 0,
        selectedServices: [],
        budget: '',
        specialRequests: '',
        enquiryReference: null,
        consentGiven: true
      },
      messages: [
        {
          id: generateId('msg'),
          role: 'assistant',
          content: 'Namaste! I am the AI Event Advisor for Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow. How may I assist you with your celebration today? You can ask about our tents, lawn availability, catering coordination, floral & stage decor, or ask to view our photo gallery.',
          timestamp: new Date()
        }
      ],
      lastActivityAt: new Date()
    };

    if (isMongoConnected()) {
      const created = await Conversation.create(newConv);
      return res.status(201).json({ success: true, conversation: created });
    } else {
      const localDb = getLocalDb();
      localDb.conversations.push(newConv);
      saveLocalStore();
      return res.status(201).json({ success: true, conversation: newConv });
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ success: false, message: 'Could not initialize chat conversation.' });
  }
};

// 2. Get existing conversation by ID (with privacy / authorization checks)
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    let conv = null;
    if (isMongoConnected()) {
      conv = await Conversation.findOne({ id: conversationId });
    } else {
      const localDb = getLocalDb();
      conv = localDb.conversations.find(c => c.id === conversationId);
    }

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Access check: If conversation belongs to authenticated customer, ensure requester is owner or admin
    if (conv.customerId && req.user) {
      if (req.user.role !== 'admin' && req.user.id !== conv.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation.' });
      }
    }

    res.json({ success: true, conversation: conv });
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    res.status(500).json({ success: false, message: 'Could not retrieve conversation history.' });
  }
};

// 3. Send message & get AI response
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Retrieve conversation
    let conv = null;
    if (isMongoConnected()) {
      conv = await Conversation.findOne({ id: conversationId });
    } else {
      const localDb = getLocalDb();
      conv = localDb.conversations.find(c => c.id === conversationId);
    }

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Privacy access check
    if (conv.customerId && req.user) {
      if (req.user.role !== 'admin' && req.user.id !== conv.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this conversation.' });
      }
    }

    // If user just logged in during an ongoing conversation, link customer ID
    if (!conv.customerId && req.user) {
      conv.customerId = req.user.id;
    }

    // Fetch published gallery images for potential 5-photo response
    let galleryList = [];
    if (isMongoConnected()) {
      galleryList = await Gallery.find({});
    } else {
      galleryList = getLocalDb().gallery || [];
    }

    // Process message through AI Service
    const aiResult = await processChatMessage({
      userText: text.trim(),
      conversationHistory: conv.messages || [],
      currentState: conv.collectedState || {},
      availableGallery: galleryList
    });

    const userMsg = {
      id: generateId('msg'),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    const assistantMsg = {
      id: generateId('msg'),
      role: 'assistant',
      content: aiResult.assistantText,
      intent: aiResult.intent,
      galleryCategory: aiResult.galleryCategory,
      galleryImages: aiResult.galleryImages,
      timestamp: new Date()
    };

    conv.messages.push(userMsg);
    conv.messages.push(assistantMsg);
    conv.recognizedIntent = aiResult.intent;
    conv.collectedState = aiResult.collectedState;
    conv.lastActivityAt = new Date();

    // Auto-record this customer interaction into Enquiries database & customer notes
    await syncChatToEnquiry(conv, aiResult, req.user);

    if (isMongoConnected()) {
      await conv.save();
    } else {
      saveLocalStore();
    }

    res.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      collectedState: conv.collectedState,
      recognizedIntent: aiResult.intent
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ success: false, message: 'Could not process message.' });
  }
};

// 4. Submit official enquiry from persistent chat conversation state
const submitEnquiryFromChat = async (req, res) => {
  try {
    const { conversationId } = req.params;

    let conv = null;
    if (isMongoConnected()) {
      conv = await Conversation.findOne({ id: conversationId });
    } else {
      const localDb = getLocalDb();
      conv = localDb.conversations.find(c => c.id === conversationId);
    }

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Check conversation ownership if it belongs to another customer
    if (conv.customerId && req.user) {
      if (req.user.role !== 'admin' && req.user.id !== conv.customerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized. This conversation belongs to another customer.' });
      }
    }

    const customerId = req.user ? req.user.id : (conv.customerId || null);
    if (req.user && !conv.customerId) {
      conv.customerId = req.user.id;
    }

    const state = conv.collectedState || {};
    const refNumber = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const customerName = (req.body.customerName && req.body.customerName.trim()) || (req.user && req.user.name) || state.customerName || 'Customer via Chat';
    const phone = (req.body.phone && req.body.phone.trim()) || (req.user && req.user.phone) || state.phone || '18008903456';
    const whatsappNumber = (req.body.whatsappNumber && req.body.whatsappNumber.trim()) || req.body.phone || state.whatsappNumber || (req.user && req.user.phone) || phone;
    const email = (req.body.email && req.body.email.trim()) || (req.user && req.user.email) || '';
    const eventType = (req.body.eventType && req.body.eventType.trim()) || state.eventType || 'Celebration';
    const eventDate = (req.body.eventDate && req.body.eventDate.trim()) || state.eventDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const locality = (req.body.locality && req.body.locality.trim()) || state.locality || 'Lucknow, Uttar Pradesh';
    const guestCount = req.body.guestCount !== undefined ? parseInt(req.body.guestCount, 10) : (state.guestCount || 0);
    const serviceRequired = (req.body.serviceRequired && req.body.serviceRequired.trim()) || (state.selectedServices && state.selectedServices.length > 0 
      ? state.selectedServices.join(', ') 
      : 'Event Planning & Decoration Consultation');
    const servicesList = Array.isArray(req.body.servicesList) ? req.body.servicesList : (state.selectedServices || []);
    const budgetRange = (req.body.budgetRange && req.body.budgetRange.trim()) || state.budget || 'Custom Quote on Request';
    const userNotes = req.body.notes ? req.body.notes.trim() : (state.specialRequests || '');

    const transcript = (conv.messages || [])
      .map(m => `[${(m.role || 'user').toUpperCase()} - ${new Date(m.timestamp || Date.now()).toLocaleTimeString()}]: ${m.content}`)
      .join('\n\n');

    const newEnquiry = {
      id: refNumber,
      customerId,
      conversationId: conv.id,
      enquiryType: 'chat',
      customerName,
      phone,
      whatsappNumber,
      email,
      preferredContactMethod: req.body.preferredContactMethod || state.preferredContactMethod || 'Phone',
      serviceRequired,
      servicesList,
      eventDate,
      locality,
      eventType,
      guestCount,
      budgetRange,
      detailedRequirements: userNotes || `Generated via AI Chat Assistant. Intent: ${conv.recognizedIntent}.`,
      notes: `Customer Chat Interaction Transcript:\n${transcript}${userNotes ? `\n\nClient Notes: ${userNotes}` : ''}`,
      consentGiven: true,
      status: 'New',
      referredTo: '',
      nextFollowUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      internalNotes: `Auto-submitted from AI Chat (Conversation ID: ${conv.id})`
    };

    if (isMongoConnected()) {
      await Enquiry.deleteMany({ conversationId: conv.id });
      await Enquiry.create(newEnquiry);
    } else {
      const localDb = getLocalDb();
      if (!localDb.enquiries) localDb.enquiries = [];
      localDb.enquiries = localDb.enquiries.filter(e => e.conversationId !== conv.id);
      localDb.enquiries.unshift(newEnquiry);
      saveLocalStore();
    }

    // Mark conversation state with enquiry reference
    conv.status = 'submitted';
    conv.collectedState.enquiryReference = refNumber;
    
    // Add confirmation assistant message
    conv.messages.push({
      id: generateId('msg'),
      role: 'assistant',
      content: `Congratulations! Your enquiry has been officially registered with Reference ID **${refNumber}**. Our team will review your requirements and reach out to you directly on ${newEnquiry.phone}. You can also connect immediately on WhatsApp with our management desk.`,
      timestamp: new Date()
    });

    if (isMongoConnected()) {
      await conv.save();
    } else {
      saveLocalStore();
    }

    // Format WhatsApp Link
    const waText = encodeURIComponent(
      `*New Event Enquiry (${refNumber})*\n` +
      `Business: Kandhari Tent & Caterers / Dwarka Shri Lawn\n` +
      `Name: ${newEnquiry.customerName}\n` +
      `Phone: ${newEnquiry.phone}\n` +
      `Event: ${newEnquiry.eventType}\n` +
      `Date: ${newEnquiry.eventDate}\n` +
      `Locality: ${newEnquiry.locality}\n` +
      `Guests: ${newEnquiry.guestCount || 'TBD'}\n` +
      `Services: ${newEnquiry.serviceRequired}`
    );
    const whatsappUrl = `https://wa.me/9118008903456?text=${waText}`;

    res.status(201).json({
      success: true,
      referenceNumber: refNumber,
      enquiry: newEnquiry,
      whatsappUrl,
      message: 'Enquiry officially submitted and linked with chat conversation.'
    });
  } catch (error) {
    console.error('Error submitting enquiry from chat:', error);
    res.status(500).json({ success: false, message: 'Could not submit enquiry from chat.' });
  }
};

module.exports = {
  startConversation,
  getConversation,
  sendMessage,
  submitEnquiryFromChat
};
