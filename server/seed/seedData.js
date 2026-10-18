/**
 * Real Business Seed Data for Kandhari Tent & Caterers & Dwarka Shri Lawn
 * Grounded in genuine photos and videos from C:\Users\info\Desktop\Tent
 */

const categories = [
  { id: 'chairs-seating', name: 'Chairs & Seating', description: 'VIP sofas, baithak setups, banquet chairs, and cushioned seating' },
  { id: 'tables', name: 'Tables', description: 'Round banquet tables, buffet counters, cocktail high-tops, and dining setups' },
  { id: 'tents-canopies', name: 'Tents & Canopies', description: 'All-weather German hangars, royal embroidered shamianas, and canopies' },
  { id: 'stage-platform', name: 'Stage & Platform Equipment', description: 'Modular stages, floral backdrops, carpeted risers, and truss rigging' },
  { id: 'fans-coolers', name: 'Fans & Coolers', description: 'Industrial jumbo coolers, high-pressure mist fans, and pedestal fans' },
  { id: 'lighting-decor', name: 'Lighting & Decoration', description: 'Crystal chandeliers, fairy lights, LED par cans, and grand arches' },
  { id: 'wedding-essentials', name: 'Wedding & Party Essentials', description: 'Mandap structures, haldi/mehendi setups, roll-top chafers, red carpets' },
  { id: 'other-equipment', name: 'Other Event Equipment', description: 'Generators, 3-phase power distribution, and safety barricades' }
];

const sampleItems = [
  // 1. Chairs & Seating
  {
    id: 'item-001',
    name: 'VIP Royal Maharaja Sofa Setup',
    category: 'Chairs & Seating',
    categoryId: 'chairs-seating',
    description: 'Carved gold & velvet high-back Maharaja dual seating with matching side chairs for main wedding stage.',
    availableQuantity: 6,
    availabilityStatus: 'Available',
    internalNotes: 'Real stock from warehouse. Includes velvet armrests.',
    imageUrl: '/media/seating/seating-1.jpg',
    featured: true
  },
  {
    id: 'item-002',
    name: 'Premium Velvet Banquet Chairs',
    category: 'Chairs & Seating',
    categoryId: 'chairs-seating',
    description: 'Heavy steel banquet chairs with thick cushioning and clean ivory or maroon slipcovers.',
    availableQuantity: 500,
    availabilityStatus: 'Available',
    internalNotes: 'Includes matching chair ribbons upon request.',
    imageUrl: '/media/seating/seating-2.jpg',
    featured: true
  },
  {
    id: 'item-003',
    name: 'VIP Low-Seating Baithak Setup',
    category: 'Chairs & Seating',
    categoryId: 'chairs-seating',
    description: 'Traditional Royal Lucknowi baithak floor setup with embroidered bolsters (masnads) for Mehendi/Haldi.',
    availableQuantity: 15,
    availabilityStatus: 'Available',
    internalNotes: 'Accommodates 8-10 guests per gadda setup.',
    imageUrl: '/media/seating/seating-3.jpg',
    featured: false
  },
  {
    id: 'item-004',
    name: 'Gold Chiavari Tiffany Chairs',
    category: 'Chairs & Seating',
    categoryId: 'chairs-seating',
    description: 'Elegant golden Chiavari chairs with ivory cushions for ring ceremonies and outdoor dining.',
    availableQuantity: 200,
    availabilityStatus: 'Available',
    internalNotes: 'Protected in padded transport bags.',
    imageUrl: '/media/seating/seating-4.jpg',
    featured: false
  },

  // 2. Tables
  {
    id: 'item-005',
    name: 'Round Banquet Tables with Full-Drop Linens',
    category: 'Tables',
    categoryId: 'tables',
    description: '60-inch round banquet dining tables (6-8 seater) with crisp royal table skirting and center runners.',
    availableQuantity: 60,
    availabilityStatus: 'Available',
    internalNotes: 'Complete with clean table runners.',
    imageUrl: '/media/tables/table-1.jpg',
    featured: true
  },
  {
    id: 'item-006',
    name: 'Modular Buffet Counters (8ft)',
    category: 'Tables',
    categoryId: 'tables',
    description: '8-foot heavy steel buffet tables with dual tiers for warming dishes, chafers, and attractive side skirting.',
    availableQuantity: 25,
    availabilityStatus: 'Available',
    internalNotes: 'Heat-resistant top surfaces for live food counters.',
    imageUrl: '/media/tables/table-2.jpg',
    featured: true
  },
  {
    id: 'item-007',
    name: 'High-Top Cocktail Standing Tables',
    category: 'Tables',
    categoryId: 'tables',
    description: 'Tall cocktail tables with stretch spandex covers for lawn reception socializing.',
    availableQuantity: 20,
    availabilityStatus: 'Available',
    internalNotes: 'Includes stretchable royal purple or black covers.',
    imageUrl: '/media/tables/table-3.jpg',
    featured: false
  },

  // 3. Tents & Canopies
  {
    id: 'item-008',
    name: 'All-Weather German Waterproof Hangar Tent',
    category: 'Tents & Canopies',
    categoryId: 'tents-canopies',
    description: 'Clear-span heavy aluminum structure with waterproof, fire-retardant PVC fabric. Pillarless interior ensures unobstructed stage view.',
    availableQuantity: 4,
    availabilityStatus: 'Available',
    internalNotes: 'Configurable: 40x60ft, 60x100ft, or custom dimensions.',
    imageUrl: '/media/rich-decor/decor-1.jpg',
    featured: true
  },
  {
    id: 'item-009',
    name: 'Traditional Royal Embroidered Shamiana',
    category: 'Tents & Canopies',
    categoryId: 'tents-canopies',
    description: 'Classic scalloped valance tent with rich royal purple, gold, and red ceiling drapery.',
    availableQuantity: 8,
    availabilityStatus: 'Available',
    internalNotes: 'Traditional fabric tent supported by heavy iron center poles.',
    imageUrl: '/media/rich-decor/decor-2.jpg',
    featured: true
  },
  {
    id: 'item-010',
    name: 'Passage & Driveway Tunnel Canopies',
    category: 'Tents & Canopies',
    categoryId: 'tents-canopies',
    description: 'Arched passage canopy structures for grand lawn entrances, decorated with fairy lighting.',
    availableQuantity: 6,
    availabilityStatus: 'Available',
    internalNotes: 'Length configurable from 30ft to 120ft.',
    imageUrl: '/media/gate/gate-1.jpg',
    featured: false
  },

  // 4. Stage & Platform Equipment
  {
    id: 'item-011',
    name: 'Heavy-Duty Modular Stage with Floral Backdrop',
    category: 'Stage & Platform Equipment',
    categoryId: 'stage-platform',
    description: 'Customizable stage platform (up to 30x20ft) with rich floral framing, velvet drapes, and access steps.',
    availableQuantity: 5,
    availabilityStatus: 'Available',
    internalNotes: 'Height adjustable from 2ft to 4ft.',
    imageUrl: '/media/stage/stage-1.jpg',
    featured: true
  },
  {
    id: 'item-012',
    name: 'LED Screen & Lighting Truss Rigging Frame',
    category: 'Stage & Platform Equipment',
    categoryId: 'stage-platform',
    description: 'Aluminum 300mm box truss frame for mounting stage illumination, audio, and visual backdrop screens.',
    availableQuantity: 4,
    availabilityStatus: 'Available',
    internalNotes: 'Includes certified base plates and clamps.',
    imageUrl: '/media/stage/stage-2.jpg',
    featured: false
  },

  // 5. Fans & Coolers
  {
    id: 'item-013',
    name: 'Industrial Jumbo Desert Air Coolers (150L)',
    category: 'Fans & Coolers',
    categoryId: 'fans-coolers',
    description: 'Heavy-duty 150-liter jumbo body desert coolers with honeycomb cooling pads and powerful exhaust throw.',
    availableQuantity: 40,
    availabilityStatus: 'Available',
    internalNotes: 'Complete water connection and electrical cabling provided.',
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'item-014',
    name: 'High-Pressure Outdoor Mist Fans (26")',
    category: 'Fans & Coolers',
    categoryId: 'fans-coolers',
    description: 'Oscillating heavy-duty pedestal misting fans that drop outdoor temperature by 5-8°C without wetting guests.',
    availableQuantity: 24,
    availabilityStatus: 'Available',
    internalNotes: 'Ideal for open lawns and dining corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    featured: false
  },

  // 6. Lighting & Decoration
  {
    id: 'item-015',
    name: 'Grand Crystal Chandeliers & Warm Fairy Lights',
    category: 'Lighting & Decoration',
    categoryId: 'lighting-decor',
    description: 'Multi-tiered crystal chandeliers and warm white LED rice fairy strings for palatial ceiling ambience.',
    availableQuantity: 10,
    availabilityStatus: 'Available',
    internalNotes: 'Includes ceiling hoist chains.',
    imageUrl: '/media/rich-decor/decor-3.jpg',
    featured: true
  },
  {
    id: 'item-016',
    name: 'Grand Illuminated Entrance Gate Arch',
    category: 'Lighting & Decoration',
    categoryId: 'lighting-decor',
    description: 'Architectural welcome gate with fresh flower rigging, LED wash illumination, and royal drapery.',
    availableQuantity: 6,
    availabilityStatus: 'Available',
    internalNotes: 'Real photo from actual Kanpur Road client event.',
    imageUrl: '/media/gate/gate-2.jpg',
    featured: true
  },

  // 7. Wedding & Party Essentials
  {
    id: 'item-017',
    name: 'Royal Wedding Mandap Setup',
    category: 'Wedding & Party Essentials',
    categoryId: 'wedding-essentials',
    description: 'Four-pillar traditional mandap with heavy floral work, havan kund area, and sacred seating.',
    availableQuantity: 4,
    availabilityStatus: 'Available',
    internalNotes: 'Custom color themes (Red/Gold, Pastel Pink, Marigold Yellow).',
    imageUrl: '/media/mandap/mandap-1.jpg',
    featured: true
  },
  {
    id: 'item-018',
    name: 'Vibrant Haldi & Mehendi Backdrop Setups',
    category: 'Wedding & Party Essentials',
    categoryId: 'wedding-essentials',
    description: 'Traditional marigold floral decor, urli setup, and colorful drapes for pre-wedding functions.',
    availableQuantity: 8,
    availabilityStatus: 'Available',
    internalNotes: 'Real photo from Lucknow home & lawn events.',
    imageUrl: '/media/haldi-mehendi/haldi-1.jpg',
    featured: true
  },
  {
    id: 'item-019',
    name: 'Stainless Steel Roll-Top Chafing Dishes',
    category: 'Wedding & Party Essentials',
    categoryId: 'wedding-essentials',
    description: 'Food-grade stainless steel roll-top buffet chafers with burner trays for hygienic food service.',
    availableQuantity: 50,
    availabilityStatus: 'Available',
    internalNotes: 'Sanitized and mirror-polished before every event.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    featured: false
  },

  // 8. Other Event Equipment
  {
    id: 'item-020',
    name: 'Silent Diesel Generator (62.5 kVA / 125 kVA)',
    category: 'Other Event Equipment',
    categoryId: 'other-equipment',
    description: 'Commercial soundproof generator providing continuous uninterrupted power for entire lawn lighting and coolers.',
    availableQuantity: 4,
    availabilityStatus: 'Available',
    internalNotes: 'Licensed technician provided on site.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    featured: true
  }
];

const venueDetails = {
  name: 'Dwarka Shri Lawn',
  brandTagline: 'Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)',
  headline: 'A Majestic Open-Air Wedding & Celebration Venue on Kanpur Road, Lucknow',
  description: 'Nestled conveniently on Kanpur Road opposite Pillar No. 37 in Daroga Kheda, Dwarka Shri Lawn offers an expansive, beautifully landscaped open-air venue ideal for weddings, grand receptions, Sangeet & Mehendi festivities, ring ceremonies, and milestone celebrations. Managed directly by Kandhari Tent & Caterers.',
  address: 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  phoneNumbers: ['9305465848', '9307908994', '7355059566'],
  primaryPhone: '9305465848',
  whatsappPhone: '919305465848',
  email: 'contact@kandharitent.com',
  suitableEvents: [
    'Weddings & Grand Receptions',
    'Sangeet, Mehendi & Haldi Ceremonies',
    'Engagement & Ring Ceremonies',
    'Birthday & Anniversary Celebrations',
    'Corporate Annual Meets & Product Launches',
    'Religious & Cultural Gatherings'
  ],
  amenities: [
    { id: 'amenity-1', title: 'Spacious Landscaped Lawn', description: 'Lush green open ground ready for customized seating, German hangars, and dining setups.', icon: 'Trees' },
    { id: 'amenity-2', title: 'Air-Conditioned Bridal Dressing Rooms', description: 'Private, secure, air-conditioned green rooms for the bride, groom, and immediate family.', icon: 'Home' },
    { id: 'amenity-3', title: 'Uninterrupted 100% Power Backup', description: 'High-capacity generator infrastructure ensuring uninterrupted illumination and cooling.', icon: 'Zap' },
    { id: 'amenity-4', title: 'Dedicated Guest Parking Zone', description: 'Ample vehicle parking space with convenient ingress and egress directly from Kanpur Road.', icon: 'Car' },
    { id: 'amenity-5', title: 'Grand Welcome Entrance Gate', description: 'Stately archway designed for high-impact floral, drape, and illumination welcoming decor.', icon: 'Sparkles' },
    { id: 'amenity-6', title: 'Dedicated Catering & Live-Kitchen Space', description: 'Segregated service corridors and preparation yards for seamless buffet catering management.', icon: 'Utensils' }
  ],
  images: [
    { url: '/media/lawns/lawn-main.jpg', caption: 'Actual client evening setup at Dwarka Shri Lawn' },
    { url: '/media/gate/gate-1.jpg', caption: 'Grand entrance gate with illuminated floral arches' },
    { url: '/media/stage/stage-1.jpg', caption: 'Custom floral stage setup' },
    { url: '/media/rich-decor/decor-1.jpg', caption: 'German hangar and shamiana canopy ceiling' }
  ],
  videos: [
    { url: '/media/videos/event-walkthrough.mp4', title: 'Evening Lawn & Stage Walkthrough Video' },
    { url: '/media/videos/night-decor-reel.mp4', title: 'Night Illumination & Decor Highlight' }
  ]
};

const galleryItems = [
  // 1. Entrances (6 photos)
  { id: 'gal-ent-1', title: 'Grand Illuminated Entrance Gate', category: 'Entrances', imageUrl: '/media/gate/gate-1.jpg', caption: 'Illuminated archway welcome gate at Kanpur Road venue', featured: true },
  { id: 'gal-ent-2', title: 'Royal Draped Welcome Pathway', category: 'Entrances', imageUrl: '/media/gate/gate-2.jpg', caption: 'Red carpet walkway with floral side pilasters' },
  { id: 'gal-ent-3', title: 'Floral Arch Entrance Archway', category: 'Entrances', imageUrl: '/media/gate/gate-3.jpg', caption: 'Dense marigold and rose entrance framing' },
  { id: 'gal-ent-4', title: 'Stately Palace Entryway Design', category: 'Entrances', imageUrl: '/media/gate/gate-4.jpg', caption: 'Royal carved pillars with warm chandelier lighting' },
  { id: 'gal-ent-5', title: 'Traditional Toran & Tassel Gate', category: 'Entrances', imageUrl: '/media/gate/gate-5.jpg', caption: 'Festive traditional Indian wedding entrance' },
  { id: 'gal-ent-6', title: 'Modern LED Tunnel Entrance', category: 'Entrances', imageUrl: '/media/gate/gate-6.jpg', caption: 'Illuminated LED light tunnel for night receptions' },

  // 2. Floral decoration (6 photos)
  { id: 'gal-flor-1', title: 'Exotic Fresh Flower Stage Backdrop', category: 'Floral decoration', imageUrl: '/media/stage/stage-1.jpg', caption: 'Fresh roses, orchids, and carnation wall', featured: true },
  { id: 'gal-flor-2', title: 'Haldi Marigold Floral Canopy', category: 'Floral decoration', imageUrl: '/media/haldi-mehendi/haldi-1.jpg', caption: 'Traditional yellow and orange genda phool theme' },
  { id: 'gal-flor-3', title: 'Mandap Floral Bell Hangings', category: 'Floral decoration', imageUrl: '/media/mandap/mandap-1.jpg', caption: 'Sacred wedding mandap with cascading floral malas' },
  { id: 'gal-flor-4', title: 'Pastel Floral Stage Panels', category: 'Floral decoration', imageUrl: '/media/stage/stage-5.jpg', caption: 'Contemporary pastel theme with baby breath accents' },
  { id: 'gal-flor-5', title: 'Mehendi Swing Floral Wreath', category: 'Floral decoration', imageUrl: '/media/haldi-mehendi/haldi-3.jpg', caption: 'Decorated floral swing for bridal photoshoot' },
  { id: 'gal-flor-6', title: 'Temple Arch Floral Framing', category: 'Floral decoration', imageUrl: '/media/mandap/mandap-3.jpg', caption: 'Carved temple pillars adorned with fresh tuberose strings' },

  // 3. Lighting (6 photos)
  { id: 'gal-light-1', title: 'Royal Ceiling & Crystal Chandeliers', category: 'Lighting', imageUrl: '/media/rich-decor/decor-2.jpg', caption: 'Multi-tiered crystal chandeliers under shamiana draping', featured: true },
  { id: 'gal-light-2', title: 'Warm Ambience Fairy Light Canopy', category: 'Lighting', imageUrl: '/media/rich-decor/decor-5.jpg', caption: 'Starry night fairy light canopy over dinner lawn' },
  { id: 'gal-light-3', title: 'LED Par Stage Wash & Uplighters', category: 'Lighting', imageUrl: '/media/rich-decor/decor-6.jpg', caption: 'Full RGBW programmable wash lights for wedding stage' },
  { id: 'gal-light-4', title: 'Hanging Moroccan Warm Lanterns', category: 'Lighting', imageUrl: '/media/rich-decor/decor-7.jpg', caption: 'Vintage brass lighting accents along walkway' },
  { id: 'gal-light-5', title: 'Truss Mounted Sharpies & Spotlights', category: 'Lighting', imageUrl: '/media/rich-decor/decor-9.jpg', caption: 'Heavy duty aluminum truss lighting for sangeet performances' },
  { id: 'gal-light-6', title: 'Grand Chandelier Shamiana Dome', category: 'Lighting', imageUrl: '/media/rich-decor/decor-10.jpg', caption: 'Central luxury chandelier illuminating banquet hall' },

  // 4. Stage and mandap (6 photos)
  { id: 'gal-stg-1', title: 'Royal Maharaja Reception Stage', category: 'Stage and mandap', imageUrl: '/media/stage/stage-2.jpg', caption: 'Grand stage with velvet draping and gold seating', featured: true },
  { id: 'gal-stg-2', title: 'Sacred Vedic Mandap Setup', category: 'Stage and mandap', imageUrl: '/media/mandap/mandap-2.jpg', caption: 'Traditional 4-pillar sacred wedding mandap with havan kund area' },
  { id: 'gal-stg-3', title: 'Modern Geometrical Stage Backdrop', category: 'Stage and mandap', imageUrl: '/media/stage/stage-3.jpg', caption: 'Contemporary ring ceremony backdrop with warm backlighting' },
  { id: 'gal-stg-4', title: 'Lotus Themed Mandap Pavilion', category: 'Stage and mandap', imageUrl: '/media/mandap/mandap-4.jpg', caption: 'Aesthetic open-air mandap overlooking lawn' },
  { id: 'gal-stg-5', title: 'Carved Royal Jharokha Stage', category: 'Stage and mandap', imageUrl: '/media/stage/stage-4.jpg', caption: 'Traditional Rajasthani carved jharokha elements' },
  { id: 'gal-stg-6', title: 'Pillared Grand Mandap Dome', category: 'Stage and mandap', imageUrl: '/media/mandap/mandap-5.jpg', caption: 'Domed mandap setup with rich marigold ornamentation' },

  // 5. Tent structures (5 photos)
  { id: 'gal-tnt-1', title: 'German Waterproof Hangar Tent', category: 'Tent structures', imageUrl: '/media/rich-decor/decor-1.jpg', caption: 'High-clearance German aluminum structure for all-weather events', featured: true },
  { id: 'gal-tnt-2', title: 'Royal Embroidered Ceiling Shamiana', category: 'Tent structures', imageUrl: '/media/rich-decor/decor-3.jpg', caption: 'Intricate Lucknowi chikan and velvet ceiling lining' },
  { id: 'gal-tnt-3', title: 'Arabian High-Peak Pagoda Canopies', category: 'Tent structures', imageUrl: '/media/rich-decor/decor-4.jpg', caption: 'Individual pagoda canopies for VIP dining and live counters' },
  { id: 'gal-tnt-4', title: 'Silk Draped Food Court Pavilion', category: 'Tent structures', imageUrl: '/media/rich-decor/decor-8.jpg', caption: 'Spacious food marquee with air circulation ducts' },
  { id: 'gal-tnt-5', title: 'Luxury Double-Pole Marquee Tent', category: 'Tent structures', imageUrl: '/media/rich-decor/decor-11.jpg', caption: 'Classic heavy tent house canvas shelter' },

  // 6. Catering (5 photos)
  { id: 'gal-cat-1', title: '8ft Modular Buffet Setup with Skirting', category: 'Catering', imageUrl: '/media/tables/table-2.jpg', caption: 'Multi-tier catering buffet line with heat-resistant counter tops', featured: true },
  { id: 'gal-cat-2', title: 'Live Food Station Canopy Counters', category: 'Catering', imageUrl: '/media/tables/table-3.jpg', caption: 'Dedicated live counters with decorative valances' },
  { id: 'gal-cat-3', title: 'Dessert & Mocktail Display Bar', category: 'Catering', imageUrl: '/media/tables/table-4.jpg', caption: 'Illuminated presentation counter for beverages and sweets' },
  { id: 'gal-cat-4', title: 'Stainless Steel Roll-Top Chafers', category: 'Catering', imageUrl: '/media/tables/table-5.jpg', caption: 'Hygienic brass and stainless roll-top dish warmers' },
  { id: 'gal-cat-5', title: 'Banquet Dining Table Arrangement', category: 'Catering', imageUrl: '/media/tables/table-6.jpg', caption: 'Clean dining tables with crisp linens and cutlery setup' },

  // 7. Lawn and venue (5 photos)
  { id: 'gal-lwn-1', title: 'Dwarka Shri Lawn Evening Celebration', category: 'Lawn and venue', imageUrl: '/media/lawns/lawn-main.jpg', caption: 'Panoramic view of Dwarka Shri Lawn, Kanpur Road Lucknow', featured: true },
  { id: 'gal-lwn-2', title: 'Grand Venue Entrance on Kanpur Road', category: 'Lawn and venue', imageUrl: '/media/gate/gate-1.jpg', caption: 'Stately entry gate opposite Pillar 37 Daroga Kheda' },
  { id: 'gal-lwn-3', title: 'Round Table Lawn Dining Zone', category: 'Lawn and venue', imageUrl: '/media/tables/table-1.jpg', caption: 'Lush green lawn seating with 60-inch banquet tables' },
  { id: 'gal-lwn-4', title: 'Covered Weatherproof Lawn Wing', category: 'Lawn and venue', imageUrl: '/media/rich-decor/decor-12.jpg', caption: 'Adjoining semi-covered pavilion for weather protection' },
  { id: 'gal-lwn-5', title: 'Lawn Illumination & Open Sky View', category: 'Lawn and venue', imageUrl: '/media/rich-decor/decor-1.jpg', caption: 'Evening lighting setting up the lawn for reception celebration' },

  // 8. Other events (6 photos)
  { id: 'gal-oth-1', title: 'Haldi Ceremony Floral Gadda Baithak', category: 'Other events', imageUrl: '/media/haldi-mehendi/haldi-2.jpg', caption: 'Vibrant daytime pre-wedding setup', featured: true },
  { id: 'gal-oth-2', title: 'Traditional Lucknowi Royal Baithak', category: 'Other events', imageUrl: '/media/seating/seating-1.jpg', caption: 'Low seating with masnad bolsters for Sangeet and Mehendi' },
  { id: 'gal-oth-3', title: 'VIP Maharaja Lounge Arrangement', category: 'Other events', imageUrl: '/media/seating/seating-2.jpg', caption: 'Carved golden sofas for dignitary & elder family seating' },
  { id: 'gal-oth-4', title: 'Colourful Festive Canopy Setup', category: 'Other events', imageUrl: '/media/haldi-mehendi/haldi-4.jpg', caption: 'Yellow and green draping for ring ceremony' },
  { id: 'gal-oth-5', title: 'Engagement Ring Ceremony Seating', category: 'Other events', imageUrl: '/media/seating/seating-3.jpg', caption: 'Intimate stage seating for roka or ring exchange' },
  { id: 'gal-oth-6', title: 'Cushioned Banquet Hall Seating', category: 'Other events', imageUrl: '/media/seating/seating-4.jpg', caption: 'Arrangement for birthday party and family anniversary celebration' }
];

const sampleEnquiries = [
  {
    id: 'enq-1001',
    enquiryType: 'rental',
    customerName: 'Rajesh Sharma',
    phone: '9839012345',
    whatsappNumber: '9839012345',
    email: 'rajesh.sharma@gmail.com',
    serviceRequired: 'Wedding tent and canopy setups',
    eventDate: '2026-11-20',
    locality: 'Alambagh, Lucknow',
    eventVenueAddress: 'Near Phoenix Mall, Alambagh',
    eventType: 'Wedding Reception',
    guestCount: 350,
    budgetRange: '₹1,50,000 - ₹3,00,000',
    items: [
      { itemId: 'item-002', name: 'Premium Velvet Banquet Chairs', quantity: 200 },
      { itemId: 'item-005', name: 'Round Banquet Tables with Full-Drop Linens', quantity: 25 },
      { itemId: 'item-013', name: 'Industrial Jumbo Desert Air Coolers (150L)', quantity: 6 }
    ],
    notes: 'Require delivery one day prior in Alambagh. Please provide best quote.',
    consentGiven: true,
    status: 'New',
    referredTo: '',
    nextFollowUpDate: '2026-10-22',
    internalNotes: 'Follow up regarding floor plan dimensions.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'enq-1002',
    enquiryType: 'lawn',
    customerName: 'Amitabh Verma',
    phone: '9415088990',
    whatsappNumber: '9415088990',
    email: 'amitabh.verma@outlook.com',
    serviceRequired: 'Lawn and venue booking enquiries',
    eventDate: '2026-12-05',
    locality: 'Kanpur Road, Lucknow',
    eventVenueAddress: 'Dwarka Shri Lawn, Opp. Pillar No. 37',
    eventType: 'Wedding & Reception',
    guestCount: 450,
    budgetRange: '₹3,00,000+',
    items: [],
    notes: 'Checking availability for daughter wedding reception. Need full lawn setup with German hangar.',
    consentGiven: true,
    status: 'Contacted',
    referredTo: '',
    nextFollowUpDate: '2026-10-25',
    internalNotes: 'Spoke with Mr. Verma; shared lawn photos and invited for site visit on Sunday.',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

module.exports = {
  categories,
  sampleItems,
  venueDetails,
  galleryItems,
  sampleEnquiries
};
