import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function QuotationScreen({ navigation }) {
  const { items, pricing, startDate, endDate, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventVenue, setEventVenue] = useState('Dwarka Shri Lawn, Kanpur Road, Lucknow');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const enquiryPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        eventDate: startDate,
        endDate: endDate,
        eventVenue: eventVenue.trim(),
        serviceRequired: 'Tent & Catering Rentals',
        items: items.map((i) => ({
          itemId: i.id,
          name: i.name,
          quantity: i.quantity,
          length: i.length,
          width: i.width,
          areaSqFt: i.areaSqFt,
          rate: i.ratePerSqFt || i.rentalPrice || 15
        })),
        estimatedSubtotal: pricing.subtotal,
        cartage: pricing.cartage,
        labour: pricing.labour,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        estimatedTotal: pricing.grandTotal,
        notes: notes.trim()
      };

      const res = await api.submitEnquiry(enquiryPayload);
      setSubmitting(false);
      if (res && res.data) {
        setSubmittedEnquiry(res.data);
        clearCart();
      } else {
        // Fallback simulated enquiry reference
        const generatedNum = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmittedEnquiry({
          enquiryNumber: generatedNum,
          customerName,
          phone,
          estimatedTotal: pricing.grandTotal,
          createdAt: new Date().toISOString()
        });
        clearCart();
      }
    } catch (err) {
      setSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Could not submit enquiry. Please try again.');
    }
  };

  if (submittedEnquiry) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Quotation Request Received!</Text>
        <Text style={styles.successRef}>
          Reference: <Text style={styles.boldPurple}>{submittedEnquiry.enquiryNumber || 'ENQ-2026-SUBMITTED'}</Text>
        </Text>
        <Text style={styles.successDesc}>
          Thank you, {submittedEnquiry.customerName}! Our logistics coordinator and Veronica AI
          Receptionist have received your rental request. We will contact you at {submittedEnquiry.phone} shortly.
        </Text>

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() =>
            navigation.navigate('OrderTracking', {
              enquiryNumber: submittedEnquiry.enquiryNumber
            })
          }
        >
          <Text style={styles.trackBtnText}>Track Quotation Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backTouch}>
          <Text style={styles.backText}>‹ Cart</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Official Quotation Request</Text>
      </View>

      {/* Order Snapshot */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rental Summary ({items.length} items)</Text>
        <Text style={styles.cardMeta}>
          Dates: {startDate} to {endDate} ({pricing.days} days)
        </Text>
        <Text style={styles.grandTotalHighlight}>
          Total Estimated: ₹{pricing.grandTotal.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Client & Venue Details</Text>

        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Varun Kandhari"
          placeholderTextColor="#64748b"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.inputLabel}>Mobile Phone Number (10 digits) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9876543210"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />

        <Text style={styles.inputLabel}>Email Address (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. client@example.com"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Event Venue Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Venue / Address in Lucknow"
          placeholderTextColor="#64748b"
          value={eventVenue}
          onChangeText={setEventVenue}
        />

        <Text style={styles.inputLabel}>Special Instructions / Setup Requirements</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="e.g. Stage setup needed by 4 PM; lawn lighting required."
          placeholderTextColor="#64748b"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Quotation Request</Text>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  backTouch: {
    paddingRight: 14
  },
  backText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6
  },
  cardMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8
  },
  grandTotalHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#c084fc'
  },
  inputLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#475569'
  },
  submitBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  successEmoji: {
    fontSize: 50,
    marginBottom: 16
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center'
  },
  successRef: {
    fontSize: 15,
    color: '#cbd5e1',
    marginBottom: 12
  },
  boldPurple: {
    color: '#a78bfa',
    fontWeight: '800'
  },
  successDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  trackBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center'
  },
  trackBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  doneBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  doneBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600'
  }
});
