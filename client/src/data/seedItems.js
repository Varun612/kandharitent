/**
 * Client-side default items and categories with genuine business photos from C:\Users\info\Desktop\Tent
 */
export const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'chairs-seating', name: 'Chairs & Seating' },
  { id: 'tables', name: 'Tables' },
  { id: 'tents-canopies', name: 'Tents & Canopies' },
  { id: 'stage-platform', name: 'Stage & Platform' },
  { id: 'fans-coolers', name: 'Fans & Coolers' },
  { id: 'lighting-decor', name: 'Lighting & Decor' },
  { id: 'wedding-essentials', name: 'Wedding Essentials' },
  { id: 'other-equipment', name: 'Other Equipment' }
];

export const LUCKNOW_LOCALITIES = [
  'Kanpur Road / Daroga Kheda',
  'Alambagh / Singar Nagar',
  'Ashiyana / Sector H, K, L',
  'Transport Nagar',
  'Krishna Nagar / Manak Nagar',
  'Gomti Nagar / Gomti Nagar Extension',
  'Indira Nagar',
  'Hazratganj / Ashok Marg',
  'Rajajipuram',
  'Telibagh / Raebareli Road',
  'Jankipuram / Sitapur Road',
  'Mahanagar / Aliganj',
  'Charbagh / Hussainganj',
  'Chowk / Old Lucknow',
  'Vrindavan Colony / Amar Shaheed Path',
  'Sushant Golf City',
  'Other Lucknow Locality / Outside Lucknow'
];

export const SERVICES_LIST = [
  'Tent-house equipment rentals',
  'Wedding and event arrangements',
  'Wedding tent and canopy setups',
  'Event decoration & lighting',
  'Lawn and venue booking enquiries (Dwarka Shri Lawn)',
  'Chairs, tables, fans, coolers & stages',
  'Catering services (Coming Soon enquiry)'
];

export const FALLBACK_VENUE = {
  name: 'Dwarka Shri Lawn',
  brandTagline: 'Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)',
  headline: 'A Majestic Open-Air Wedding & Celebration Venue on Kanpur Road, Lucknow',
  description: 'Nestled conveniently on Kanpur Road opposite Pillar No. 37 in Daroga Kheda, Dwarka Shri Lawn offers an expansive, beautifully landscaped open-air venue ideal for weddings, grand receptions, Sangeet & Mehendi festivities, ring ceremonies, and milestone celebrations. Managed directly by Kandhari Tent & Caterers.',
  address: 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh',
  city: 'Lucknow',
  phoneNumbers: ['9305465848', '9307908994', '7355059566'],
  primaryPhone: '9305465848',
  whatsappPhone: '919305465848',
  amenities: [
    { id: 'amenity-1', title: 'Spacious Landscaped Lawn', description: 'Lush open ground for customized seating, German hangars, and dining setups.', icon: 'Trees' },
    { id: 'amenity-2', title: 'Air-Conditioned Bridal Dressing Rooms', description: 'Private, secure, air-conditioned green rooms for bride and groom.', icon: 'Home' },
    { id: 'amenity-3', title: 'Uninterrupted 100% Power Backup', description: 'Heavy generator setup ensuring uninterrupted lighting and cooling.', icon: 'Zap' },
    { id: 'amenity-4', title: 'Dedicated Guest Parking Zone', description: 'Ample vehicle parking space with convenient Kanpur Road access.', icon: 'Car' },
    { id: 'amenity-5', title: 'Grand Welcome Entrance Gate', description: 'Stately archway designed for high-impact floral and drape decor.', icon: 'Sparkles' },
    { id: 'amenity-6', title: 'Dedicated Catering Space', description: 'Segregated service corridors and preparation yards for catering.', icon: 'Utensils' }
  ],
  suitableEvents: [
    'Weddings & Grand Receptions',
    'Sangeet, Mehendi & Haldi Ceremonies',
    'Engagement & Ring Ceremonies',
    'Birthday & Anniversary Celebrations',
    'Corporate Annual Meets & Product Launches',
    'Religious & Cultural Gatherings'
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
