/**
 * AI Service Adapter for Kandhari Tent & Caterers & Dwarka Shri Lawn
 * Supports:
 * 1. Google Gemini API via @google/genai when GEMINI_API_KEY is configured
 * 2. Intelligent, conversational rule-based NLP engine supporting Hindi, Hinglish, & English
 * Strictly adheres to ground-truth constraints (no invented prices, menus, or capacities).
 */

let GoogleGenAI = null;
try {
  const genaiModule = require('@google/genai');
  GoogleGenAI = genaiModule.GoogleGenAI;
} catch (e) {
  // Graceful fallback if not yet installed
}

// Category mapping helper for 5-photo gallery retrieval
const normalizeGalleryCategory = (text = '') => {
  const lower = text.toLowerCase();
  if (lower.includes('wedding') || lower.includes('reception') || lower.includes('shaadi') || lower.includes('setup')) {
    return 'Actual wedding and reception setups';
  }
  if (lower.includes('lawn') || lower.includes('venue') || lower.includes('ground') || lower.includes('dwarka') || lower.includes('garden')) {
    return 'Dwarka Shri Lawn venue and grounds';
  }
  if (lower.includes('stage') || lower.includes('mandap') || lower.includes('jaimala') || lower.includes('gate') || lower.includes('entrance') || lower.includes('entry')) {
    return 'Stage and mandap designs';
  }
  if (lower.includes('tent') || lower.includes('hangar') || lower.includes('canopy') || lower.includes('shamiana') || lower.includes('waterproof')) {
    return 'Tent structures and canopy layouts';
  }
  if (lower.includes('seating') || lower.includes('chair') || lower.includes('sofa') || lower.includes('furniture') || lower.includes('table') || lower.includes('maharaja')) {
    return 'Seating and furniture arrangements';
  }
  if (lower.includes('light') || lower.includes('chandelier') || lower.includes('flower') || lower.includes('floral') || lower.includes('decor') || lower.includes('phool') || lower.includes('led')) {
    return 'Floral and lighting decor';
  }
  if (lower.includes('cater') || lower.includes('food') || lower.includes('khana') || lower.includes('buffet') || lower.includes('counter') || lower.includes('chaat') || lower.includes('paneer')) {
    return 'Catering and food counters';
  }
  return 'Dwarka Shri Lawn venue and grounds';
};

// Intent Classification
const classifyIntent = (text = '') => {
  const lower = text.toLowerCase();
  
  // Gallery request
  if (
    lower.includes('photo') || lower.includes('pic') || lower.includes('image') ||
    lower.includes('tasveer') || lower.includes('gallery') || lower.includes('dikhaye') ||
    lower.includes('dekhi') || lower.includes('show me') || lower.includes('look at')
  ) {
    return { intent: 'gallery_request', category: normalizeGalleryCategory(text) || 'Lawn and venue' };
  }

  // Catering menu or food
  if (
    lower.includes('menu') || lower.includes('khana') || lower.includes('khaane') ||
    lower.includes('cater') || lower.includes('food') || lower.includes('dish') ||
    lower.includes('snack') || lower.includes('rasoi') || lower.includes('lunch') || lower.includes('dinner')
  ) {
    return { intent: 'catering_menu', category: 'Catering' };
  }

  // Lawn & venue booking
  if (
    lower.includes('lawn') || lower.includes('venue') || lower.includes('dwarka') ||
    lower.includes('ground') || lower.includes('book lawn') || lower.includes('lawn booking') ||
    lower.includes('lawn ki')
  ) {
    return { intent: 'lawn_booking', category: 'Lawn and venue' };
  }

  // Tent & canopies
  if (
    lower.includes('tent') || lower.includes('hangar') || lower.includes('shamiana') ||
    lower.includes('canopy') || lower.includes('waterproof') || lower.includes('tambu')
  ) {
    return { intent: 'tent_rental', category: 'Tent structures' };
  }

  // Floral decoration
  if (
    lower.includes('floral') || lower.includes('flower') || lower.includes('phool') ||
    lower.includes('genda') || lower.includes('marigold') || lower.includes('rose')
  ) {
    return { intent: 'floral_decoration', category: 'Floral decoration' };
  }

  // Stage, mandap, entrance
  if (
    lower.includes('stage') || lower.includes('mandap') || lower.includes('gate') ||
    lower.includes('entrance') || lower.includes('jaimala') || lower.includes('sofa')
  ) {
    return { intent: 'stage_mandap_entrance', category: 'Stage and mandap' };
  }

  // Lighting & sound
  if (
    lower.includes('light') || lower.includes('sound') || lower.includes('dj') ||
    lower.includes('speaker') || lower.includes('roshni') || lower.includes('truss') || lower.includes('focus')
  ) {
    return { intent: 'lighting_sound', category: 'Lighting' };
  }

  // Pricing or package enquiries
  if (
    lower.includes('price') || lower.includes('cost') || lower.includes('package') ||
    lower.includes('rate') || lower.includes('kitna') || lower.includes('charges') ||
    lower.includes('estimate') || lower.includes('budget') || lower.includes('quote')
  ) {
    return { intent: 'pricing_package', category: null };
  }

  // Follow-up on existing enquiry
  if (
    lower.includes('enq-') || lower.includes('reference') || lower.includes('follow up') ||
    lower.includes('status') || lower.includes('track') || lower.includes('pichla')
  ) {
    return { intent: 'followup_enquiry', category: null };
  }

  // Multiple services
  if (
    (lower.includes('tent') && lower.includes('lawn')) ||
    (lower.includes('decor') && lower.includes('catering')) ||
    (lower.includes('tent') && lower.includes('light')) ||
    lower.includes('complete package') || lower.includes('all services')
  ) {
    return { intent: 'multiple_services', category: null };
  }

  return { intent: 'general_planning', category: null };
};

// Information Slot Extractor
const extractSlots = (text = '', currentState = {}) => {
  const updated = { ...currentState };
  const lower = text.toLowerCase();

  // 1. Phone number (10 digits starting with 6-9)
  const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
  if (phoneMatch && !updated.phone) {
    updated.phone = phoneMatch[0];
  }

  // 2. Guest count - check explicit guest indicators first
  const explicitGuestMatch = text.match(/\b(\d{2,5})\s*(?:guests?|log|people|person|aadmi|pax)\b/i) || 
                             text.match(/(?:guests?|log|people|person|aadmi|pax)\s*[:=]?\s*(\d{2,5})\b/i);
  if (explicitGuestMatch) {
    const num = parseInt(explicitGuestMatch[1], 10);
    if (num >= 10 && num <= 10000) {
      updated.guestCount = num;
    }
  } else if (!updated.guestCount) {
    // Fallback: check standalone 3-4 digit numbers not part of a date or phone
    const fallbackNum = text.match(/\b([1-9]\d{2,3})\b/);
    if (fallbackNum) {
      const num = parseInt(fallbackNum[1], 10);
      if (num >= 50 && num <= 5000 && num !== 2024 && num !== 2025 && num !== 2026 && num !== 2027) {
        updated.guestCount = num;
      }
    }
  }

  // 3. Event Type
  if (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('shadi') || lower.includes('marriage')) {
    updated.eventType = 'Wedding';
  } else if (lower.includes('reception')) {
    updated.eventType = 'Reception';
  } else if (lower.includes('engagement') || lower.includes('roka') || lower.includes('ring ceremony')) {
    updated.eventType = 'Engagement / Roka';
  } else if (lower.includes('haldi') || lower.includes('mehendi') || lower.includes('sangeet')) {
    updated.eventType = 'Pre-Wedding (Haldi/Mehendi/Sangeet)';
  } else if (lower.includes('birthday') || lower.includes('janamdin')) {
    updated.eventType = 'Birthday Celebration';
  } else if (lower.includes('corporate') || lower.includes('meeting')) {
    updated.eventType = 'Corporate Event';
  } else if (lower.includes('mata ki chowki') || lower.includes('pooja') || lower.includes('religious') || lower.includes('katha')) {
    updated.eventType = 'Religious Function';
  }

  // 4. Date (e.g. 20 Nov, 20 November, 2026-11-20, next month, etc.)
  const dateMatch = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/) ||
                    text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i);
  if (dateMatch && !updated.eventDate) {
    updated.eventDate = dateMatch[0];
  }

  // 5. Locality (Lucknow localities)
  const localities = [
    'Kanpur Road', 'Alambagh', 'Daroga Kheda', 'Gomti Nagar', 'Hazratganj', 'Indira Nagar',
    'Ashiyana', 'Krishna Nagar', 'Sarojini Nagar', 'Vrindavan Colony', 'Telibagh',
    'Chowk', 'Mahanagar', 'Jankipuram', 'Rajajipuram', 'Transport Nagar', 'Amausi'
  ];
  for (const loc of localities) {
    if (lower.includes(loc.toLowerCase())) {
      updated.locality = loc + ', Lucknow';
      break;
    }
  }

  // 6. Customer Name
  const nameMatch = text.match(/(?:my name is|i am|naam|mera naam)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch && !updated.customerName) {
    updated.customerName = nameMatch[1];
  }

  // 7. Selected Services
  if (!updated.selectedServices) updated.selectedServices = [];
  if ((lower.includes('tent') || lower.includes('hangar')) && !updated.selectedServices.includes('Tent House & Canopies')) {
    updated.selectedServices.push('Tent House & Canopies');
  }
  if ((lower.includes('lawn') || lower.includes('venue')) && !updated.selectedServices.includes('Dwarka Shri Lawn Booking')) {
    updated.selectedServices.push('Dwarka Shri Lawn Booking');
  }
  if ((lower.includes('flower') || lower.includes('floral')) && !updated.selectedServices.includes('Floral Decoration')) {
    updated.selectedServices.push('Floral Decoration');
  }
  if ((lower.includes('stage') || lower.includes('mandap')) && !updated.selectedServices.includes('Stage & Mandap Setup')) {
    updated.selectedServices.push('Stage & Mandap Setup');
  }
  if ((lower.includes('light') || lower.includes('sound') || lower.includes('dj')) && !updated.selectedServices.includes('Lighting & Sound')) {
    updated.selectedServices.push('Lighting & Sound');
  }
  if ((lower.includes('cater') || lower.includes('food') || lower.includes('khana')) && !updated.selectedServices.includes('Catering Arrangements')) {
    updated.selectedServices.push('Catering Arrangements');
  }

  return updated;
};

// Natural Conversational Engine (Rules/NLP Fallback)
const generateConversationalResponse = ({ userText, intentInfo, collectedState, galleryImages = [] }) => {
  const isHindi = /[\u0900-\u097F]/.test(userText) || 
                  /\b(aap|ka|ki|ke|hai|karna|chahiye|bhejiye|bataye|batao|kripya|namaste|shukriya|shadi|ha|nahi|dikhaye)\b/i.test(userText);
  
  const { intent, category } = intentInfo;

  // Case 1: Gallery Request with 5 photos
  if (intent === 'gallery_request') {
    if (galleryImages.length > 0) {
      if (isHindi) {
        return `Namaste! Kandhari Tent & Caterers aur Dwarka Shri Lawn ke **${category}** ke setups ki genuine photos niche present hain. Inme se kisi bhi design ko replicate karwane ke liye aap click karke pooch sakte hain. Kya aapko kisi specific event date ke liye requirement hai?`;
      }
      return `Here are genuine photographs of our **${category}** setups managed by Kandhari Tent & Caterers and Dwarka Shri Lawn. You can click on any setup to enquire about replicating that style. Would you also like to share your event date or guest count?`;
    }
  }

  // Case 2: Catering Menu
  if (intent === 'catering_menu') {
    if (isHindi) {
      return `Kandhari Tent & Caterers me hum premium catering aur buffet coordination provide karte hain. Har event ka menu customer ki pasand (Pure Veg / Multi-Cuisine, Live Chaat counters, Desserts) ke anusaar customize kiya jata hai. Hum fixed artificial rate nahi lagate—kripya batayein aapke event me lagbhag kitne guests expected hain aur event kab hai, taaki hum customized menu proposal prepare kar sakein.`;
    }
    return `At Kandhari Tent & Caterers, we tailor our catering and live buffet setups specifically to your family's preferences and dietary choices (Pure Veg, Awadhi specialties, Live Counters, Desserts). Since we do not publish rigid standard pricing without understanding your needs, could you share your event date and expected guest count so our manager can prepare a personalized menu proposal for you?`;
  }

  // Case 3: Lawn Booking
  if (intent === 'lawn_booking') {
    if (isHindi) {
      return `Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers) Kanpur Road, Opp. Pillar No. 37, Daroga Kheda par sthit ek prasiddh wedding aur celebration venue hai. Yahan green lawn, bridal rooms, 100% generator backup aur grand entry gate available hai. Date availability check karne ke liye, kripya batayein aapka event kis date par hai?`;
    }
    return `Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers) is located right on Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow. The venue offers lush open lawns, bridal suites, 100% generator power backup, and ample parking. To check date availability, could you please tell me your planned event date and expected number of guests?`;
  }

  // Case 4: Follow-up on existing enquiry
  if (intent === 'followup_enquiry') {
    if (isHindi) {
      return `Aapke enquiry ka status check karne ke liye kripya apna Enquiry Reference Number (jaise ENQ-XXXXXX) ya register kiya hua 10-digit mobile number share karein. Hamare owner turant update share karenge.`;
    }
    return `To look up your enquiry details, please share your Enquiry Reference ID (e.g. ENQ-XXXXXX) or your registered 10-digit mobile number. Our operations desk will be glad to give you an immediate update.`;
  }

  // Case 5: Pricing / Package
  if (intent === 'pricing_package') {
    if (isHindi) {
      return `Kandhari Tent & Caterers me har event unique hota hai—tent size, decor specification, lawn duration aur equipment selection ke aadhar par custom quote prepare kiya jata hai. Kripya batayein aapka event kis date par hai aur kaun-kaun si services ki zaroorat hai?`;
    }
    return `At Kandhari Tent & Caterers, we customize every quote based on your exact decor choices, tent dimensions, lighting specifications, and event date. To give you an accurate and fair proposal, could you let us know your planned event date and which services you need?`;
  }

  // Conversational Slot Filling Progression
  // Check what is missing in collectedState:
  if (!collectedState.eventType) {
    if (isHindi) {
      return `Namaste! Kandhari Tent & Caterers aur Dwarka Shri Lawn me aapka swagat hai. Aap kis celebration (jaise Wedding, Reception, Ring Ceremony, Birthday ya Religious Function) ke liye plan kar rahe hain?`;
    }
    return `Welcome to Kandhari Tent & Caterers and Dwarka Shri Lawn! What type of celebration are you planning (e.g. Wedding, Reception, Engagement/Roka, Birthday, or Religious Function)?`;
  }

  if (!collectedState.eventDate) {
    if (isHindi) {
      return `Aapka ${collectedState.eventType} kis date ya month me planned hai? Hum venue aur tent inventory ki availability verify kar lenge.`;
    }
    return `That's wonderful! What date or month are you planning the ${collectedState.eventType} for, so we can verify availability?`;
  }

  if (!collectedState.guestCount) {
    if (isHindi) {
      return `Aapke ${collectedState.eventType} me lagbhag kitne guests (mehman) expected hain? Isse hum seating aur lawn arrangement ka sahi andaza laga payenge.`;
    }
    return `Approximately how many guests are you expecting for the ${collectedState.eventType}? This helps us recommend the ideal lawn layout, seating capacity, and cooling arrangements.`;
  }

  if (!collectedState.locality) {
    if (isHindi) {
      return `Event Lucknow me kis locality me hoga (jaise Kanpur Road, Alambagh, Gomti Nagar, Ashiyana) ya aap Dwarka Shri Lawn venue dekhna chahenge?`;
    }
    return `Where in Lucknow will the event take place (e.g. Kanpur Road, Alambagh, Gomti Nagar, Ashiyana), or are you looking to host it at Dwarka Shri Lawn?`;
  }

  if (!collectedState.phone) {
    if (isHindi) {
      return `Bahut accha! Hamare event coordinator aapko detailed proposal aur photos bhejne ke liye aapka 10-digit WhatsApp/mobile number prapt karna chahenge. Kripya apna contact number share karein.`;
    }
    return `Thank you! To send you a detailed customized proposal and coordinate next steps, could you please provide your 10-digit mobile or WhatsApp number?`;
  }

  // Summary and Confirmation
  if (isHindi) {
    return `Shukriya! Maine aapki requirements note kar li hain:\n• Event: ${collectedState.eventType || 'Event'}\n• Date: ${collectedState.eventDate || 'TBD'}\n• Guests: ${collectedState.guestCount || 'Flexible'}\n• Location: ${collectedState.locality || 'Lucknow'}\n• Contact: ${collectedState.phone}\n\nKya main ye official enquiry Kandhari Tent & Caterers ke owner ko review aur quotation ke liye submit kar doon?`;
  }
  return `Thank you! I have compiled your event details:\n• Event: ${collectedState.eventType || 'Celebration'}\n• Date: ${collectedState.eventDate || 'TBD'}\n• Expected Guests: ${collectedState.guestCount || 'Flexible'}\n• Location: ${collectedState.locality || 'Lucknow'}\n• Contact Number: ${collectedState.phone}\n\nWould you like me to submit this official enquiry to the owner of Kandhari Tent & Caterers for a custom proposal?`;
};

// Gemini API Integration (if configured)
const callGeminiModel = async ({ messages = [], userText, intentInfo, collectedState, galleryImages = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_KEY;
  if (!apiKey || !GoogleGenAI) {
    return null; // Fall back to conversational NLP
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
You are the official, friendly, warm, and professional AI Event Advisor for Kandhari Tent & Caterers and its associated venue Dwarka Shri Lawn, located at Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh.
Contact numbers: 9305465848, 9307908994, 7355059566.
Tagline: "Making Your Celebrations Memorable".

CRITICAL BUSINESS RULES:
1. Speak in English or Hindi/Hinglish depending on the customer's language. Use respectful Indian hospitality etiquette (e.g., Namaste, Ji).
2. DO NOT INVENT fixed prices, packages, menus, or exact venue capacities. When asked about pricing or catering menus, explain that quotes are customized based on the event scale, date, and client preferences.
3. Keep answers concise, natural, and helpful. Ask one useful question at a time to gather missing info (event type, date, locality, guest count, contact number).
4. Do not re-ask details the customer has already provided.
5. If the user asks for photos or gallery, acknowledge the category.
Current collected event state: ${JSON.stringify(collectedState)}.
Intent detected: ${intentInfo.intent} (${intentInfo.category || 'none'}).
    `;

    const chatHistory = messages.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Add current user prompt
    chatHistory.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    if (response && response.text) {
      return response.text;
    }
  } catch (err) {
    console.warn('[Gemini AI] Call failed, falling back to local conversational NLP:', err.message);
  }
  return null;
};

// Main Process Message Function
const processChatMessage = async ({
  userText,
  conversationHistory = [],
  currentState = {},
  availableGallery = []
}) => {
  // 1. Intent Classification
  const intentInfo = classifyIntent(userText);

  // 2. Extract and accumulate slots
  const collectedState = extractSlots(userText, currentState);

  // 3. Exactly 5 photos when gallery category is requested
  let galleryImages = [];
  let categoryName = intentInfo.category;

  if (intentInfo.intent === 'gallery_request' || categoryName) {
    const targetCat = categoryName || normalizeGalleryCategory(userText) || 'Lawn and venue';
    // Filter published gallery images matching category
    let matches = availableGallery.filter(item => 
      item.category && item.category.toLowerCase() === targetCat.toLowerCase()
    );
    // If not exact match, check title/caption
    if (matches.length < 5) {
      const broader = availableGallery.filter(item => 
        (item.title && item.title.toLowerCase().includes(targetCat.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(targetCat.toLowerCase()))
      );
      for (const b of broader) {
        if (!matches.some(m => m.id === b.id)) {
          matches.push(b);
        }
      }
    }
    // If still under 5 photos, backfill from other gallery photos so user receives 5 highlights
    if (matches.length < 5) {
      for (const b of availableGallery) {
        if (!matches.some(m => m.id === b.id)) {
          matches.push(b);
          if (matches.length >= 5) break;
        }
      }
    }
    // Take exactly 5 photos when 5 or more exist, otherwise all available
    galleryImages = matches.slice(0, 5);
    categoryName = targetCat;
  }

  // 4. Generate Assistant Response (Gemini if available, else NLP engine)
  let assistantText = await callGeminiModel({
    messages: conversationHistory,
    userText,
    intentInfo,
    collectedState,
    galleryImages
  });

  if (!assistantText) {
    assistantText = generateConversationalResponse({
      userText,
      intentInfo,
      collectedState,
      galleryImages
    });
  }

  return {
    assistantText,
    intent: intentInfo.intent,
    galleryCategory: categoryName,
    galleryImages,
    collectedState
  };
};

module.exports = {
  processChatMessage,
  classifyIntent,
  extractSlots,
  normalizeGalleryCategory
};
