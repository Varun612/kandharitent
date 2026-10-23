import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items' },
  { id: 'chairs-seating', label: 'Chairs & Sofas' },
  { id: 'tables', label: 'Banquet Tables' },
  { id: 'tents-canopies', label: 'Tents & Pandals' },
  { id: 'stages-platforms', label: 'Stages & Mandap' },
  { id: 'fans-coolers', label: 'Coolers & Fans' },
  { id: 'carpets-flooring', label: '3D Carpets' },
  { id: 'barricading-crowd-control', label: 'Barricading' },
  { id: 'wedding-essentials', label: 'Welcome Gates' }
];

export default function CatalogueScreen({ route, navigation }) {
  const initialCategory = route?.params?.selectedCategory || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItemNotice, setAddedItemNotice] = useState(null);
  const { addItem, totalCount } = useCart();

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const res = await api.getItems(params);
      if (res && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.warn('Failed to load items:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.categoryId?.toLowerCase().includes(q)
    );
  });

  const handleAddToCart = (item) => {
    addItem(item, 1);
    setAddedItemNotice(`${item.name} added!`);
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 2000);
  };

  const renderItem = ({ item }) => {
    const isArea = Boolean(item.isAreaBased || item.ratePerSqFt);
    const priceText = isArea
      ? `₹${item.ratePerSqFt || 5}/sq.ft/day`
      : `₹${item.rentalPrice || 15}/day`;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProductDetail', { item })}
        >
          <Image
            source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.categoryBadge}>{item.categoryId || 'Rental'}</Text>
            {item.dimensions && (
              <Text style={styles.dimBadge}>{item.dimensions}</Text>
            )}
          </View>

          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>

          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardPrice}>{priceText}</Text>
              {isArea && (
                <Text style={styles.areaNote}>Min: 20×30 ft (600 sq.ft)</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addBtnText}>+ Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchBarWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chairs, sofas, pandals, coolers..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={{ fontSize: 18 }}>🛒</Text>
          {totalCount > 0 && (
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Pills Slider */}
      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_TABS}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          renderItem={({ item: cat }) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                style={[styles.tabPill, active && styles.activeTabPill]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.tabPillText, active && styles.activeTabPillText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notification Toast */}
      {addedItemNotice && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {addedItemNotice}</Text>
        </View>
      )}

      {/* Items List */}
      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>
                Try selecting another category or clear your search query.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#1e1b4b',
    gap: 10
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cartIconBtn: {
    position: 'relative',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c3aed'
  },
  badgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  tabsWrap: {
    paddingVertical: 10,
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeTabPill: {
    backgroundColor: '#7c3aed',
    borderColor: '#a78bfa'
  },
  tabPillText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600'
  },
  activeTabPillText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  toast: {
    backgroundColor: '#22c55e',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    gap: 14
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#0f172a'
  },
  cardContent: {
    padding: 14
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a78bfa',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  dimBadge: {
    fontSize: 10,
    color: '#94a3b8',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#c084fc'
  },
  areaNote: {
    fontSize: 10,
    color: '#64748b'
  },
  addBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8'
  }
});
