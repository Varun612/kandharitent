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

  // Equipment / furniture rental rates
  if (
    lower.includes('chair') || lower.includes('kursi') || lower.includes('sofa') ||
    lower.includes('table') || lower.includes('mez') || lower.includes('carpet') ||
    lower.includes('takhat') || lower.includes('gadda') || lower.includes('drum') ||
    (lower.includes('rent') && !lower.includes('tent'))
  ) {
    return { intent: 'equipment_rates', category: 'Seating and furniture arrangements' };
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
  
  const textTrimmed = (userText || '').trim();
  const lower = textTrimmed.toLowerCase();

  // Natural greeting and casual conversation
  const isGreeting = /^(hi|hello|hey|namaste|pranam|good\s*(morning|afternoon|evening)|kaise\s*ho|how\s*are\s*you)/i.test(lower);
  if (isGreeting && textTrimmed.length < 25) {
    if (isHindi && !lower.includes('how are you')) {
      return "Namaste! Main badhiya hoon, shukriya! Aaj main aapke event planning me kis tarah madad kar sakta hoon?";
    }
    return "I'm doing well, thank you! How may I help you plan your event today?";
  }

  // Clarifying question on broad chair requests (e.g. "I need chairs for a wedding")
  const isBroadChairRequest = (lower.includes('chair') || lower.includes('kursi')) && 
                              (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('need') || lower.includes('chahiye')) &&
                              !textTrimmed.match(/\b\d{2,4}\b/);
  if (isBroadChairRequest) {
    return "Approximately how many guests are you expecting? I can help you explore suitable chair options and prepare a rental enquiry.";
  }

  // Follow-up to guest count (e.g. "Around 300")
  const isGuestCountFollowUp = textTrimmed.match(/(?:around|approx|about|lagbhag)?\s*(\d{2,4})\s*(?:guests?|log|people|pax)?$/i);
  if (isGuestCountFollowUp && (lower.includes('around') || lower.includes('approx') || lower.includes('about') || lower.includes('300'))) {
    const count = parseInt(isGuestCountFollowUp[1], 10);
    return `Great. I'll help you compare suitable options for approximately ${count} guests. Do you have a preferred chair style, or would you like to see the available options first?`;
  }

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

  // Case 2: Catering Menu & Pricing
  if (intent === 'catering_menu') {
    if (isHindi) {
      return `Kandhari Tent & Caterers me Awadhi Banqueting hamare printed brochure ke 17 courses me provide ki jaati hai (Welcome Drinks, Soups, Live Chaat, Tandoor Barbecue, Handi Paneer, Raita, Breads aur 2 Garam Desserts jaise Kesaria Jalebi-Rabri).

Hamare tiered catering rates:
• **Above 500 Guests**: Grand Veg Platter @ ₹650/vyakti | Grand Non-Veg Platter @ ₹850/vyakti
• **250–500 Guests**: Royal Full Catering @ ₹750/vyakti (Veg) | Standard Semi Catering @ ₹250/vyakti
• **Under 250 Guests**: Agar guests kam hote hain to per-plate rate badhta hai aur chune hue menu par nirbhar karta hai.
• **Service Rule**: Brochure ke niyam ke anusaar sabhi snacks aur starters 2 se 2.5 ghante ke liye hi serve kiye jaate hain. Generator diesel client dwara diya jata hai.

Aap kis event date aur kitne guests ke liye menu plan kar rahe hain?`;
    }
    return `At Kandhari Tent & Caterers, our banqueting covers 17 printed brochure courses (Welcome Drinks, Soups, Live Lucknowi Chaat, Barbecue Tandoor, Handi Paneer, Subziyan, Breads, Salad Bar, and Hot Desserts like Kesaria Jalebi with Rabri).

Our tiered catering rates:
• **Above 500 Guests**: Grand Veg Platter @ ₹650 / person | Grand Non-Veg Platter @ ₹850 / person
• **250 to 500 Guests**: Royal Full Catering @ ₹750 / person (Veg) | Standard Semi Catering @ ₹250 / person
• **Under 250 Guests / Custom**: As guest count decreases, per-plate price increases and varies based on specific menu courses.
• **Official Brochure Rule**: All snacks & starters are served strictly for 2 to 2.5 hours only. Generator diesel to be provided by client.

What event date and estimated guest count are you planning for?`;
  }

  // Case 2.5: Equipment Rental Rates
  if (intent === 'equipment_rates') {
    if (isHindi) {
      return `Kandhari Tent House ki verified per-unit rental rates niche di gayi hain:
• **Chairs**: Highback Banquet Chair ₹70 | VIP Chair ₹50 | PVC Chair ₹20
• **Sofas & Tables**: Maharaja 2-Seater Sofa ₹600 | Center Table ₹300 | Mez Set (2.5x5) ₹80 | Round Table ₹150–₹200
• **Others**: Takhat ₹80 | Gadda ₹60 | Drum ₹100 | Red/3D Carpet ₹2/sq.ft

Aapko apne event ke liye kitni chairs, sofas ya tables ki zaroorat hai?`;
    }
    return `Here are our official per-unit equipment rental rates from our warehouse:
• **Chairs**: Highback Banquet Chair: ₹70 | VIP Chair: ₹50 | PVC Chair: ₹20
• **Sofas & Tables**: Maharaja 2-Seater Sofa: ₹600 | Center Table: ₹300 | Mez Table Set (2.5×5 ft): ₹80 | Round Table with Cover: ₹150–₹200
• **Bedding & Ground**: Takhat: ₹80 | Gadda (Mattress): ₹60 | Drum: ₹100 | Red/3D Carpet: ₹2 / sq.ft

How many chairs, sofas, or tables would you like to reserve for your event?`;
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
      return `Kandhari Tent & Caterers ke official verified booking packages:
• **Catering Packages**: >500 pax: Veg @ ₹650/vyakti | Non-Veg @ ₹850/vyakti; 250–500 pax: Full Catering @ ₹750/vyakti | Semi Catering @ ₹250/vyakti; < 250 pax par custom quote (rate increases for smaller pax).
• **Standard Wedding Package (₹50,000)**: Complete waterproof tent canopy + lighting + fresh flower entrance/stage decor + DJ sound setup.
• **Grand Royal Wedding Setup (₹1,10,000)**: Signature Kanpur Road setup jisme 20x200 ft illuminated gallery, 14 Maharaja Sofas, 200 Highback Chairs, 16x24 ft Royal Stage, 16x16 ft Mandap, 2 Welcome Gates aur DJ shamil hai.
• **Govt Contractors**: DRDO Lucknow approved seminar setup with 18% GST billing.

Aap apne event ke liye kaun sa package explore karna chahenge?`;
    }
    return `Here are our official verified event packages from Kandhari Tent & Caterers:
• **Catering Packages**: >500 pax: Veg @ ₹650/person | Non-Veg @ ₹850/person; 250–500 pax: Royal Full @ ₹750/person | Semi Catering @ ₹250/person; < 250 pax: custom quotation (rate varies with menu).
• **Standard Wedding Package**: ₹50,000 all-inclusive (Waterproof Tent + Ambient Illumination + Fresh Flower Decor + DJ Sound).
• **Grand Royal Wedding Setup**: ₹1,10,000 all-inclusive (VIP 20×200 ft gallery with lights & flowers, 14 Maharaja Sofas, 200 Highback Chairs with covers, 16×24 ft Stage, 16×16 ft Mandap, 2 Entrance Gates, DJ).
• **Approved Government Contractors**: D.R.D.O. Lucknow approved seminar setups with official 18% GST invoices.

Which package or setup best aligns with your celebration?`;
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
Official Support: Direct online quotation, consultation booking, or official business customer support line. Never expose private or personal numbers.
Tagline: "Making Your Celebrations Memorable".

OFFICIAL VERIFIED RATES & PACKAGES (QUOTE CONFIDENTLY WHEN ASKED):
1. Tiered Catering Packages (Awadhi Banqueting across 17 printed brochure courses):
   - Above 500 guests: Grand Veg Platter @ ₹650 / person | Grand Non-Veg Platter @ ₹850 / person.
   - 250 to 500 guests: Royal Full Catering @ ₹750 / person (Veg) | Standard Semi Catering @ ₹250 / person.
   - Under 250 guests: Per-plate rate increases for smaller guest counts and varies based on selected dishes.
   - Official Service Rule: All snacks & starters are served strictly for 2 to 2.5 hours only. Generator diesel provided by client.
2. Complete Wedding Packages:
   - Standard Wedding Package: ₹50,000 all-inclusive (Waterproof Tent + Ambient Illumination + Fresh Flower Decor + DJ Sound Setup).
   - Grand Royal Wedding Setup (Kanpur Road Benchmark): ₹1,10,000 all-inclusive (20×200 ft illuminated passage gallery, 14 Maharaja 2-seater sofas, 200 Highback chairs with covers, round tables, grand 16×24 ft stage, 16×16 ft mandap, 2 entrance gates, DJ).
3. Equipment Rentals (Per-Unit Verified Rates):
   - Highback Chair: ₹70 | VIP Chair: ₹50 | PVC Chair: ₹20
   - Maharaja 2-Seater Sofa: ₹600 | Center Table: ₹300
   - Mez Table Set (2.5×5 ft): ₹80 | Round Table with Cover: ₹150–₹200
   - Takhat: ₹80 | Gadda (Mattress): ₹60 | Drum: ₹100 | Red/3D Carpet: ₹2 / sq.ft
4. Institutional / Government Credentials:
   - Approved Government Contractors for Defence Research & Development Organisation (DRDO Lucknow). Seminars, heavy truss staging, podiums, ceremonial brass lamps, cordless audio, and 80+ LED par setups available with official 18% GST billing.

CRITICAL CONVERSATIONAL GUIDELINES:
1. Speak in English or Hindi/Hinglish depending on the customer's language. Use respectful Indian hospitality etiquette (e.g., Namaste, Ji).
2. Quote the verified rates above accurately. Never invent arbitrary unverified prices.
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
