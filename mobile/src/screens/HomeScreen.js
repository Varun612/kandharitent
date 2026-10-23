import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'chairs-seating', name: 'Chairs & Sofas', icon: '🪑' },
  { id: 'tables', name: 'Banquet Tables', icon: '🍽️' },
  { id: 'tents-canopies', name: 'Tents & Pandals', icon: '⛺' },
  { id: 'stages-platforms', name: 'Stages & Mandaps', icon: '🏛️' },
  { id: 'fans-coolers', name: 'Coolers & Fans', icon: '❄️' },
  { id: 'carpets-flooring', name: '3D Carpets', icon: '🧶' },
  { id: 'barricading-crowd-control', name: 'Barricades', icon: '🚧' },
  { id: 'wedding-essentials', name: 'Welcome Gates', icon: '✨' }
];

export default function HomeScreen({ navigation }) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, totalCount } = useCart();

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const res = await api.getItems();
      if (res && res.data) {
        setFeaturedItems(res.data.slice(0, 6));
      }
    } catch (err) {
      console.warn('Could not load featured items:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header / Branding */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandTitle}>KANDHARI TENT</Text>
            <Text style={styles.brandSubtitle}>& Caterers • Dwarka Shri Lawn</Text>
            <Text style={styles.locationText}>📍 Kanpur Road, Lucknow, UP</Text>
          </View>
          <TouchableOpacity
            style={styles.cartBadgeBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {totalCount > 0 && (
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeText}>{totalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>PREMIUM EVENT INFRASTRUCTURE</Text>
        <Text style={styles.heroHeading}>Royal Awadhi Celebrations & Flawless Rentals</Text>
        <Text style={styles.heroDesc}>
          Complete tents, sound-damped banquet furniture, Maharaja sofas, German hangars, and
          Dwarka Shri Lawn bookings.
        </Text>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Catalogue')}
          >
            <Text style={styles.primaryBtnText}>Explore Rentals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Callback')}
          >
            <Text style={styles.secondaryBtnText}>Talk to Veronica</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Veronica AI Receptionist Banner */}
      <TouchableOpacity
        style={styles.veronicaBanner}
        onPress={() => navigation.navigate('Callback')}
      >
        <View style={styles.veronicaIconWrap}>
          <Text style={styles.veronicaEmoji}>🎙️</Text>
        </View>
        <View style={styles.veronicaTextWrap}>
          <View style={styles.veronicaTitleRow}>
            <Text style={styles.veronicaTitle}>Veronica — AI Receptionist</Text>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>24/7 ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.veronicaSub}>
            Inbound telephony & instant quotes. Tap to speak or request a call.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Categories Horizontal Carousel */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Rental Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
          <Text style={styles.seeAllText}>See all ({CATEGORIES.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryPill}
            onPress={() => navigation.navigate('Catalogue', { selectedCategory: cat.id })}
          >
            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            <Text style={styles.categoryPillText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Items */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Popular Event Rentals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.gridContainer}>
          {featuredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cardPrice}>
                  ₹{item.rentalPrice || item.ratePerSqFt || 15}
                  <Text style={styles.cardPerUnit}>
                    {item.isAreaBased ? '/sq.ft/day' : '/day'}
                  </Text>
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardAddBtn}
                    onPress={() => {
                      addItem(item, 1);
                    }}
                  >
                    <Text style={styles.cardAddBtnText}>+ Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardDetailBtn}
                    onPress={() => navigation.navigate('ProductDetail', { item })}
                  >
                    <Text style={styles.cardDetailBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Venue Showcase Callout */}
      <View style={styles.venueBanner}>
        <Text style={styles.venueBadge}>OFFICIAL EVENT VENUE</Text>
        <Text style={styles.venueTitle}>Dwarka Shri Lawn</Text>
        <Text style={styles.venueDesc}>
          Capacity 800+ guests • Lush green lawn • Air-conditioned bridal suite • Ample valet
          parking • Opp. Pillar No. 37, Kanpur Road.
        </Text>
        <TouchableOpacity
          style={styles.venueBookBtn}
          onPress={() => navigation.navigate('Callback', { query: 'Dwarka Shri Lawn venue booking enquiry' })}
        >
          <Text style={styles.venueBookBtnText}>Schedule Lawn Walkthrough</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1e1b4b'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600'
  },
  locationText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  cartBadgeBtn: {
    position: 'relative',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7c3aed'
  },
  cartIcon: {
    fontSize: 20
  },
  badgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  heroCard: {
    margin: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)'
  },
  heroTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c084fc',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  heroHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: 25,
    marginBottom: 8
  },
  heroDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 16
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  secondaryBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600'
  },
  veronicaBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },
  veronicaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  veronicaEmoji: {
    fontSize: 22
  },
  veronicaTextWrap: {
    flex: 1
  },
  veronicaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  veronicaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4ade80'
  },
  veronicaSub: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f1f5f9'
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa'
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6
  },
  categoryPillText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600'
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#0f172a'
  },
  cardBody: {
    padding: 10
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#a78bfa',
    marginBottom: 8
  },
  cardPerUnit: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '400'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6
  },
  cardAddBtn: {
    flex: 2,
    backgroundColor: '#7c3aed',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center'
  },
  cardAddBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  cardDetailBtn: {
    flex: 1.2,
    backgroundColor: '#334155',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center'
  },
  cardDetailBtnText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '600'
  },
  venueBanner: {
    margin: 16,
    backgroundColor: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  venueBadge: {
    fontSize: 10,
    color: '#818cf8',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 4
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6
  },
  venueDesc: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
    marginBottom: 14
  },
  venueBookBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  venueBookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  }
});
