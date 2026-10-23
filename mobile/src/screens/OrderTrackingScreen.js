import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

const STATUS_STEPS = [
  { step: 1, title: 'Inquiry Submitted', desc: 'Received by logistics dispatch' },
  { step: 2, title: 'Quotation Prepared', desc: 'Equipment & delivery charges verified' },
  { step: 3, title: 'Deposit Confirmed', desc: 'Advance payment recorded in ledger' },
  { step: 4, title: 'Dispatched for Setup', desc: 'Loading at Daroga Kheda warehouse' },
  { step: 5, title: 'Event Completed', desc: 'Disassembly and post-event inventory' }
];

export default function OrderTrackingScreen({ route, navigation }) {
  const initialEnq = route?.params?.enquiryNumber || '';
  const [enquiryInput, setEnquiryInput] = useState(initialEnq);
  const [trackingData, setTrackingData] = useState(
    initialEnq
      ? {
          enquiryNumber: initialEnq,
          status: 'Quotation Prepared',
          currentStep: 2,
          customerName: 'Client',
          eventDate: '2026-11-20',
          venue: 'Dwarka Shri Lawn, Lucknow',
          itemsCount: 3,
          estimatedTotal: 18500
        }
      : null
  );
  const [loading, setLoading] = useState(false);

  const handleTrack = () => {
    if (!enquiryInput.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setTrackingData({
        enquiryNumber: enquiryInput.trim().toUpperCase(),
        status: 'Quotation Prepared',
        currentStep: 2,
        customerName: 'Valued Patron',
        eventDate: '2026-11-20',
        venue: 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
        itemsCount: 4,
        estimatedTotal: 24500
      });
      setLoading(false);
    }, 600);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order & Quotation Tracking</Text>
        <Text style={styles.headerSub}>Live status for equipment dispatch & Lawn bookings</Text>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchLabel}>Enter Reference Number or Phone</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. ENQ-2026-1001 or 9876543210"
            placeholderTextColor="#64748b"
            value={enquiryInput}
            onChangeText={setEnquiryInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={handleTrack}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.trackBtnText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {trackingData && (
        <View style={styles.resultsWrap}>
          {/* Summary Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeaderRow}>
              <View>
                <Text style={styles.enqNumberText}>{trackingData.enquiryNumber}</Text>
                <Text style={styles.enqVenueText}>📍 {trackingData.venue}</Text>
              </View>
              <View style={styles.activeStatusPill}>
                <Text style={styles.activeStatusPillText}>{trackingData.status}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Event Date</Text>
                <Text style={styles.infoVal}>{trackingData.eventDate}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Equipment</Text>
                <Text style={styles.infoVal}>{trackingData.itemsCount} Categories</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Estimated Total</Text>
                <Text style={styles.infoVal}>₹{trackingData.estimatedTotal.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>

          {/* Stepper Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineHead}>Fulfillment Pipeline</Text>
            {STATUS_STEPS.map((s, idx) => {
              const isPastOrCurrent = s.step <= trackingData.currentStep;
              const isCurrent = s.step === trackingData.currentStep;

              return (
                <View key={s.step} style={styles.stepRow}>
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isPastOrCurrent && styles.stepDotActive,
                        isCurrent && styles.stepDotCurrent
                      ]}
                    >
                      <Text style={styles.stepDotText}>{s.step}</Text>
                    </View>
                    {idx < STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          s.step < trackingData.currentStep && styles.stepLineActive
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepInfoCol}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isPastOrCurrent && styles.stepTitleActive
                      ]}
                    >
                      {s.title}
                    </Text>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

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
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff'
  },
  headerSub: {
    fontSize: 12,
    color: '#a78bfa',
    marginTop: 2
  },
  searchBox: {
    margin: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
    marginBottom: 8
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#475569'
  },
  trackBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  trackBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  resultsWrap: {
    marginHorizontal: 16,
    gap: 14
  },
  statusCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)'
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  enqNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  enqVenueText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  activeStatusPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7c3aed'
  },
  activeStatusPillText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700'
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  infoCol: {
    flex: 1
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  timelineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  timelineHead: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14
  },
  stepIndicatorCol: {
    alignItems: 'center'
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepDotActive: {
    backgroundColor: '#7c3aed'
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: '#c084fc'
  },
  stepDotText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  stepLine: {
    width: 2,
    height: 36,
    backgroundColor: '#334155',
    marginVertical: 2
  },
  stepLineActive: {
    backgroundColor: '#7c3aed'
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: 20
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b'
  },
  stepTitleActive: {
    color: '#ffffff'
  },
  stepDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  }
});
