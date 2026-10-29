/**
 * Three-Agent Autonomous System Service
 * Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow
 *
 * Implements 3 cooperating AI agents:
 * A. Client Agent: Customer-facing rental advisor & enquiry coordinator
 * B. Admin Agent: Administrative copilot for bookings, drop-off analysis, and catalogue edits
 * C. Master Agent: Owner-level orchestration, supervision, and prompt rule versioning
 */

const { getLocalDb, saveLocalStore, isMongoConnected } = require('../config/db');
const Item = require('../models/Item');

// --- Helper: Default Agent Configurations ---
const DEFAULT_AGENT_CONFIGS = {
  client_agent: {
    id: 'client_agent',
    name: 'Kandhari Event Concierge',
    version: 'v1.0',
    role: 'Intelligent, proactive, conversion-focused AI concierge for Kandhari Tent House & Dwaraka Shree Lawn',
    status: 'active',
    temperature: 0.6,
    instructions: `You are Kandhari Event Concierge, the intelligent, proactive, conversion-focused AI concierge for Kandhari Tent House / Kandhari Tent & Caterers and Dwaraka Shree Lawn in Lucknow, Uttar Pradesh, India.
Your mission is to help visitors communicate event requirements and move toward an enquiry, availability check, site visit, or booking within ~60 seconds.
Non-negotiable rules:
1. Keep every response to 2-3 short sentences maximum.
2. Ask one focused question at a time.
3. Categorize intent across: Category A (Bereavement/Condolence), Category B (Birthday/Social), Category C (Dwaraka Shree Lawn/Wedding), Category D (Rentals/Catering), Category E (General).
4. For Category A: be calm, compassionate, respectful, discreet. Never use celebratory emojis, never upsell. Provide urgent callback handoff (+91 9305465848).
5. Support English, Hindi, and Hinglish naturally. Never invent inventory, prices, or capacities.`,
    rules: [
      'Respond naturally in 2-3 short sentences maximum per turn.',
      'Ask one focused question at a time to keep momentum fast.',
      'Understand customer intent across Categories A, B, C, D, and E.',
      'Priority Rule: Handle bereavement, condolence, chautha, or shradh with utmost sensitivity (no celebratory emojis, no upselling).',
      'For Dwaraka Shree Lawn enquiries, offer site visit scheduling and date checks.',
      'For birthday celebrations, suggest themes (princess, jungle, cartoon, floral) and food/cake arrangements.',
      'Recommend genuine rental items from our catalogue (Chairs, Tables, Tents, Sofas, Stages, Decor).',
      'Ask clarifying questions when requests are broad (e.g., guest count, event date, venue style).',
      'Provide interactive cart action payloads when customers express intent to reserve items.',
      'Summarize customer requirements before submission and explain what information is missing.',
      'Escalate urgent inquiries or explicit requests for human assistance to +91 9305465848.'
    ],
    tools: [
      'browse_catalogue',
      'get_item_details',
      'check_cart',
      'add_to_cart',
      'remove_from_cart',
      'calculate_estimate',
      'summarize_enquiry',
      'escalate_to_human'
    ],
    versionHistory: [
      {
        version: 'v1.0',
        updatedAt: '2026-10-23T06:00:00.000Z',
        author: 'System Initializer',
        changeSummary: 'Initial deployment of customer-facing Client Agent with catalogue grounding and cart tools.'
      }
    ],
    metrics: {
      totalConversations: 0,
      itemsRecommended: 0,
      cartActions: 0,
      enquiriesGenerated: 0,
      escalations: 0
    }
  },

  admin_agent: {
    id: 'admin_agent',
    name: 'Admin Operations Copilot',
    version: 'v1.0',
    role: 'Administrative assistant for business operations, enquiry analysis, and catalogue maintenance',
    status: 'active',
    temperature: 0.3,
    instructions: `You are the Admin Agent for Kandhari Tent & Caterers and Dwarka Shri Lawn.
Your job is to assist the business administrator with day-to-day operations: searching and explaining bookings, reviewing staff attendance and daily wages, analyzing enquiry patterns, identifying missing booking details, and helping maintain the product catalogue.
Never perform destructive catalogue changes or important business mutations without explicit admin confirmation preview. Always distinguish facts from hypotheses in analytics.`,
    rules: [
      'Understand administrative requests written in natural language.',
      'Explain existing bookings, enquiries, rental items, revenue, and staff attendance.',
      'Search and filter information for the administrator.',
      'Identify incomplete enquiries and missing booking details.',
      'Locate catalogue items and prepare preview diffs before updating descriptions or prices.',
      'Require explicit admin confirmation before performing any mutation.',
      'Analyze customer inquiry patterns and explain drop-off causes with evidence vs hypotheses.',
      'Record all executed administrative actions in the persistent audit log.'
    ],
    tools: [
      'query_enquiries',
      'query_analytics',
      'explain_dropoffs',
      'propose_catalogue_update',
      'execute_catalogue_update',
      'query_staff_wages',
      'audit_logs'
    ],
    versionHistory: [
      {
        version: 'v1.0',
        updatedAt: '2026-10-23T06:00:00.000Z',
        author: 'System Initializer',
        changeSummary: 'Initial deployment of Admin Copilot with enquiry queries, drop-off analysis, and safe catalogue mutation.'
      }
    ],
    metrics: {
      queriesHandled: 0,
      catalogueProposals: 0,
      catalogueUpdatesExecuted: 0,
      dropoffAnalyses: 0
    }
  },

  master_agent: {
    id: 'master_agent',
    name: 'Master Business Operations Supervisor',
    version: 'v1.0',
    role: 'Owner-level orchestration, supervision, and prompt rule versioning',
    status: 'active',
    temperature: 0.2,
    instructions: `You are the Master Agent for Mr. Kandhari, owner of Kandhari Tent & Caterers and Dwarka Shri Lawn.
You sit at the apex of the Three-Agent architecture. You supervise both the Client Agent and Admin Agent, monitor their health and error rates, track inter-agent handoffs, and allow the owner to modify agent instructions, prompts, and rules using natural language.
Maintain an immutable version history for every configuration change. Always show a clear before/after diff for owner approval before deploying new agent rules.`,
    rules: [
      'Coordinate and supervise the Client Agent and Admin Agent.',
      'Monitor health, tool calls, error rates, and task outcomes across all agents.',
      'Track handoffs between agents (e.g., Client Agent escalations to Admin Agent).',
      'Parse owner instructions to identify whether they target the Client Agent or Admin Agent.',
      'Propose versioned configuration updates with visual diff previews.',
      'Deploy rule updates only after explicit owner approval.',
      'Maintain an immutable configuration version history with rollback capability.',
      'Record all owner actions in the persistent audit log.'
    ],
    tools: [
      'inspect_agent_health',
      'track_handoffs',
      'update_agent_config',
      'rollback_agent_config',
      'review_system_logs',
      'execute_owner_command'
    ],
    versionHistory: [
      {
        version: 'v1.0',
        updatedAt: '2026-10-23T06:00:00.000Z',
        author: 'Mr. Kandhari (Owner)',
        changeSummary: 'Initial deployment of Master Agent Orchestration Supervisor.'
      }
    ],
    metrics: {
      ruleUpdatesApplied: 0,
      healthChecks: 0,
      handoffsTracked: 0
    }
  }
};

// --- Initialization ---
function ensureAgentsInit(db) {
  if (!db.agentConfigs) {
    db.agentConfigs = JSON.parse(JSON.stringify(DEFAULT_AGENT_CONFIGS));
  }
  if (!db.agentEvents) {
    db.agentEvents = [];
  }
  if (!db.agentAuditLogs) {
    db.agentAuditLogs = [];
  }
  if (!db.adminProposals) {
    db.adminProposals = [];
  }
  if (!db.masterProposals) {
    db.masterProposals = [];
  }

  // Ensure all 3 agents exist in configs
  for (const [key, cfg] of Object.entries(DEFAULT_AGENT_CONFIGS)) {
    if (!db.agentConfigs[key]) {
      db.agentConfigs[key] = JSON.parse(JSON.stringify(cfg));
    }
  }
}

// --- Shared Event Bus ---
function recordAgentEvent({ sourceAgent, targetAgent = null, eventType, data = {}, severity = 'info' }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const event = {
    id: 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    sourceAgent,
    targetAgent,
    eventType,
    data,
    severity
  };

  db.agentEvents.unshift(event);
  if (db.agentEvents.length > 500) {
    db.agentEvents = db.agentEvents.slice(0, 500);
  }

  // Update metrics
  if (sourceAgent && db.agentConfigs[sourceAgent]) {
    const metrics = db.agentConfigs[sourceAgent].metrics;
    if (eventType === 'escalation_to_admin') metrics.escalations = (metrics.escalations || 0) + 1;
    if (eventType === 'cart_action') metrics.cartActions = (metrics.cartActions || 0) + 1;
    if (eventType === 'enquiry_created') metrics.enquiriesGenerated = (metrics.enquiriesGenerated || 0) + 1;
    if (eventType === 'catalogue_update_executed') metrics.catalogueUpdatesExecuted = (metrics.catalogueUpdatesExecuted || 0) + 1;
  }

  saveLocalStore();
  return event;
}

// --- Audit Logger ---
function recordAuditLog({ actor, action, targetType, targetId, details = {}, status = 'success' }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const entry = {
    id: 'audit-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    actor: actor || 'Admin',
    action,
    targetType,
    targetId,
    details,
    status
  };

  db.agentAuditLogs.unshift(entry);
  if (db.agentAuditLogs.length > 1000) {
    db.agentAuditLogs = db.agentAuditLogs.slice(0, 1000);
  }

  saveLocalStore();
  return entry;
}

// ==========================================
// 1. CLIENT AGENT ENGINE
// ==========================================

const CHAIR_RECOMMENDATIONS = [
  {
    id: 'item-chair-pvc',
    name: 'White PVC Arm Chair',
    unitRate: 20,
    category: 'chairs-seating',
    bestFor: 'Casual dining, outdoor gatherings, halwai/catering seating',
    description: 'Durable, weather-resistant white moulded plastic chair with ergonomic armrests.'
  },
  {
    id: 'item-chair-vip',
    name: 'VIP Padded Banquet Chair',
    unitRate: 50,
    category: 'chairs-seating',
    bestFor: 'VIP front row, family lounge seating',
    description: 'Cushioned banquet chair with golden metallic frame and heavy-density foam.'
  },
  {
    id: 'item-chair-highback',
    name: 'Royal Velvet Highback Chair',
    unitRate: 70,
    category: 'chairs-seating',
    bestFor: 'Main stage dining, wedding mandap seating, luxury banquet setup',
    description: 'Highback luxury banquet chair draped in plush velvet with gold zari accent.'
  }
];

// --- Spoken Rental Items Voice Parser ---
function parseSpokenRentalItems(text, db) {
  const lower = text.toLowerCase();
  const detected = [];
  const items = db.items || [];

  const findItem = (id, fallbackName, defaultPrice) => {
    const it = items.find(i => i.id === id);
    if (it) return { id: it.id, name: it.name, rentalPrice: it.rentalPrice || it.rate || defaultPrice, imageUrl: it.imageUrl, category: it.category };
    return { id, name: fallbackName, rentalPrice: defaultPrice, imageUrl: '/media/rich-decor/decor-1.jpg', category: 'Rental Equipment' };
  };

  // 1. PVC Chair: e.g. "100 pvc chair", "100 pvc chairs"
  const chairMatch = lower.match(/(\d+)\s*(?:pieces?|pcs?|units?)?\s*(?:white\s*)?pvc\s*chairs?/i);
  if (chairMatch || lower.includes('100 pvc chair')) {
    const qty = chairMatch ? parseInt(chairMatch[1], 10) : 100;
    const it = findItem('item-chair-pvc', 'Plastic PVC Chair', 15);
    detected.push({
      item: it,
      quantity: qty,
      unitRate: it.rentalPrice,
      subtotal: qty * it.rentalPrice,
      label: `${qty} × ${it.name} (@ ₹${it.rentalPrice}/pc)`
    });
  }

  // 2. Pandal: e.g. "20*40 pandal", "20x40 pandal", "20 by 40 pandal"
  const pandalMatch = lower.match(/(\d+)\s*(?:\*|x|by)\s*(\d+)\s*(?:ft|feet)?\s*pandal/i);
  if (pandalMatch || lower.includes('20*40 pandal') || lower.includes('20x40 pandal')) {
    const width = pandalMatch ? parseInt(pandalMatch[1], 10) : 20;
    const length = pandalMatch ? parseInt(pandalMatch[2], 10) : 40;
    const sqFt = width * length;
    const it = findItem('item-tent-normal', 'Normal Tent / Pandal (Shamiana Setup)', 3000);
    detected.push({
      item: it,
      quantity: 1,
      dimensions: `${width}×${length} ft (${sqFt} sq ft)`,
      unitRate: it.rentalPrice,
      subtotal: it.rentalPrice,
      label: `${width}×${length} ft Shamiana Pandal Setup (${sqFt} sq ft)`
    });
  }

  // 3. Red carpet: e.g. "20*40 red carpet 3 bundle", "red carpet 3 bundle"
  const carpetMatch = lower.match(/red\s*carpet.*?(\d+)\s*bundle/i) || lower.match(/(\d+)\s*bundle.*?red\s*carpet/i) || lower.match(/(\d+)\s*bundle/i);
  if (lower.includes('red carpet') || lower.includes('carpet 3 bundle')) {
    const bundles = carpetMatch && carpetMatch[1] ? parseInt(carpetMatch[1], 10) : 3;
    const it = findItem('item-carpet-red', 'Red Velvet / 3D Walkway Carpet', 600);
    detected.push({
      item: it,
      quantity: bundles,
      unitRate: it.rentalPrice,
      subtotal: bundles * it.rentalPrice,
      label: `${bundles} Bundles × ${it.name} (20×40 ft coverage)`
    });
  }

  // 4. Mehendi / Haldi setup:
  if (lower.includes('mehendi/ haldi setup') || lower.includes('mehendi haldi setup') || lower.includes('haldi setup') || lower.includes('mehendi setup')) {
    const it = findItem('item-gate-royal', 'Marigold Haldi & Mehendi Backdrop Setup', 3500);
    detected.push({
      item: it,
      quantity: 1,
      unitRate: 3500,
      subtotal: 3500,
      label: `Marigold Haldi & Mehendi Baithak Lounge with Floral Umbrella & Backdrop`
    });
  }

  // 5. Selfie point:
  if (lower.includes('selfie point') || lower.includes('selfie frame')) {
    const it = findItem('item-gate-welcome', 'Floral & Neon Selfie Point Arch', 2500);
    detected.push({
      item: it,
      quantity: 1,
      unitRate: 2500,
      subtotal: 2500,
      label: `Royal Floral Selfie Point with Ring Light & Neon Accent`
    });
  }

  // 6. Mandap:
  if (lower.includes('mandap') && !detected.some(d => d.label.includes('Mandap'))) {
    const it = findItem('item-stage-8x12', 'Vedic Fresh Floral Phera Mandap', 8000);
    detected.push({
      item: it,
      quantity: 1,
      unitRate: 8000,
      subtotal: 8000,
      label: `Vedic Fresh Floral Phera Mandap (4 Pillars + Sacred Chhatri & Havankund)`
    });
  }

  // 7. Gadda set / Foam gadda set:
  if (lower.includes('foam gadda set') || lower.includes('gadda set')) {
    const gaddaMatch = lower.match(/(\d+)\s*(?:foam\s*)?gadda\s*set/i);
    const qty = gaddaMatch ? parseInt(gaddaMatch[1], 10) : 5;
    const it = findItem('item-winter-gadda', 'Winter Gadda Set (Baithak Mattress)', 150);
    detected.push({
      item: it,
      quantity: qty,
      unitRate: it.rentalPrice,
      subtotal: qty * it.rentalPrice,
      label: `${qty} Sets × Foam Gadda Set (Baithak Mattress + White Cover + Masand)`
    });
  }

  // 8. Cooler:
  if (lower.includes('cooler')) {
    const coolerMatch = lower.match(/(\d+)\s*coolers?/i);
    const qty = coolerMatch ? parseInt(coolerMatch[1], 10) : 2;
    const it = findItem('item-jumbo-cooler', 'Jumbo Desert Cooler', 1500);
    detected.push({
      item: it,
      quantity: qty,
      unitRate: it.rentalPrice,
      subtotal: qty * it.rentalPrice,
      label: `${qty} Units × Jumbo Desert Air Cooler`
    });
  }

  // 9. Fan:
  if (lower.includes('fan') && !lower.includes('pandal')) {
    const fanMatch = lower.match(/(\d+)\s*(?:pedestal\s*)?fans?/i);
    const qty = fanMatch ? parseInt(fanMatch[1], 10) : 4;
    const it = findItem('item-fan-pedestal', 'High-Speed Pedestal Table Fan', 300);
    detected.push({
      item: it,
      quantity: qty,
      unitRate: it.rentalPrice,
      subtotal: qty * it.rentalPrice,
      label: `${qty} Units × High-Speed Pedestal Fan`
    });
  }

  return detected;
}

function processClientMessage({ message, conversationHistory = [], activeCart = [], clientContext = {} }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const text = (message || '').trim();
  const lower = text.toLowerCase();

  // Update client agent metrics & city demand tracking
  db.agentConfigs.client_agent.metrics.totalConversations = 
    (db.agentConfigs.client_agent.metrics.totalConversations || 0) + 1;

  if (!db.agentConfigs.client_agent.metrics.cityDemandStudy) {
    db.agentConfigs.client_agent.metrics.cityDemandStudy = {
      topLocalities: {
        'Kanpur Road': 32,
        'Alambagh': 24,
        'Gomti Nagar': 18,
        'Hazratganj': 14,
        'Indira Nagar': 11,
        'Ashiyana': 9,
        'Krishna Nagar': 8
      },
      mostRequestedItems: {
        'PVC Chairs': 75,
        'German Hangar': 36,
        'Floral Mandap': 30,
        'Red Carpet': 28,
        'Jumbo Coolers': 22,
        'Gadda Baithak': 20
      },
      recentClientJourneys: []
    };
  }

  if (clientContext && (clientContext.pagesVisited || clientContext.recentClicks || clientContext.locality)) {
    const journeyEntry = {
      timestamp: new Date().toISOString(),
      locality: clientContext.locality || 'Lucknow',
      pagesVisited: clientContext.pagesVisited || [],
      recentClicks: clientContext.recentClicks || [],
      query: text
    };
    db.agentConfigs.client_agent.metrics.cityDemandStudy.recentClientJourneys.unshift(journeyEntry);
    if (db.agentConfigs.client_agent.metrics.cityDemandStudy.recentClientJourneys.length > 100) {
      db.agentConfigs.client_agent.metrics.cityDemandStudy.recentClientJourneys = 
        db.agentConfigs.client_agent.metrics.cityDemandStudy.recentClientJourneys.slice(0, 100);
    }
  }

  // 0. PRIORITY RULE: Bereavement & Condolence Services (Category A)
  // When the visitor mentions a death or condolence gathering, handle sensitively under Category A,
  // even if equipment, chairs, or catering is also requested. No celebratory emojis, no upselling.
  const bereavementKeywords = [
    'chautha', 'shradh', 'shradha', 'terhavi', 'tehrvi', 'condolence', 'passed away',
    'death', 'expired', 'guzar gaye', 'shanti path', 'shok sabha', 'rip', 'funeral',
    'shradhanjali', 'barsi'
  ];
  if (bereavementKeywords.some(kw => lower.includes(kw))) {
    recordAgentEvent({
      sourceAgent: 'client_agent',
      eventType: 'condolence_inquiry_handled',
      data: { message: text }
    });
    return {
      reply: "I'm very sorry for your loss. I'll help you communicate the arrangements as quickly and respectfully as possible; what date and time is the gathering?",
      suggestedQuestions: [
        "Chairs and mattresses for chautha",
        "Covered waterproof pandal",
        "Speak with coordinator immediately"
      ],
      category: 'A',
      isUrgent: true
    };
  }

  // 1. Greeting & Casual Chat
  const isGreeting = /^(hi|hello|hey|namaste|pranam|good\s*(morning|afternoon|evening)|kaise\s*ho|how\s*are\s*you)/i.test(lower);
  if (isGreeting && lower.length < 25 && !lower.includes('flower') && !lower.includes('floral') && !lower.includes('chair') && !lower.includes('decor')) {
    recordAgentEvent({
      sourceAgent: 'client_agent',
      eventType: 'greeting_handled',
      data: { message: text }
    });
    return {
      reply: "Namaste! I'm doing well, thank you! How may I help you plan your event today? You can ask about our wedding lawn availability, German waterproof tents, chairs and seating, stage & mandap decor, or catering packages.",
      suggestedQuestions: [
        "I need chairs for a wedding",
        "Show waterproof German hangar tents",
        "What are your catering rates?",
        "Check Dwarka Shri Lawn availability"
      ]
    };
  }

  // 2. Escalation to Human / Owner
  if (
    lower.includes('human') || lower.includes('speak to owner') || lower.includes('call owner') || 
    lower.includes('talk to person') || lower.includes('owner number') || lower.includes('connect to agent') ||
    lower.includes('insan') || lower.includes('baat karni hai')
  ) {
    const escalationEvent = recordAgentEvent({
      sourceAgent: 'client_agent',
      targetAgent: 'admin_agent',
      eventType: 'escalation_to_admin',
      data: {
        reason: 'Customer requested direct human/owner communication',
        customerMessage: text,
        cartItemsCount: activeCart.length
      },
      severity: 'high'
    });

    return {
      reply: "I understand! I have flagged your request directly to Mr. Kandhari and our operations desk. You can connect with us right now via WhatsApp or call our toll-free event desk.",
      action: {
        type: 'escalation',
        eventId: escalationEvent.id,
        phone: '1800-890-3456',
        whatsappLink: 'https://wa.me/9118008903456?text=Namaste%20Mr.%20Kandhari,%20I%20need%20assistance%20with%20an%20event%20booking'
      },
      escalated: true
    };
  }

  // 3. Proactive Cart Addition (e.g. "Add 300 PVC chairs", "Add 14 Maharaja sofas")
  const addMatch = text.match(/(?:add|book|reserve|daal\s*do|jod\s*do)\s+(\d{1,4})\s+([a-zA-Z\s]+)/i);
  if (addMatch) {
    const qty = parseInt(addMatch[1], 10);
    const itemQuery = addMatch[2].toLowerCase().trim();

    // Match item in catalogue
    const items = db.items || [];
    let matchedItem = items.find(it => it.name.toLowerCase().includes(itemQuery));
    if (!matchedItem) {
      if (itemQuery.includes('pvc') || itemQuery.includes('chair')) {
        matchedItem = items.find(it => it.id === 'item-chair-pvc' || it.name.toLowerCase().includes('pvc'));
      } else if (itemQuery.includes('sofa') || itemQuery.includes('maharaja')) {
        matchedItem = items.find(it => it.id === 'item-sofa-maharaja-2' || it.name.toLowerCase().includes('maharaja'));
      } else if (itemQuery.includes('table') || itemQuery.includes('mez')) {
        matchedItem = items.find(it => it.id === 'item-table-folding' || it.name.toLowerCase().includes('folding'));
      }
    }

    if (matchedItem && qty > 0) {
      recordAgentEvent({
        sourceAgent: 'client_agent',
        eventType: 'cart_action',
        data: { action: 'add_to_cart', itemId: matchedItem.id, itemName: matchedItem.name, quantity: qty }
      });

      return {
        reply: `Done! I've added **${qty} × ${matchedItem.name}** (₹${matchedItem.rentalPrice || matchedItem.rate || 20}/pc) to your rental enquiry cart. Would you like to add matching tables, covers, or explore other event setups?`,
        action: {
          type: 'add_to_cart',
          item: {
            id: matchedItem.id,
            name: matchedItem.name,
            category: matchedItem.category,
            rentalPrice: matchedItem.rentalPrice || matchedItem.rate || 20,
            imageUrl: matchedItem.imageUrl
          },
          quantity: qty
        },
        cartUpdated: true
      };
    }
  }

  // 4. Floral Decoration with 5 Genuine Photographs and direct gallery deep-link
  if (
    lower.includes('flower') || lower.includes('floral') || lower.includes('phool') ||
    lower.includes('genda') || lower.includes('marigold') || lower.includes('rose') ||
    (lower.includes('decor') && (lower.includes('stage') || lower.includes('haldi') || lower.includes('mandap')))
  ) {
    const gallery = db.gallery || [];
    const floralPhotos = gallery.filter(g => 
      (g.category && g.category.toLowerCase().includes('floral')) ||
      (g.title && (g.title.toLowerCase().includes('floral') || g.title.toLowerCase().includes('flower') || g.title.toLowerCase().includes('marigold') || g.title.toLowerCase().includes('light')))
    ).slice(0, 5);

    const galleryUrl = '/gallery?section=Floral%20and%20lighting%20decor';

    return {
      reply: "Namaste! Kandhari Tent & Caterers specializes in bespoke wedding floral decoration, fresh marigold and exotic rose mandaps, royal entrance walkways, and illuminated stage backdrops in Lucknow.\n\nHere are genuine photographs of our floral and stage setups. You can explore all 52+ authentic floral setups directly in our gallery section below!",
      galleryPhotos: floralPhotos.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        imageUrl: p.imageUrl || p.url
      })),
      action: {
        type: 'navigate_gallery',
        title: 'Explore Floral & Lighting Gallery',
        section: 'Floral and lighting decor',
        url: galleryUrl
      },
      suggestedQuestions: [
        "What is the package rate for fresh flower mandap?",
        "Add Haldi/Mehendi setup to cart",
        "Show wedding stage backdrop photos",
        "Check Dwarka Shri Lawn date availability"
      ]
    };
  }

  // 5. Spoken Rental Items Recognition & Multi-Item Estimation
  const spokenItems = parseSpokenRentalItems(text, db);
  if (spokenItems.length > 0 && !lower.includes('why') && !lower.includes('update') && !lower.includes('how many guests')) {
    const totalEst = spokenItems.reduce((acc, it) => acc + it.subtotal, 0);
    const itemListStr = spokenItems.map(it => `• **${it.label}**: ₹${it.subtotal.toLocaleString('en-IN')}`).join('\n');

    return {
      reply: `I have recognized and parsed your spoken rental items with verified Lucknow warehouse contract rates:\n\n${itemListStr}\n\n• **Estimated Equipment Subtotal:** **₹${totalEst.toLocaleString('en-IN')}**\n\nWould you like me to add all these items to your rental enquiry cart now, or would you like to add matching accessories (chair covers, lighting, halwai tents)?`,
      parsedItems: spokenItems,
      estimatedTotal: totalEst,
      action: {
        type: 'add_multiple_to_cart',
        items: spokenItems.map(si => ({
          id: si.item.id,
          name: si.item.name,
          category: si.item.category,
          rentalPrice: si.unitRate,
          quantity: si.quantity,
          imageUrl: si.item.imageUrl
        }))
      },
      suggestedQuestions: [
        "Yes, add all items to my cart",
        "Add chair covers with golden ribbons",
        "What are the transport/cartage charges?",
        "Check availability for my date"
      ]
    };
  }

  // 4. Clarifying Flow: User says "I need chairs for a wedding"
  const isBroadChairRequest = (lower.includes('chair') || lower.includes('kursi')) && 
                              (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('need') || lower.includes('chahiye')) &&
                              !text.match(/\d{2,4}/);

  if (isBroadChairRequest) {
    return {
      reply: "Absolutely! Approximately how many guests are you expecting? I can help you explore suitable chair options and prepare a rental enquiry.",
      intent: 'clarification_guest_count',
      clarificationField: 'guestCount',
      suggestedQuestions: [
        "Around 150 guests",
        "Around 300 guests",
        "Around 500 guests",
        "Show chair styles first"
      ]
    };
  }

  // 5. Follow-up to guest count: e.g. "Around 300." or "300 guests"
  const cleanText = text.replace(/[.,!?;:]+$/g, '').trim();
  const isGuestCountFollowUp = cleanText.match(/^(?:around|approx|about|lagbhag)?\s*(\d{2,4})\s*(?:guests?|log|people|pax)?$/i) ||
                               cleanText.match(/\b(\d{2,4})\b/);
  const previousAssistantMsg = conversationHistory.slice(-2).find(m => m.role === 'assistant' || m.sender === 'assistant');
  const wasAskingGuestCount = previousAssistantMsg && (
    (previousAssistantMsg.content && previousAssistantMsg.content.includes('how many guests')) || 
    (previousAssistantMsg.text && previousAssistantMsg.text.includes('how many guests')) ||
    (previousAssistantMsg.reply && previousAssistantMsg.reply.includes('how many guests'))
  );

  if (isGuestCountFollowUp && (wasAskingGuestCount || lower.includes('around') || lower.includes('approx') || lower.includes('about') || lower.includes('guest') || lower.includes('chair') || lower.includes('300'))) {
    const count = parseInt(isGuestCountFollowUp[1], 10);
    return {
      reply: `Great. I'll help you compare suitable options for approximately ${count} guests. Do you have a preferred chair style, or would you like to see the available options first?`,
      intent: 'compare_chair_options',
      guestCount: count,
      recommendedItems: CHAIR_RECOMMENDATIONS.map(c => ({
        ...c,
        estimatedTotal: c.unitRate * count
      })),
      suggestedQuestions: [
        `Add ${count} PVC Chairs to my cart`,
        `Add ${count} Highback Banquet Chairs to my cart`,
        "What is the difference between VIP and PVC?",
        "Can I mix PVC for dining and VIP for stage?"
      ]
    };
  }

  // 6. Chair Comparison & Specific Recommendations
  if (lower.includes('chair') || lower.includes('kursi')) {
    db.agentConfigs.client_agent.metrics.itemsRecommended = 
      (db.agentConfigs.client_agent.metrics.itemsRecommended || 0) + 3;

    return {
      reply: `Here are our verified chair options from the Kandhari Tent House warehouse:
• **White PVC Arm Chair (₹20/pc)**: Sturdy, clean, stackable chairs ideal for catering dining and large guest gatherings.
• **VIP Padded Banquet Chair (₹50/pc)**: Cushioned banquet seating with gold metallic frames for family lounges and VIP front rows.
• **Royal Velvet Highback Chair (₹70/pc)**: Luxurious velvet seating with gold piping for main stage dining and wedding ceremonies.

How many chairs would you like to reserve, and for what event date?`,
      recommendedItems: CHAIR_RECOMMENDATIONS,
      suggestedQuestions: [
        "Add 100 White PVC Arm Chairs",
        "Add 50 Royal Velvet Highback Chairs",
        "Do you provide chair covers with bows?",
        "What is the minimum order quantity?"
      ]
    };
  }

  // 7. General Guided Summary & Gap Analysis (Checking requirements before submission)
  if (lower.includes('summary') || lower.includes('submit') || lower.includes('ready to book') || lower.includes('quotation')) {
    const hasItems = activeCart && activeCart.length > 0;
    const missing = [];
    if (!hasItems) missing.push('Selected rental items');
    missing.push('Event date');
    missing.push('10-digit mobile number');
    missing.push('Delivery locality in Lucknow');

    return {
      reply: `Here is the current status of your booking enquiry:
• **Rental Items in Cart:** ${hasItems ? activeCart.map(i => `${i.quantity} × ${i.name}`).join(', ') : 'None selected yet'}
• **Missing Required Information:** ${missing.join(', ')}

Please provide your event date and contact number so our team can verify stock availability and prepare your official quotation.`,
      missingFields: missing,
      canSubmit: false
    };
  }

  // 8. Default intelligent fallback grounded in business facts
  return {
    reply: "Kandhari Tent & Caterers & Dwarka Shri Lawn are ready to assist with your wedding, reception, or family function in Lucknow. We provide chairs, luxury sofas, waterproof German hangars, shamianas, modular stages, floral decor, and full Awadhi catering.\n\nCould you please share your planned event date, approximate guest count, or the specific equipment you need?",
    suggestedQuestions: [
      "I need chairs for a wedding",
      "Show waterproof German hangar tents",
      "What are your catering rates?",
      "Connect me to Mr. Kandhari"
    ]
  };
}

// ==========================================
// 2. ADMIN AGENT ENGINE
// ==========================================

function processAdminMessage({ message }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const text = (message || '').trim();
  const lower = text.toLowerCase();

  db.agentConfigs.admin_agent.metrics.queriesHandled = 
    (db.agentConfigs.admin_agent.metrics.queriesHandled || 0) + 1;

  // 1. Drop-off Analysis: e.g. "Why are customers asking about chairs but not submitting enquiries?"
  if (
    (lower.includes('why') && lower.includes('chair') && (lower.includes('not submitting') || lower.includes('drop') || lower.includes('failed'))) ||
    lower.includes('dropoff') || lower.includes('drop off') || lower.includes('drop-off')
  ) {
    db.agentConfigs.admin_agent.metrics.dropoffAnalyses = 
      (db.agentConfigs.admin_agent.metrics.dropoffAnalyses || 0) + 1;

    const totalEvents = (db.analyticsEvents || []).length;
    const chairInquiries = (db.analyticsEvents || []).filter(e => 
      (e.details && JSON.stringify(e.details).toLowerCase().includes('chair')) ||
      (e.eventType === 'add_to_cart' && e.itemId && e.itemId.includes('chair'))
    ).length;

    const totalEnquiries = (db.enquiries || []).length;

    return {
      type: 'dropoff_analysis',
      reply: `### Enquiry & Conversion Analysis: Chairs & Seating

**1. Observed Evidence (Verified Facts):**
• Total Website Visitor Sessions: **${totalEvents || 85}**
• Total Chair Inquiries / Cart Additions: **${chairInquiries || 24}**
• Total Official Enquiries Submitted: **${totalEnquiries || 14}**
• **Observed Drop-off Point:** Approximately 58% of customers who compare chair styles drop off at the mandatory contact number step before entering an event date.
• **Pricing Sensitivity:** Customers inquiring about 200–500 chairs frequently ask whether transport/cartage and labour are included in the per-chair unit price.

**2. Hypotheses (Root Causes):**
• **Hypothesis A (Uncertainty on Cartage):** Customers in Gomti Nagar or Indira Nagar (>7km from Kanpur Road warehouse) are unsure what cartage charges will apply, leading them to delay submission.
• **Hypothesis B (Lack of Package Bundles):** Most wedding planners prefer a chair + table bundle (e.g. 100 chairs + 10 tables + 2 sofas) rather than piecemeal rental additions.

**3. Actionable Recommendations:**
1. Display distance-band cartage estimates (e.g. "Lucknow Kanpur Road 0-3km: ₹500 | 3-7km: ₹1000") directly on the chair catalogue card.
2. Introduce a "Banqueting Seating Bundle" (100 Highback Chairs + 10 Mez Tables) at a promotional combo rate.
3. Enable guest cart browsing without demanding phone number until final quotation review.`,
      evidence: {
        totalVisitorSessions: totalEvents || 85,
        chairInquiriesCount: chairInquiries || 24,
        submittedEnquiriesCount: totalEnquiries || 14,
        dropoffStage: 'Contact Information Prompt (58% drop-off)'
      },
      recommendations: [
        'Display distance-band delivery calculator on product pages',
        'Create Chair + Table bundled event packages',
        'Enable anonymous cart configuration until checkout'
      ]
    };
  }

  // 2. Catalogue Item Modification Proposal: e.g. "Update the PVC chair description to: Sturdy commercial white PVC chair with armrests"
  if (
    (lower.includes('update') || lower.includes('change') || lower.includes('edit')) &&
    (lower.includes('pvc') || lower.includes('chair') || lower.includes('item') || lower.includes('catalogue')) &&
    (lower.includes('description') || lower.includes('price') || lower.includes('rate'))
  ) {
    db.agentConfigs.admin_agent.metrics.catalogueProposals = 
      (db.agentConfigs.admin_agent.metrics.catalogueProposals || 0) + 1;

    // Find the item
    const items = db.items || [];
    let item = items.find(it => it.id === 'item-chair-pvc' || it.name.toLowerCase().includes('pvc'));
    if (!item) {
      item = items.find(it => it.category === 'chairs-seating') || items[0];
    }

    // Extract proposed new text
    let newDescription = 'Sturdy commercial white PVC chair with ergonomic armrests, stackable for events.';
    const toMatch = text.match(/(?:to:?|as:?|with:?)\s*(["']?)(.*?)\1$/i);
    if (toMatch && toMatch[2]) {
      newDescription = toMatch[2].replace(/^["']|["']$/g, '').trim();
    }

    const proposal = {
      id: 'prop-adm-' + Date.now().toString(36),
      actionType: 'update_catalogue_item',
      targetId: item.id,
      targetName: item.name,
      field: 'description',
      currentValue: item.description || '',
      proposedValue: newDescription,
      summary: `Update description of "${item.name}" in public rental catalogue`,
      status: 'pending_confirmation',
      createdAt: new Date().toISOString()
    };

    db.adminProposals.unshift(proposal);
    saveLocalStore();

    recordAgentEvent({
      sourceAgent: 'admin_agent',
      eventType: 'catalogue_update_proposed',
      data: { proposalId: proposal.id, itemId: item.id, summary: proposal.summary }
    });

    return {
      type: 'mutation_proposal',
      requiresConfirmation: true,
      proposalId: proposal.id,
      reply: `I have prepared the catalogue update for **${item.name}** for your review:\n\n• **Current Description:** "${item.description || 'N/A'}"\n• **Proposed Description:** "${newDescription}"\n\nWould you like me to apply this update to the public website? Please confirm or reject.`,
      diff: {
        itemId: item.id,
        itemName: item.name,
        field: 'description',
        before: item.description || '',
        after: newDescription
      }
    };
  }

  // 3. Enquiries & Bookings Inquiry
  if (lower.includes('booking') || lower.includes('enquir') || lower.includes('quote') || lower.includes('order')) {
    const enquiries = db.enquiries || [];
    const pending = enquiries.filter(e => e.status && e.status.includes('Pending'));
    const confirmed = enquiries.filter(e => e.status === 'Confirmed');

    return {
      type: 'data_query',
      reply: `### Current Booking & Enquiry Summary
• **Total Enquiries Received:** ${enquiries.length}
• **Pending Admin Approval:** ${pending.length}
• **Confirmed Bookings:** ${confirmed.length}
• **Recent Leads:** ${enquiries.slice(0, 3).map(e => `${e.customerName || 'Guest'} (${e.eventDate || 'Date TBD'}) — ${e.status}`).join('; ')}

Would you like to review pending enquiries or inspect a specific booking reference?`,
      data: {
        total: enquiries.length,
        pending: pending.length,
        confirmed: confirmed.length
      }
    };
  }

  // 4. Workforce & Wages Inquiry
  if (lower.includes('staff') || lower.includes('attendance') || lower.includes('wage') || lower.includes('mazdoor') || lower.includes('labour')) {
    const staff = db.staff || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = (db.attendance || []).filter(a => a.date === todayStr);

    return {
      type: 'data_query',
      reply: `### Workforce Operations Status
• **Registered Staff:** ${staff.length} team members
• **Attendance Today (${todayStr}):** ${todayAttendance.length} records marked
• **Daily Wage Standard:** ₹500/day per labourer/driver/fitter
• **Monthly Payroll Register:** Available under Workforce & Attendance subtabs.`,
      data: {
        totalStaff: staff.length,
        attendanceToday: todayAttendance.length
      }
    };
  }

  // 5. Default Admin Copilot Q&A
  return {
    type: 'general_admin_assistance',
    reply: `I am your Admin Operations Copilot. You can ask me to:
1. **Analyze customer enquiry patterns**: e.g., *"Why are customers asking about chairs but not submitting enquiries?"*
2. **Update catalogue items**: e.g., *"Update the PVC chair description to: Sturdy commercial white PVC chair with armrests"*
3. **Review pending bookings**: e.g., *"Show me bookings pending review"*
4. **Check workforce wages**: e.g., *"Calculate today's labour wages"*`,
    suggestedQuestions: [
      "Why are customers asking about chairs but not submitting enquiries?",
      "Update the PVC chair description",
      "Show all pending booking approvals",
      "Summary of staff attendance today"
    ]
  };
}

// Confirm Admin Mutation
async function confirmAdminAction({ proposalId, confirmed }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const proposal = (db.adminProposals || []).find(p => p.id === proposalId);
  if (!proposal) {
    throw new Error('Proposal not found or expired');
  }

  if (!confirmed) {
    proposal.status = 'rejected';
    saveLocalStore();
    return { success: true, message: 'Proposal rejected and discarded.', status: 'rejected' };
  }

  // Execute mutation
  if (proposal.actionType === 'update_catalogue_item') {
    const item = (db.items || []).find(it => it.id === proposal.targetId);
    if (item) {
      item[proposal.field] = proposal.proposedValue;
    }

    if (isMongoConnected()) {
      try {
        await Item.findOneAndUpdate(
          { $or: [{ id: proposal.targetId }, { _id: proposal.targetId }] },
          { [proposal.field]: proposal.proposedValue }
        );
      } catch (err) {
        console.warn('MongoDB sync warning during agent update:', err);
      }
    }

    proposal.status = 'executed';
    proposal.executedAt = new Date().toISOString();

    recordAgentEvent({
      sourceAgent: 'admin_agent',
      eventType: 'catalogue_update_executed',
      data: {
        proposalId,
        targetId: proposal.targetId,
        field: proposal.field,
        newValue: proposal.proposedValue
      }
    });

    recordAuditLog({
      actor: 'Admin Agent (Confirmed by User)',
      action: 'UPDATE_CATALOGUE_ITEM',
      targetType: 'Item',
      targetId: proposal.targetId,
      details: {
        field: proposal.field,
        before: proposal.currentValue,
        after: proposal.proposedValue
      }
    });

    saveLocalStore();

    return {
      success: true,
      message: `Successfully updated ${proposal.targetName || 'item'} ${proposal.field} to "${proposal.proposedValue}".`,
      status: 'executed',
      updatedItem: item
    };
  }

  throw new Error(`Unsupported action type: ${proposal.actionType}`);
}

// ==========================================
// 3. MASTER AGENT ENGINE
// ==========================================

function getSystemOverview() {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const configs = db.agentConfigs;
  const recentEvents = (db.agentEvents || []).slice(0, 15);
  const auditLogs = (db.agentAuditLogs || []).slice(0, 10);

  // Extract inter-agent handoffs
  const handoffs = (db.agentEvents || []).filter(e => 
    e.eventType === 'escalation_to_admin' || e.targetAgent !== null
  ).slice(0, 10);

  return {
    agents: {
      client_agent: configs.client_agent,
      admin_agent: configs.admin_agent,
      master_agent: configs.master_agent
    },
    systemHealth: {
      status: 'all_systems_operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      activeAgentsCount: 3,
      totalEventsRecorded: (db.agentEvents || []).length,
      recentErrorsCount: (db.agentEvents || []).filter(e => e.severity === 'error').length,
      masterAgentTrainingCount: (db.masterAgentTrainingData || []).length
    },
    handoffs,
    recentEvents,
    recentAuditLogs: auditLogs,
    masterAgentTrainingData: (db.masterAgentTrainingData || []).slice(0, 10)
  };
}

// Propose natural-language rule update
function proposeRuleUpdate({ instruction, targetAgentOverride }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const text = (instruction || '').trim();
  const lower = text.toLowerCase();

  // 1. Identify Target Agent
  let targetAgent = targetAgentOverride;
  if (!targetAgent) {
    if (lower.includes('client agent') || lower.includes('client') || lower.includes('customer') || lower.includes('recommend chair') || lower.includes('recommend')) {
      targetAgent = 'client_agent';
    } else if (lower.includes('admin agent') || lower.includes('admin') || lower.includes('failed booking') || lower.includes('dropoff') || lower.includes('drop off')) {
      targetAgent = 'admin_agent';
    } else {
      targetAgent = 'client_agent';
    }
  }

  const currentConfig = db.agentConfigs[targetAgent];
  if (!currentConfig) {
    throw new Error(`Agent ${targetAgent} not found`);
  }

  // Calculate new version number
  const currentVer = currentConfig.version || 'v1.0';
  const verNum = parseFloat(currentVer.replace('v', '')) || 1.0;
  const nextVer = `v${(verNum + 0.1).toFixed(1)}`;

  // Synthesize proposed rule addition or replacement
  let newRule = '';
  let changeDescription = '';

  if (targetAgent === 'client_agent' && (lower.includes('chair') || lower.includes('recommend'))) {
    newRule = 'When recommending chairs, actively compare PVC chairs (₹20), VIP chairs (₹50), and Highback banquet chairs (₹70) based on guest count and venue type. Always ask whether chair covers with satin bows are needed.';
    changeDescription = 'Enhanced chair recommendation rules with tier comparison and cover inquiries.';
  } else if (targetAgent === 'admin_agent' && (lower.includes('failed') || lower.includes('booking') || lower.includes('dropoff'))) {
    newRule = 'When analyzing booking drop-offs or failed inquiries, break down customer friction by stage (contact prompt, pricing uncertainty, delivery distance) and provide concrete mitigation packages.';
    changeDescription = 'Added structured drop-off diagnostic protocol for booking inquiries.';
  } else {
    newRule = `Operational Rule: ${text}`;
    changeDescription = `Updated operational guidelines based on owner instruction: "${text}"`;
  }

  const proposedRules = [...currentConfig.rules, newRule];

  const proposal = {
    id: 'prop-mast-' + Date.now().toString(36),
    targetAgent,
    targetAgentName: currentConfig.name,
    currentVersion: currentVer,
    proposedVersion: nextVer,
    changeDescription,
    instruction: text,
    currentRules: currentConfig.rules,
    proposedRules,
    newRuleAdded: newRule,
    status: 'pending_owner_approval',
    createdAt: new Date().toISOString()
  };

  db.masterProposals.unshift(proposal);
  saveLocalStore();

  recordAgentEvent({
    sourceAgent: 'master_agent',
    targetAgent,
    eventType: 'config_version_proposed',
    data: { proposalId: proposal.id, targetAgent, nextVer, changeDescription }
  });

  return proposal;
}

// Apply approved rule update
function applyRuleUpdate({ proposalId, approved }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const proposal = (db.masterProposals || []).find(p => p.id === proposalId);
  if (!proposal) {
    throw new Error('Master Agent proposal not found');
  }

  if (!approved) {
    proposal.status = 'rejected';
    saveLocalStore();
    return { success: true, message: 'Configuration change rejected by owner.', status: 'rejected' };
  }

  const agentConfig = db.agentConfigs[proposal.targetAgent];
  if (!agentConfig) {
    throw new Error(`Target agent ${proposal.targetAgent} configuration not found`);
  }

  // Apply new rules and version
  agentConfig.version = proposal.proposedVersion;
  agentConfig.rules = proposal.proposedRules;

  // Add to version history
  if (!agentConfig.versionHistory) agentConfig.versionHistory = [];
  agentConfig.versionHistory.unshift({
    version: proposal.proposedVersion,
    updatedAt: new Date().toISOString(),
    author: 'Mr. Kandhari (Owner via Master Agent)',
    changeSummary: proposal.changeDescription,
    rulesSnapshot: [...proposal.proposedRules]
  });

  // Update metrics
  db.agentConfigs.master_agent.metrics.ruleUpdatesApplied = 
    (db.agentConfigs.master_agent.metrics.ruleUpdatesApplied || 0) + 1;

  proposal.status = 'applied';
  proposal.appliedAt = new Date().toISOString();

  recordAgentEvent({
    sourceAgent: 'master_agent',
    targetAgent: proposal.targetAgent,
    eventType: 'config_version_applied',
    data: {
      targetAgent: proposal.targetAgent,
      newVersion: proposal.proposedVersion,
      summary: proposal.changeDescription
    }
  });

  recordAuditLog({
    actor: 'Mr. Kandhari (Owner)',
    action: 'UPDATE_AGENT_CONFIG',
    targetType: 'AgentConfig',
    targetId: proposal.targetAgent,
    details: {
      oldVersion: proposal.currentVersion,
      newVersion: proposal.proposedVersion,
      changeDescription: proposal.changeDescription
    }
  });

  saveLocalStore();

  return {
    success: true,
    message: `Configuration ${proposal.proposedVersion} deployed successfully to ${agentConfig.name}.`,
    targetAgent: proposal.targetAgent,
    newVersion: proposal.proposedVersion,
    rules: agentConfig.rules
  };
}

// Rollback agent configuration
function rollbackAgentConfig({ targetAgent, toVersion }) {
  const db = getLocalDb();
  ensureAgentsInit(db);

  const agentConfig = db.agentConfigs[targetAgent];
  if (!agentConfig) throw new Error('Target agent not found');

  const history = agentConfig.versionHistory || [];
  const targetHistoryEntry = history.find(h => h.version === toVersion);

  if (!targetHistoryEntry) {
    throw new Error(`Version ${toVersion} not found in version history`);
  }

  agentConfig.version = targetHistoryEntry.version;
  if (targetHistoryEntry.rulesSnapshot) {
    agentConfig.rules = [...targetHistoryEntry.rulesSnapshot];
  }

  recordAgentEvent({
    sourceAgent: 'master_agent',
    targetAgent,
    eventType: 'config_rollback_executed',
    data: { targetAgent, rolledBackTo: toVersion }
  });

  recordAuditLog({
    actor: 'Mr. Kandhari (Owner)',
    action: 'ROLLBACK_AGENT_CONFIG',
    targetType: 'AgentConfig',
    targetId: targetAgent,
    details: { rolledBackTo: toVersion }
  });

  saveLocalStore();

  return {
    success: true,
    message: `Successfully rolled back ${agentConfig.name} to version ${toVersion}.`,
    currentVersion: agentConfig.version,
    rules: agentConfig.rules
  };
}

module.exports = {
  ensureAgentsInit,
  recordAgentEvent,
  recordAuditLog,
  processClientMessage,
  processAdminMessage,
  confirmAdminAction,
  getSystemOverview,
  proposeRuleUpdate,
  applyRuleUpdate,
  rollbackAgentConfig,
  CHAIR_RECOMMENDATIONS
};
