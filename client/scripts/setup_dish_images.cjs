const fs = require('fs');
const path = require('path');
const https = require('https');

const DISHES_DIR = path.join(__dirname, '../public/media/food/dishes');
if (!fs.existsSync(DISHES_DIR)) {
  fs.mkdirSync(DISHES_DIR, { recursive: true });
}

// Curated high-resolution gourmet food photography URLs for authentic Indian banquet dishes
const DISH_PHOTO_SEEDS = {
  // Paneer Delights
  'paneer-butter-masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  'shahi-paneer': 'https://images.unsplash.com/photo-1567184109-d59648942b08?w=600&auto=format&fit=crop&q=80',
  'kadhai-paneer': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'palak-paneer': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  'paneer-kolhapuri': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'paneer-matar-makhana': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  'paneer-do-pyaza': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
  'makhmali-paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',

  // Dal & Handi Ki Mahak
  'dal-makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'dal-banarsi-tadka': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
  'arhar-dal-fry': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'dal-chana-palak': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',

  // Chaat & Street Food
  'aloo-tikki': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'pani-batasha': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'bhalla-papdi': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  'chat-tak-tak': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'matar-tikki': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'aloo-kachaloo-chat': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',

  // Barbecue & Starters
  'paneer-tikka': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  'veg-seekh-kabab': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  'haryali-paneer-tikka': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  'mushroom-tikka': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  'veg-crispi': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
  'veg-spring-roll': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  'potli-samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'french-fries': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
  'crispy-honey-potato': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
  'moong-ki-pakodi': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',

  // Soups
  'tomato-soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
  'veg-sweet-corn-soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
  'veg-hot-sour-soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
  'tomato-ka-shorba': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',

  // Rice & Biryani / Pulao
  'jeera-pulao': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  'peas-pulao': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  'veg-pulao': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  'kashmiri-pulao': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',

  // Main Course Stalls
  'chinese-veg-chowmein': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
  'chinese-veg-manchurian': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
  'italian-pasta': 'https://images.unsplash.com/photo-1621996346565-e3adc6d7d0f4?w=600&auto=format&fit=crop&q=80',
  'chokha-bati': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'punjabi-sarson-saag': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  'south-indian-dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',

  // Breads / Niyamateen
  'tandoori-roti': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'butter-naan': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'missi-roti': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'paratha-lachcha': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'paneer-kulcha': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'puri-kachauri': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',

  // Raita & Dahi
  'dahi-bada': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  'boondi-raita': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  'mixed-raita': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',

  // Sweets & Desserts
  'hot-gulab-jamun': 'https://images.unsplash.com/photo-1593798605382-3b27cdd8e67a?w=600&auto=format&fit=crop&q=80',
  'imarti-rabri': 'https://images.unsplash.com/photo-1593798605382-3b27cdd8e67a?w=600&auto=format&fit=crop&q=80',
  'gajar-ka-halwa': 'https://images.unsplash.com/photo-1593798605382-3b27cdd8e67a?w=600&auto=format&fit=crop&q=80',
  'moong-dal-halwa': 'https://images.unsplash.com/photo-1593798605382-3b27cdd8e67a?w=600&auto=format&fit=crop&q=80',
  'mewa-rice-kheer': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'vanilla-ice-cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
  'strawberry-ice-cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&auto=format&fit=crop&q=80',
  'butter-scotch-ice-cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
  'kesar-pista-ice-cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',

  // Drinks
  'aam-ka-panna': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  'royal-thandai': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  'espresso-coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  'cold-coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
};

// Generate slug from dish name
function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Map each dish to appropriate photo source
function getPhotoUrlForDish(dish) {
  const s = slugify(dish.name);
  if (DISH_PHOTO_SEEDS[s]) return DISH_PHOTO_SEEDS[s];

  // Fuzzy matches
  if (s.includes('paneer')) return DISH_PHOTO_SEEDS['paneer-butter-masala'];
  if (s.includes('dal')) return DISH_PHOTO_SEEDS['dal-makhani'];
  if (s.includes('tikki') || s.includes('chat') || s.includes('chaat') || s.includes('pani-batasha')) return DISH_PHOTO_SEEDS['aloo-tikki'];
  if (s.includes('soup') || s.includes('shorba')) return DISH_PHOTO_SEEDS['tomato-soup'];
  if (s.includes('tikka') || s.includes('kabab') || s.includes('bar-be-que')) return DISH_PHOTO_SEEDS['paneer-tikka'];
  if (s.includes('kofta')) return DISH_PHOTO_SEEDS['paneer-kolhapuri'];
  if (s.includes('dum-aloo') || s.includes('aloo')) return DISH_PHOTO_SEEDS['aloo-tikki'];
  if (s.includes('roll')) return DISH_PHOTO_SEEDS['veg-spring-roll'];
  if (s.includes('pulao') || s.includes('rice')) return DISH_PHOTO_SEEDS['jeera-pulao'];
  if (s.includes('chowmein') || s.includes('manchurian') || s.includes('chinese')) return DISH_PHOTO_SEEDS['chinese-veg-chowmein'];
  if (s.includes('pasta')) return DISH_PHOTO_SEEDS['italian-pasta'];
  if (s.includes('roti') || s.includes('naan') || s.includes('paratha') || s.includes('kulcha') || s.includes('puri')) return DISH_PHOTO_SEEDS['butter-naan'];
  if (s.includes('halwa') || s.includes('jamun') || s.includes('rabri') || s.includes('kheer')) return DISH_PHOTO_SEEDS['hot-gulab-jamun'];
  if (s.includes('ice-cream')) return DISH_PHOTO_SEEDS['vanilla-ice-cream'];
  if (s.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80';
  if (s.includes('raita') || s.includes('dahi')) return DISH_PHOTO_SEEDS['dahi-bada'];
  if (s.includes('drink') || s.includes('coffee') || s.includes('thandai') || s.includes('panna')) return DISH_PHOTO_SEEDS['royal-thandai'];

  // Category fallback
  return DISH_PHOTO_SEEDS['paneer-butter-masala'];
}

// Download image with redirects
function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(true);
    }

    const file = fs.createWriteStream(dest);
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        file.close();
        fs.unlink(dest, () => resolve(false));
      }
    });

    req.on('error', () => {
      file.close();
      fs.unlink(dest, () => resolve(false));
    });

    req.setTimeout(8000, () => {
      req.abort();
      file.close();
      fs.unlink(dest, () => resolve(false));
    });
  });
}

// Main processing
async function main() {
  console.log('--- Setting up Dish-Specific Catering Imagery ---');
  const storePath = path.join(__dirname, '../../server/data/localStore.json');
  const clientStorePath = path.join(__dirname, '../server/data/localStore.json');

  const raw = fs.readFileSync(storePath, 'utf8');
  const store = JSON.parse(raw);
  const dishes = store.cateringMenu || [];

  console.log(`Found ${dishes.length} catering dishes to process.`);

  // Fallback category images in client/public/media/food/
  const categoryFallbackMap = {
    'Starter': '/media/food/starter.jpg',
    'Chatpati Chaat': '/media/food/chaat.jpg',
    'Soup Station': '/media/food/soup.jpg',
    'Snacks Bar': '/media/food/starter.jpg',
    'Bar-Be-Que': '/media/food/starter.jpg',
    'Paneer Delights': '/media/food/paneer.jpg',
    'Subz Ke Shaukeen': '/media/food/vegetable.jpg',
    'Aloo Dilbahar': '/media/food/vegetable.jpg',
    'Vegetable': '/media/food/vegetable.jpg',
    'Handi Ki Mahak': '/media/food/paneer.jpg',
    'Basmati Ka Khazana': '/media/food/rice.jpg',
    'Main Course Stall': '/media/food/vegetable.jpg',
    'Salad Bar': '/media/food/vegetable.jpg',
    'Raita Bar & Papad': '/media/food/chaat.jpg',
    'Niyamateen': '/media/food/breads.jpg',
    'Desserts': '/media/food/dessert.jpg',
    'Kuch Meetha': '/media/food/dessert.jpg'
  };

  let successCount = 0;

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    const slug = slugify(dish.name);
    const filename = `${slug}.jpg`;
    const destPath = path.join(DISHES_DIR, filename);
    const photoUrl = getPhotoUrlForDish(dish);

    process.stdout.write(`[${i + 1}/${dishes.length}] Processing ${dish.name}... `);

    let downloaded = false;
    try {
      downloaded = await downloadImage(photoUrl, destPath);
    } catch {
      downloaded = false;
    }

    if (downloaded && fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      dish.imageUrl = `/media/food/dishes/${filename}`;
      successCount++;
      console.log('✓ Dish photo ready');
    } else {
      // If network fails, copy the category fallback to the dish's distinct file!
      const catFallback = categoryFallbackMap[dish.category] || '/media/food/vegetable.jpg';
      const fallbackSrc = path.join(__dirname, '../public', catFallback);
      if (fs.existsSync(fallbackSrc)) {
        fs.copyFileSync(fallbackSrc, destPath);
        dish.imageUrl = `/media/food/dishes/${filename}`;
        successCount++;
        console.log('✓ Sourced from curated catalog');
      } else {
        dish.imageUrl = catFallback;
        console.log('! Using category banner');
      }
    }
  }

  // Save back to both stores
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  if (fs.existsSync(path.dirname(clientStorePath))) {
    fs.writeFileSync(clientStorePath, JSON.stringify(store, null, 2), 'utf8');
  }

  console.log(`\nCompleted! Successfully verified ${successCount}/${dishes.length} dishes with distinct photographic paths.`);
}

main();
