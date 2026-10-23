import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { CartProvider, useCart } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CatalogueScreen from './src/screens/CatalogueScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import QuotationScreen from './src/screens/QuotationScreen';
import CallbackScreen from './src/screens/CallbackScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminOverviewScreen from './src/screens/AdminOverviewScreen';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});
  const { totalCount } = useCart();
  const { isAdmin } = useAuth();

  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    if (currentScreen === 'ProductDetail' || currentScreen === 'Quotation') {
      setCurrentScreen('Catalogue');
    } else {
      setCurrentScreen('Home');
    }
  };

  const navigation = {
    navigate,
    goBack
  };

  const route = {
    params: screenParams
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} route={route} />;
      case 'Catalogue':
        return <CatalogueScreen navigation={navigation} route={route} />;
      case 'ProductDetail':
        return <ProductDetailScreen navigation={navigation} route={route} />;
      case 'Cart':
        return <CartScreen navigation={navigation} route={route} />;
      case 'Quotation':
        return <QuotationScreen navigation={navigation} route={route} />;
      case 'Callback':
        return <CallbackScreen navigation={navigation} route={route} />;
      case 'OrderTracking':
        return <OrderTrackingScreen navigation={navigation} route={route} />;
      case 'AdminLogin':
        return isAdmin ? (
          <AdminOverviewScreen navigation={navigation} route={route} />
        ) : (
          <AdminLoginScreen navigation={navigation} route={route} />
        );
      case 'AdminOverview':
        return <AdminOverviewScreen navigation={navigation} route={route} />;
      default:
        return <HomeScreen navigation={navigation} route={route} />;
    }
  };

  const navTabs = [
    { id: 'Home', label: 'Home', icon: '🏠' },
    { id: 'Catalogue', label: 'Rentals', icon: '⛺' },
    { id: 'Cart', label: 'Cart', icon: '🛒', badge: totalCount },
    { id: 'Callback', label: 'Veronica', icon: '🎙️' },
    { id: 'OrderTracking', label: 'Track', icon: '📍' },
    { id: isAdmin ? 'AdminOverview' : 'AdminLogin', label: 'Admin', icon: '🔐' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Persistent Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        {navTabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => navigate(tab.id)}
            >
              <View style={styles.tabIconWrap}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                {tab.badge > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  screenContainer: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: {
    alignItems: 'center',
    flex: 1
  },
  tabIconWrap: {
    position: 'relative'
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8'
  },
  activeTabLabel: {
    color: '#c084fc',
    fontWeight: '800'
  }
});
