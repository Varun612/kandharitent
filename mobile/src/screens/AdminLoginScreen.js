import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, isAdmin } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your username/email and password.');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (res.success) {
      navigation.navigate('AdminOverview');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <View style={styles.lockIconWrap}>
          <Text style={{ fontSize: 36 }}>🔐</Text>
        </View>

        <Text style={styles.heading}>Admin Portal Login</Text>
        <Text style={styles.subheading}>
          Kandhari Tent & Caterers Management Console
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin or varunkandhari612@gmail.com"
            placeholderTextColor="#64748b"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginBtnText}>Secure Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Protected by Dual-Identifier JWT authentication and bcrypt password hashing.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20
  },
  contentWrap: {
    alignItems: 'center'
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6
  },
  subheading: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 8,
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
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 10
  },
  loginBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  footerNote: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 20,
    textAlign: 'center'
  }
});
