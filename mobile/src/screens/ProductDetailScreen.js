import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions
} from 'react-native';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { item } = route.params || {};
  const isArea = Boolean(item?.isAreaBased || item?.ratePerSqFt);

  const [quantity, setQuantity] = useState(1);
  const [length, setLength] = useState('20');
  const [widthVal, setWidthVal] = useState('30');
  const [added, setAdded] = useState(false);

  const { addItem, totalCount } = useCart();

  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: '#fff' }}>Item not found</Text>
      </View>
    );
  }

  const numLength = Number(length) || 20;
  const numWidth = Number(widthVal) || 30;
  const areaSqFt = numLength * numWidth;
  const rate = Number(item.ratePerSqFt || item.rentalPrice || 15);
  const singleDayPrice = isArea ? areaSqFt * rate : rate * quantity;

  const handleAddToCart = () => {
    const customDims = isArea ? { length: numLength, width: numWidth, areaSqFt } : {};
    addItem(item, quantity, customDims);
    setAdded(true);
    setTimeout(() => {
      navigation.navigate('Cart');
    }, 500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartBtn}
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

      <View style={styles.content}>
        <View style={styles.catRow}>
          <Text style={styles.categoryPill}>{item.categoryId}</Text>
          {item.dimensions && (
            <Text style={styles.dimPill}>Standard: {item.dimensions}</Text>
          )}
        </View>

        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.priceRow}>
          <Text style={styles.priceVal}>
            ₹{isArea ? `${rate}/sq.ft` : rate}
          </Text>
          <Text style={styles.priceSub}> / day rental</Text>
        </Text>

        <Text style={styles.desc}>
          {item.description || 'Premium quality rental event infrastructure supplied by Kandhari Tent & Caterers, Lucknow. Thoroughly inspected and cleaned before each deployment.'}
        </Text>

        {/* Custom Area Dimensions if Area Based */}
        {isArea && (
          <View style={styles.areaConfigBox}>
            <Text style={styles.configHead}>Pandal / Tent Dimensions</Text>
            <Text style={styles.configSub}>
              Enter length and width in feet (Min. recommended 20×30 ft = 600 sq.ft)
            </Text>
            <View style={styles.dimInputRow}>
              <View style={styles.dimInputCol}>
                <Text style={styles.dimLabel}>Length (ft)</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={length}
                  onChangeText={setLength}
                />
              </View>
              <Text style={styles.dimX}>×</Text>
              <View style={styles.dimInputCol}>
                <Text style={styles.dimLabel}>Width (ft)</Text>
                <TextInput
                  style={styles.dimInput}
                  keyboardType="numeric"
                  value={widthVal}
                  onChangeText={setWidthVal}
                />
              </View>
            </View>
            <View style={styles.calcPreview}>
              <Text style={styles.calcText}>
                Total Ground Area: <Text style={styles.boldWhite}>{areaSqFt} sq.ft</Text>
              </Text>
              <Text style={styles.calcText}>
                Rate: <Text style={styles.boldWhite}>₹{rate}/sq.ft/day</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Quantity Stepper */}
        {!isArea && (
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pricing Subtotal Notice */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Estimated 1-Day Subtotal</Text>
          <Text style={styles.summaryVal}>₹{singleDayPrice.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addCartBtn, added && styles.addedBtn]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addCartText}>
            {added ? '✓ Added! Opening Cart...' : '+ Add to Quotation Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a'
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 280
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b'
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  cartBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 10,
    borderRadius: 20
  },
  badgeCircle: {
    position: 'absolute',
    top: -2,
    right: -2,
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
  content: {
    padding: 20
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  categoryPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a78bfa',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  dimPill: {
    fontSize: 11,
    color: '#94a3b8',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8
  },
  priceRow: {
    marginBottom: 14
  },
  priceVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#c084fc'
  },
  priceSub: {
    fontSize: 13,
    color: '#94a3b8'
  },
  desc: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 20
  },
  areaConfigBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  configHead: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  configSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12
  },
  dimInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  dimInputCol: {
    flex: 1
  },
  dimLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    marginBottom: 4
  },
  dimInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#475569',
    textAlign: 'center'
  },
  dimX: {
    fontSize: 18,
    color: '#94a3b8',
    marginHorizontal: 12,
    marginTop: 18
  },
  calcPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  calcText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  boldWhite: {
    color: '#ffffff',
    fontWeight: '700'
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569'
  },
  stepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  stepBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  qtyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center'
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  summaryLabel: {
    fontSize: 13,
    color: '#cbd5e1'
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#c084fc'
  },
  addCartBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40
  },
  addedBtn: {
    backgroundColor: '#16a34a'
  },
  addCartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  }
});
