import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    distanceKm,
    setDistanceKm,
    coupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    pricing
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    const res = await applyCouponCode(couponInput.trim());
    setValidatingCoupon(false);
    if (res.success) {
      setCouponInput('');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySub}>
          Add chairs, sofas, pandals, tables or coolers to generate an official quotation.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('Catalogue')}
        >
          <Text style={styles.browseBtnText}>Browse Rental Catalogue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Rental Quotation Cart ({items.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Item List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Selected Event Equipment</Text>
        {items.map((item) => {
          const isArea = Boolean(item.isAreaBased || item.ratePerSqFt);
          return (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {isArea ? (
                  <Text style={styles.itemMeta}>
                    {item.length || 20}×{item.width || 30} ft ({((item.length || 20) * (item.width || 30))} sq.ft) @ ₹{item.ratePerSqFt || 5}/sq.ft
                  </Text>
                ) : (
                  <Text style={styles.itemMeta}>
                    ₹{item.rentalPrice || 15}/day × {item.quantity} qty
                  </Text>
                )}

                <View style={styles.itemBottomRow}>
                  {!isArea && (
                    <View style={styles.miniStepper}>
                      <TouchableOpacity
                        style={styles.miniStepBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Text style={styles.miniStepText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.miniQtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.miniStepBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Text style={styles.miniStepText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Dates & Duration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Rental Duration ({pricing.days} Days)</Text>
        <View style={styles.datesRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Event Start Date</Text>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Event End Date</Text>
            <TextInput
              style={styles.dateInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>
      </View>

      {/* Distance Band Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Delivery Distance from Daroga Kheda</Text>
        <Text style={styles.distanceBandText}>Current: {pricing.distanceBand}</Text>
        <View style={styles.distancePillRow}>
          <TouchableOpacity
            style={[styles.distPill, distanceKm <= 3 && styles.distPillActive]}
            onPress={() => setDistanceKm(2.5)}
          >
            <Text style={[styles.distPillText, distanceKm <= 3 && styles.distPillTextActive]}>
              0-3 km (Local)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.distPill, distanceKm > 3 && distanceKm <= 7 && styles.distPillActive]}
            onPress={() => setDistanceKm(5.5)}
          >
            <Text style={[styles.distPillText, distanceKm > 3 && distanceKm <= 7 && styles.distPillTextActive]}>
              3-7 km (Mid)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.distPill, distanceKm > 7 && styles.distPillActive]}
            onPress={() => setDistanceKm(12)}
          >
            <Text style={[styles.distPillText, distanceKm > 7 && styles.distPillTextActive]}>
              >7 km (Outskirts)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Coupon & Promo Codes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Promo / Discount Coupon</Text>
        {coupon ? (
          <View style={styles.appliedCouponBox}>
            <View>
              <Text style={styles.appliedCode}>✓ {coupon.code}</Text>
              <Text style={styles.appliedDesc}>{coupon.description}</Text>
            </View>
            <TouchableOpacity onPress={removeCoupon}>
              <Text style={styles.removeCouponText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon (e.g. WELCOME100, FIRST200)"
                placeholderTextColor="#64748b"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyCouponBtn}
                onPress={handleApplyCoupon}
                disabled={validatingCoupon}
              >
                <Text style={styles.applyCouponBtnText}>
                  {validatingCoupon ? '...' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
            {couponError ? (
              <Text style={styles.couponErrorText}>{couponError}</Text>
            ) : null}
            <Text style={styles.couponHint}>
              Try: <Text style={{ color: '#a78bfa' }}>WELCOME100</Text> (₹100 off &gt;₹2000), <Text style={{ color: '#a78bfa' }}>FIRST200</Text> (₹200 off &gt;₹5000), or <Text style={{ color: '#a78bfa' }}>EARLYBIRD10</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Price Summary Breakdown */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Commercial Cost Breakdown</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLeft}>Equipment Subtotal</Text>
          <Text style={styles.summaryRight}>₹{pricing.subtotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLeft}>Cartage / Transport</Text>
          <Text style={styles.summaryRight}>₹{pricing.cartage.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLeft}>Labour & Setup</Text>
          <Text style={styles.summaryRight}>₹{pricing.labour.toLocaleString('en-IN')}</Text>
        </View>
        {pricing.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLeft, { color: '#22c55e' }]}>
              Coupon Discount ({pricing.couponCode})
            </Text>
            <Text style={[styles.summaryRight, { color: '#22c55e' }]}>
              -₹{pricing.discount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.grandTotalLabel}>Estimated Grand Total</Text>
          <Text style={styles.grandTotalVal}>₹{pricing.grandTotal.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Proceed CTA */}
      <TouchableOpacity
        style={styles.proceedBtn}
        onPress={() => navigation.navigate('Quotation')}
      >
        <Text style={styles.proceedBtnText}>Request Official Quotation ›</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  browseBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  browseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  clearBtnText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600'
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#0f172a'
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },
  itemMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569'
  },
  miniStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  miniStepText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  miniQtyText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center'
  },
  removeBtnText: {
    fontSize: 11,
    color: '#f87171',
    fontWeight: '600'
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12
  },
  dateCol: {
    flex: 1
  },
  dateLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4
  },
  dateInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#475569'
  },
  distanceBandText: {
    fontSize: 11,
    color: '#a78bfa',
    marginBottom: 8
  },
  distancePillRow: {
    flexDirection: 'row',
    gap: 8
  },
  distPill: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  distPillActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderColor: '#7c3aed'
  },
  distPillText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600'
  },
  distPillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#475569'
  },
  applyCouponBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center'
  },
  applyCouponBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  couponHint: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6
  },
  couponErrorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4
  },
  appliedCouponBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e'
  },
  appliedCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4ade80'
  },
  appliedDesc: {
    fontSize: 10,
    color: '#cbd5e1'
  },
  removeCouponText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700'
  },
  summaryBox: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  summaryLeft: {
    fontSize: 12,
    color: '#cbd5e1'
  },
  summaryRight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#c084fc'
  },
  proceedBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  proceedBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  }
});
