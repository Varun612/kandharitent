/**
 * Kandhari Event Concierge — Production AI Service Adapter
 * Kandhari Tent House / Kandhari Tent & Caterers & Dwaraka Shree Lawn, Lucknow
 *
 * Adheres strictly to the Antigravity Website AI Agent Production Behavior Instructions:
 * - 2-3 short sentences maximum per response.
 * - 1 focused question at a time.
 * - 5 Intent Categories (A: Bereavement, B: Birthday, C: Dwaraka Shree Lawn, D: Rentals/Catering, E: General/Fallback).
 * - Priority rule for bereavement / condolence gatherings.
 * - Page-aware & context-aware behavior.
 * - Ground truth verified rates & availability.
 */

let GoogleGenAI = null;
try {
  const genaiModule = require('@google/genai');
  GoogleGenAI = genaiModule.GoogleGenAI;
} catch (e) {
  // Graceful fallback if not installed
}

// Category mapping helper for 5-photo gallery retrieval
const normalizeGalleryCategory = (text = '') => {
  const lower = text.toLowerCase();
  if (lower.includes('wedding') || lower.includes('reception') || lower.includes('shaadi') || lower.includes('setup')) {
    return 'Actual wedding and reception setups';
  }
  if (lower.includes('lawn') || lower.includes('venue') || lower.includes('ground') || lower.includes('dwarka') || lower.includes('dwaraka') || lower.includes('garden')) {
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

// Intent Classification Engine (Categories A to E + Priority Rule)
const classifyIntent = (text = '', pageContext = {}) => {
  const lower = text.toLowerCase();

  // PRIORITY RULE: Bereavement, Condolence, Chautha, Shradh (Category A)
  // When the visitor mentions a death or condolence gathering, handle sensitively under Category A,
  // even if equipment, chairs, or catering is also requested.
  const bereavementKeywords = [
    'chautha', 'shradh', 'shradha', 'terhavi', 'tehrvi', 'condolence', 'passed away',
    'death', 'expired', 'guzar gaye', 'shanti path', 'shok sabha', 'rip', 'funeral',
    'shradhanjali', 'barsi', 'antyeshti', 'antim kriya'
  ];
  if (bereavementKeywords.some(kw => lower.includes(kw))) {
    return {
      category: 'A',
      intent: 'category_a_bereavement',
      label: 'Condolence / Chautha / Shradh',
      isUrgent: lower.includes('today') || lower.includes('aaj') || lower.includes('tonight') || lower.includes('tomorrow') || lower.includes('kal') || lower.includes('urgent')
    };
  }

  // 5-Photo Gallery Request
  if (
    lower.includes('photo') || lower.includes('pic') || lower.includes('image') ||
    lower.includes('tasveer') || lower.includes('gallery') || lower.includes('dikhaye') ||
    lower.includes('dekhi') || lower.includes('show me') || lower.includes('look at')
  ) {
    return {
      category: 'D',
      intent: 'gallery_request',
      galleryCategory: normalizeGalleryCategory(text) || 'Lawn and venue'
    };
  }

  // Catering Menu & Dishes
  if (
    lower.includes('menu') || lower.includes('khana') || lower.includes('khaane') ||
    lower.includes('cater') || lower.includes('food') || lower.includes('dish') ||
    lower.includes('snack') || lower.includes('rasoi') || lower.includes('lunch') || lower.includes('dinner')
  ) {
    return {
      category: 'D',
      intent: 'catering_menu',
      label: 'Catering Menu'
    };
  }

  // Category B: Birthday, Anniversary, Family Celebration
  const birthdayKeywords = [
    'birthday', 'bday', 'janamdin', 'first birthday', '1st birthday', '2nd birthday',
    'anniversary', 'salgirah', 'baby shower', 'godh bharai', 'naming ceremony', 'mundan',
    'kitty party', 'small celebration', 'family function'
  ];
  if (birthdayKeywords.some(kw => lower.includes(kw))) {
    return {
      category: 'B',
      intent: 'category_b_birthday',
      label: 'Birthday / Social Celebration'
    };
  }

  // Category C: Wedding, Reception, Sangeet, Dwaraka Shree Lawn
  const weddingLawnKeywords = [
    'lawn', 'venue', 'dwarka', 'dwaraka', 'shree lawn', 'shri lawn',
    'wedding', 'shaadi', 'shadi', 'marriage', 'reception', 'sangeet', 'mehendi', 'haldi',
    'varmala', 'jaimala', 'engagement', 'roka', 'ring ceremony', 'mandap'
  ];
  if (weddingLawnKeywords.some(kw => lower.includes(kw))) {
    return {
      category: 'C',
      intent: 'category_c_wedding_lawn',
      label: 'Wedding / Lawn Booking'
    };
  }

  // Category D: Tent, Equipment Rental, Furniture, Lighting, Sound
  const rentalKeywords = [
    'tent', 'pandal', 'hangar', 'canopy', 'shamiana', 'waterproof', 'tambu',
    'chair', 'kursi', 'sofa', 'table', 'mez', 'carpet', 'takhat', 'gadda', 'drum',
    'light', 'sound', 'dj', 'speaker', 'cooler', 'mist fan', 'rent', 'rental'
  ];
  if (rentalKeywords.some(kw => lower.includes(kw))) {
    return {
      category: 'D',
      intent: 'category_d_rental_services',
      label: 'Tent / Equipment Rental'
    };
  }

  // Follow-up on existing enquiry
  if (
    lower.includes('enq-') || lower.includes('reference') || lower.includes('follow up') ||
    lower.includes('status') || lower.includes('track') || lower.includes('pichla')
  ) {
    return {
      category: 'E',
      intent: 'followup_enquiry',
      label: 'Enquiry Status'
    };
  }

  // Pricing / Packages
  if (
    lower.includes('price') || lower.includes('cost') || lower.includes('package') ||
    lower.includes('rate') || lower.includes('kitna') || lower.includes('charges') ||
    lower.includes('estimate') || lower.includes('budget') || lower.includes('quote')
  ) {
    return {
      category: 'D',
      intent: 'pricing_package',
      label: 'Pricing & Packages'
    };
  }

  // Category E: General or Fallback
  return {
    category: 'E',
    intent: 'category_e_general',
    label: 'General Enquiry'
  };
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

  // 2. Guest count - explicit indicators
  const explicitGuestMatch = text.match(/\b(\d{2,5})\s*(?:guests?|log|people|person|aadmi|pax)\b/i) || 
                             text.match(/(?:guests?|log|people|person|aadmi|pax)\s*[:=]?\s*(\d{2,5})\b/i);
  if (explicitGuestMatch) {
    const num = parseInt(explicitGuestMatch[1], 10);
    if (num >= 5 && num <= 10000) {
      updated.guestCount = num;
    }
  } else if (!updated.guestCount) {
    const fallbackNum = text.match(/\b([1-9]\d{1,3})\b/);
    if (fallbackNum) {
      const num = parseInt(fallbackNum[1], 10);
      if (num >= 20 && num <= 5000 && num !== 2024 && num !== 2025 && num !== 2026 && num !== 2027) {
        updated.guestCount = num;
      }
    }
  }

  // 3. Event Type
  if (lower.includes('chautha') || lower.includes('shradh') || lower.includes('terhavi') || lower.includes('condolence') || lower.includes('death')) {
    updated.eventType = 'Condolence / Chautha';
  } else if (lower.includes('birthday') || lower.includes('janamdin')) {
    updated.eventType = 'Birthday Celebration';
  } else if (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('shadi') || lower.includes('marriage')) {
    updated.eventType = 'Wedding';
  } else if (lower.includes('reception')) {
    updated.eventType = 'Reception';
  } else if (lower.includes('engagement') || lower.includes('roka') || lower.includes('ring ceremony')) {
    updated.eventType = 'Engagement / Roka';
  } else if (lower.includes('haldi') || lower.includes('mehendi') || lower.includes('sangeet')) {
    updated.eventType = 'Pre-Wedding Ceremony';
  } else if (lower.includes('anniversary')) {
    updated.eventType = 'Anniversary';
  }

  // 4. Date
  const dateMatch = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/) ||
                    text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i) ||
                    text.match(/\b(today|tonight|tomorrow|aaj|kal)\b/i);
  if (dateMatch && !updated.eventDate) {
    updated.eventDate = dateMatch[0];
  }

  // 5. Locality (Lucknow localities)
  const localities = [
    'Kanpur Road', 'Alambagh', 'Daroga Kheda', 'Gomti Nagar', 'Hazratganj', 'Indira Nagar',
    'Ashiyana', 'Krishna Nagar', 'Sarojini Nagar', 'Vrindavan Colony', 'Telibagh',
    'Chowk', 'Mahanagar', 'Jankipuram', 'Rajajipuram', 'Transport Nagar', 'Amausi', 'Singar Nagar'
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
  if ((lower.includes('tent') || lower.includes('pandal')) && !updated.selectedServices.includes('Tent & Pandal')) {
    updated.selectedServices.push('Tent & Pandal');
  }
  if ((lower.includes('chair') || lower.includes('kursi') || lower.includes('gadda') || lower.includes('mattress')) && !updated.selectedServices.includes('Seating & Mattresses')) {
    updated.selectedServices.push('Seating & Mattresses');
  }
  if ((lower.includes('lawn') || lower.includes('venue')) && !updated.selectedServices.includes('Dwaraka Shree Lawn')) {
    updated.selectedServices.push('Dwaraka Shree Lawn');
  }
  if ((lower.includes('cater') || lower.includes('food') || lower.includes('khana')) && !updated.selectedServices.includes('Catering Arrangements')) {
    updated.selectedServices.push('Catering Arrangements');
  }

  return updated;
};

// Natural Conversational Engine (Strictly 2-3 sentences max, one question at a time)
const generateConversationalResponse = ({ userText, intentInfo, collectedState, galleryImages = [], pageContext = {} }) => {
  const textTrimmed = (userText || '').trim();
  const lower = textTrimmed.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(userText) || 
                  /\b(aap|ka|ki|ke|hai|karna|chahiye|bhejiye|bataye|batao|kripya|namaste|shukriya|shadi|ha|nahi|dikhaye|chautha|log|ghante)\b/i.test(userText);

  // Broad chair clarifying check
  const isBroadChairRequest = (lower.includes('chair') || lower.includes('kursi')) && 
                              (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('need') || lower.includes('chahiye')) &&
                              !textTrimmed.match(/\b\d{2,4}\b/);
  if (isBroadChairRequest && intentInfo.category !== 'A') {
    return {
      text: isHindi
        ? "Lagbhag kitne mehmano ke liye chairs chahiye? Main aapko suitable options dikha kar enquiry note kar sakta hoon."
        : "Approximately how many guests are you expecting? I can help you explore suitable chair options and prepare a rental enquiry.",
      actionSuggestions: ['100 Guests', '250 Guests', '500 Guests', 'Check Availability']
    };
  }

  // Follow-up to guest count (e.g. "Around 300")
  const isGuestCountFollowUp = textTrimmed.match(/(?:around|approx|about|lagbhag)?\s*(\d{2,4})\s*(?:guests?|log|people|pax)?$/i);
  if (isGuestCountFollowUp && intentInfo.category !== 'A' && (lower.includes('around') || lower.includes('approx') || lower.includes('about') || lower.includes('300'))) {
    const count = parseInt(isGuestCountFollowUp[1], 10);
    return {
      text: isHindi
        ? `Bahut badhiya. ${count} mehmano ke liye hum banquet aur PVC chairs compare kar sakte hain. Kya aap chairs ke styles dekhna chahenge?`
        : `Great. I'll help you compare suitable options for approximately ${count} guests. Do you have a preferred chair style, or would you like to see the available options first?`,
      actionSuggestions: ['Highback Banquet Chairs (₹70)', 'VIP Chairs (₹50)', 'PVC Chairs (₹20)', 'Send Enquiry']
    };
  }

  // ==========================================
  // CATEGORY A: Bereavement & Condolence Services
  // Calm, compassionate, respectful, discreet. No celebratory emojis. No upselling.
  // ==========================================
  if (intentInfo.category === 'A') {
    const isUrgent = intentInfo.isUrgent || !collectedState.eventDate || lower.includes('today') || lower.includes('tomorrow') || lower.includes('kal');

    if (!collectedState.eventDate) {
      return {
        text: isHindi
          ? "Is dukh ki ghadi me hamari poori samvedna aapke saath hai. Main arrangements jaldi aur shantipurvak coordinate karne me madad karunga; gathering kis date aur time par hai?"
          : "I'm very sorry for your loss. I'll help you communicate the arrangements as quickly and respectfully as possible; what date and time is the gathering?",
        actionSuggestions: ['Today / Tonight (Urgent)', 'Tomorrow', 'Day After Tomorrow', 'Request a Callback'],
        isUrgent: true
      };
    }

    if (!collectedState.locality || !collectedState.guestCount) {
      return {
        text: isHindi
          ? "Dhanyawad. Ye arrangement Lucknow me kis locality me chahiye, aur lagbhag kitne log aayenge?"
          : "Thank you. Which locality is the arrangement needed in, and approximately how many people are expected?",
        actionSuggestions: ['Kanpur Road', 'Alambagh', 'Ashiyana', 'Gomti Nagar', 'Request a Callback'],
        isUrgent: true
      };
    }

    if (!collectedState.selectedServices || collectedState.selectedServices.length === 0) {
      return {
        text: isHindi
          ? "Kya aapko seating chairs, gadda-chatai, covered waterproof pandal, ya simple chai-paani ki zaroorat hai?"
          : "Would you need seating, mattresses, a covered or waterproof pandal, or a combination? Is any simple food arrangement required?",
        actionSuggestions: ['Chairs & Mattresses', 'Covered Pandal & Seating', 'Complete Simple Setup', 'Request a Callback'],
        isUrgent: true
      };
    }

    // Urgent human handoff
    return {
      text: isHindi
        ? `Maine ${collectedState.locality || 'aapki location'} par ${collectedState.eventDate || 'shok sabha'} ke liye ${collectedState.guestCount || ''} logo ki requirements note kar li hain. Team se turant coordination ke liye kripya apna callback number share karein.`
        : `I understand this is urgent. I've noted the requirements for ${collectedState.eventDate} in ${collectedState.locality}; please share a callback number so our team can coordinate immediately.`,
      actionSuggestions: ['Send Urgent Enquiry', 'Call +91 9305465848', 'Edit Details'],
      isUrgent: true
    };
  }

  // ==========================================
  // GALLERY REQUEST (Exactly 5 Photos)
  // ==========================================
  if (intentInfo.intent === 'gallery_request') {
    const cat = intentInfo.galleryCategory || 'Dwarka Shri Lawn venue and grounds';
    return {
      text: isHindi
        ? `Kandhari Tent & Dwarka Shri Lawn ke ${cat} ke setups ki genuine photos niche present hain. Kisi bhi design ki availability poochne ke liye click karein.`
        : `Here are 5 genuine photographs of our ${cat} setups in Lucknow. Share your event date and guest count to check availability.`,
      actionSuggestions: ['Check Availability', 'Request a Quote', 'Arrange a Site Visit']
    };
  }

  // ==========================================
  // CATERING MENU (17 Courses & Brochure Rules)
  // ==========================================
  if (intentInfo.intent === 'catering_menu') {
    return {
      text: isHindi
        ? "Kandhari Tent & Caterers me Awadhi Banqueting hamare printed brochure ke 17 courses me provide ki jaati hai (Live Chaat, Tandoor, Paneer, Desserts). >500 guests par Veg ₹650 aur 250–500 par ₹750/person hai. Aap kis date aur kitne guests ke liye menu plan kar rahe hain?"
        : "At Kandhari Tent & Caterers, our banqueting covers 17 printed brochure courses including live Awadhi chaat and barbecue. Rates are ₹650/person for >500 guests and ₹750/person for 250–500 guests. What event date and estimated guest count are you planning for?",
      actionSuggestions: ['Design Menu on Catering Page', 'Check Availability', 'Request a Quote']
    };
  }

  // ==========================================
  // CATEGORY B: Birthday & Social Celebrations
  // Warm, enthusiastic, creative, helpful.
  // ==========================================
  if (intentInfo.category === 'B') {
    if (!collectedState.eventDate || !collectedState.guestCount) {
      return {
        text: isHindi
          ? "Bahut shubh! Celebration kis date par hai, aur lagbhag kitne guests expected hain?"
          : "Let's make your celebration special! What date is the event, and approximately how many guests are you expecting?",
        actionSuggestions: ['50 Guests', '100 Guests', '150 Guests', 'Check Availability']
      };
    }

    if (!collectedState.specialRequests) {
      return {
        text: isHindi
          ? "Kya aapka koi specific theme hai jaise cartoon, jungle, princess, ya floral décor? Hum food aur cake table bhi include kar sakte hain."
          : "Do you have a theme in mind, such as princess, jungle, cartoon, floral, or elegant décor, or would you like me to suggest ideas?",
        actionSuggestions: ['Jungle Theme', 'Princess Theme', 'Elegant Floral Décor', 'Suggest Themes']
      };
    }

    return {
      text: isHindi
        ? `Maine ${collectedState.eventDate} ko lagbhag ${collectedState.guestCount} guests ke liye aapka celebration plan note kar liya hai. Kya main ye enquiry team ko quotation aur availability ke liye bhej doon?`
        : `Here's the plan I've noted: ${collectedState.eventType || 'Celebration'} on ${collectedState.eventDate} for ~${collectedState.guestCount} guests. Would you like me to send this enquiry to the team for availability and a quotation?`,
      actionSuggestions: ['Send Enquiry', 'Edit Details', 'Request a Callback']
    };
  }

  // ==========================================
  // CATEGORY C: Dwaraka Shree Lawn & Weddings
  // Polished, professional, attentive, hospitality-focused. Offer site visit.
  // ==========================================
  if (intentInfo.category === 'C') {
    if (!collectedState.eventDate || !collectedState.guestCount) {
      return {
        text: isHindi
          ? "Dwarka Shri Lawn par shaadi ya celebration plan kar rahe hain? Kripya apni preferred event date aur lagbhag guest count share karein."
          : "Planning an event at Dwaraka Shree Lawn? What date are you considering, and approximately how many guests will attend?",
        actionSuggestions: ['300 Guests', '500 Guests', '800 Guests', 'Arrange a Site Visit']
      };
    }

    if (!collectedState.selectedServices.includes('Catering Arrangements')) {
      return {
        text: isHindi
          ? "Dhanyawad. Kya aapko lawn ke saath royal Awadhi catering bhi chahiye, ya food arrangement alag se karenge?"
          : "Thank you. Will you need catering as well, or are you arranging food separately?",
        actionSuggestions: ['Include Royal Catering', 'Lawn & Decor Only', 'Arrange a Site Visit']
      };
    }

    return {
      text: isHindi
        ? `Maine Dwaraka Shree Lawn ke liye ${collectedState.eventDate} ko ${collectedState.guestCount} guests ki requirement note kar li hai. Kya aap site visit plan karna chahenge ya date availability check karein?`
        : `I've noted your event date, guest count, and catering preference for Dwaraka Shree Lawn. Would you like me to send this to the venue team to check availability and arrange a site visit?`,
      actionSuggestions: ['Check Availability', 'Arrange Site Visit', 'Edit Requirements']
    };
  }

  // ==========================================
  // CATEGORY D: Rental, Tent, Equipment & Decor
  // Practical, solution-oriented.
  // ==========================================
  if (intentInfo.category === 'D') {
    if (!collectedState.eventDate || !collectedState.locality) {
      return {
        text: isHindi
          ? "Zaroor! Aapko kaun se items chahiye, kis date ke liye aur Lucknow me kis locality me requirement hai?"
          : "Certainly, I can help with tent and equipment requirements. What items do you need, for which date, and in which locality?",
        actionSuggestions: ['German Hangar Tent', 'Banquet Chairs & Sofas', 'Coolers & Mist Fans', 'Full Package']
      };
    }

    return {
      text: isHindi
        ? `Maine ${collectedState.locality} me ${collectedState.eventDate} ke liye aapki equipment list note kar li hai. Kya main exact availability check karke quote generate karoon?`
        : `I found the relevant equipment items in our Lucknow catalogue for ${collectedState.eventDate}. Would you like me to check exact quantities and send a quotation?`,
      actionSuggestions: ['Request a Quote', 'Send Enquiry', 'Edit Details']
    };
  }

  // ==========================================
  // CATEGORY E: General / Fallback
  // ==========================================
  if (lower.includes('human') || lower.includes('call me') || lower.includes('phone number') || lower.includes('contact')) {
    return {
      text: isHindi
        ? "Aap hamare operations desk se direct +91 9305465848 par sampark kar sakte hain. Aap apna number bhi share kar sakte hain, hum turant callback arrange kar denge."
        : "You can reach our team directly at +91 9305465848. Or share your phone number, and we will arrange an immediate callback.",
      actionSuggestions: ['Call +91 9305465848', 'Request a Callback', 'Send Enquiry']
    };
  }

  return {
    text: isHindi
      ? "Main event planning, Dwaraka Shree Lawn booking, aur tent-equipment rental me madad kar sakta hoon. Aap aaj kya arrange karna chahenge?"
      : "I can help with event planning, venue enquiries, or tent and equipment rental. What are you looking to arrange?",
    actionSuggestions: [
      'Condolence / Chautha',
      'Birthday Celebration',
      'Wedding / Lawn Booking',
      'Tent / Equipment Rental'
    ]
  };
};

// Gemini API Integration (with complete production system instruction)
const callGeminiModel = async ({ messages = [], userText, intentInfo, collectedState, galleryImages = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_KEY;
  if (!apiKey || !GoogleGenAI) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
# SYSTEM PROMPT: KANDHARI EVENT CONCIERGE
You are Kandhari Event Concierge, the intelligent, proactive, conversion-focused AI concierge for Kandhari Tent House / Kandhari Tent & Caterers and Dwaraka Shree Lawn (managed by Kandhari Tent & Caterers) in Lucknow, Uttar Pradesh, India.
Business Address: Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow.
Verified Telephone: +91 9305465848, +91 7355059566, +91 9307908994.

NON-NEGOTIABLE CONVERSATION RULES:
1. Keep EVERY response to 2–3 short sentences maximum.
2. Ask one focused question at a time.
3. Never ask for information already present in conversation or state.
4. Support English, Hindi, and Hinglish. Match the visitor's language.
5. Finish with a clear next step.

INTENT CATEGORIES & TONE:
- Category A (Bereavement, Condolence, Chautha, Shradh): Calm, compassionate, respectful, discreet. ZERO celebratory emojis. No upselling. Urgent human handoff (+91 9305465848).
- Category B (Birthdays, Social Celebrations): Warm, enthusiastic, creative, suggest themes (princess, jungle, cartoon, floral).
- Category C (Dwaraka Shree Lawn, Weddings): Polished, professional, hospitality-focused. Offer site visit and date check.
- Category D (Equipment Rental, Tents, Catering): Practical, solution-oriented. Quote genuine inventory rates.
- Category E (General/Fallback): Approachable, offer human callback.

VERIFIED GROUND-TRUTH RATES:
- Catering (>500 guests: Veg ₹650/pp, Non-Veg ₹850/pp | 250-500 guests: Full Veg ₹750/pp, Semi ₹250/pp | <250 guests: custom). Starters served for 2 to 2.5 hours only.
- Rentals: Highback Banquet Chair ₹70, VIP Chair ₹50, PVC Chair ₹20, Maharaja Sofa ₹600, Center Table ₹300, Mez Table ₹80, Round Table ₹150-₹200, Takhat ₹80, Gadda ₹60, Red/3D Carpet ₹2/sq.ft.
- Packages: Standard Wedding ₹50,000, Grand Royal Setup ₹1,10,000.
`;

    const chatHistory = messages.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    chatHistory.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: intentInfo.category === 'A' ? 0.2 : 0.7
      }
    });

    if (response && response.text) {
      return response.text.trim();
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
  availableGallery = [],
  pageContext = {}
}) => {
  // 1. Intent Classification
  const intentInfo = classifyIntent(userText, pageContext);

  // 2. Extract and accumulate slots
  const collectedState = extractSlots(userText, currentState);

  // 3. Exactly 5 photos when gallery category is requested
  let galleryImages = [];
  let categoryName = intentInfo.galleryCategory;

  if (intentInfo.intent === 'gallery_request' || categoryName) {
    const targetCat = categoryName || normalizeGalleryCategory(userText) || 'Dwarka Shri Lawn venue and grounds';
    let matches = availableGallery.filter(item => 
      item.category && item.category.toLowerCase() === targetCat.toLowerCase()
    );
    if (matches.length < 5) {
      const broader = availableGallery.filter(item => 
        (item.title && item.title.toLowerCase().includes(targetCat.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(targetCat.toLowerCase()))
      );
      for (const b of broader) {
        if (!matches.some(m => m.id === b.id)) matches.push(b);
      }
    }
    if (matches.length < 5) {
      for (const b of availableGallery) {
        if (!matches.some(m => m.id === b.id)) {
          matches.push(b);
          if (matches.length >= 5) break;
        }
      }
    }
    galleryImages = matches.slice(0, 5);
    categoryName = targetCat;
  }

  // 4. Generate Assistant Response
  let assistantText = await callGeminiModel({
    messages: conversationHistory,
    userText,
    intentInfo,
    collectedState,
    galleryImages
  });

  let actionSuggestions = [];
  let isUrgent = false;

  const nlpResponse = generateConversationalResponse({
    userText,
    intentInfo,
    collectedState,
    galleryImages,
    pageContext
  });

  if (!assistantText) {
    assistantText = nlpResponse.text;
  }
  actionSuggestions = nlpResponse.actionSuggestions || [];
  isUrgent = nlpResponse.isUrgent || intentInfo.isUrgent || false;

  return {
    assistantText,
    intent: intentInfo.intent,
    category: intentInfo.category,
    label: intentInfo.label,
    galleryCategory: categoryName,
    galleryImages,
    collectedState,
    actionSuggestions,
    isUrgent
  };
};

module.exports = {
  processChatMessage,
  classifyIntent,
  extractSlots,
  normalizeGalleryCategory
};
