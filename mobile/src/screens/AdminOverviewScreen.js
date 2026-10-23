import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminOverviewScreen({ navigation }) {
  const { user, logout, token } = useAuth();
  const [enquiriesCount, setEnquiriesCount] = useState(14);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getEnquiries(token);
      if (res && res.count) {
        setEnquiriesCount(res.count);
      }
    } catch (err) {
      console.warn('Could not load enquiries count:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Executive Command</Text>
            <Text style={styles.adminUserText}>
              Logged in as: <Text style={styles.boldPurple}>{user?.name || user?.username || 'Varun Kandhari'}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              logout();
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>📋</Text>
          <Text style={styles.kpiVal}>{enquiriesCount}</Text>
          <Text style={styles.kpiLabel}>Customer Inquiries</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>🎙️</Text>
          <Text style={styles.kpiVal}>Active</Text>
          <Text style={styles.kpiLabel}>Veronica Telephony</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>👷</Text>
          <Text style={styles.kpiVal}>18</Text>
          <Text style={styles.kpiLabel}>Staff in Daya Register</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiEmoji}>💰</Text>
          <Text style={styles.kpiVal}>₹12.5k</Text>
          <Text style={styles.kpiLabel}>Advances Deducted</Text>
        </View>
      </View>

      {/* Quick Action Modules */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Operations Quick Access</Text>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('Catalogue')}
        >
          <View style={styles.actionIconWrap}>
            <Text style={{ fontSize: 16 }}>📦</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Inventory & 30 Rental Items</Text>
            <Text style={styles.actionSub}>Chairs, Maharaja sofas, pandals, coolers & tables</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('Callback')}
        >
          <View style={styles.actionIconWrap}>
            <Text style={{ fontSize: 16 }}>📞</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Veronica Telephony Logs</Text>
            <Text style={styles.actionSub}>Review inbound call transcripts & scheduled appointments</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('OrderTracking')}
        >
          <View style={styles.actionIconWrap}>
            <Text style={{ fontSize: 16 }}>🚚</Text>
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Order Pipeline & Logistics</Text>
            <Text style={styles.actionSub}>Dispatch status for Lucknow weddings & lawn setups</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Desktop Dashboard Notice */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeHead}>Desktop Admin Console</Text>
        <Text style={styles.noticeBody}>
          For 1..31 Daya attendance grid editing, payroll finalization, outside dhobi payment
          recording, and commercial GST invoices, please access the 20-section admin dashboard
          on your desktop browser at http://localhost:5050/admin.
        </Text>
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
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  adminUserText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  boldPurple: {
    color: '#a78bfa',
    fontWeight: '700'
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700'
  },
  kpiGrid: {
    margin: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  kpiEmoji: {
    fontSize: 20,
    marginBottom: 6
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#c084fc',
    marginBottom: 2
  },
  kpiLabel: {
    fontSize: 11,
    color: '#94a3b8'
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  actionInfo: {
    flex: 1
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },
  actionSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  actionArrow: {
    fontSize: 18,
    color: '#a78bfa',
    fontWeight: 'bold'
  },
  noticeCard: {
    margin: 16,
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  noticeHead: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
    marginBottom: 4
  },
  noticeBody: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16
  }
});
