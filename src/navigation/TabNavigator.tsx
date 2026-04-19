import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BudgetListScreen from '../screens/free/BudgetListScreen';
import TransactionsScreen from '../screens/free/TransactionsScreen';
import AddBudgetScreen from '../screens/free/AddBudgetScreen';
import CalendarScreen from '../screens/premium/CalendarScreen';
import SwipeScreen from '../screens/premium/SwipeScreen';
import BankConnectionScreen from '../screens/BankConnectionScreen';
import ProfileScreen from '../screens/free/ProfileScreen';
import { useTheme } from '../store/ThemeContext';

const Tab = createBottomTabNavigator();

function AddButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <TouchableOpacity style={[styles.addButton, { backgroundColor: color, shadowColor: color }]} onPress={onPress}>
      <Ionicons name="add" size={30} color="#fff" />
    </TouchableOpacity>
  );
}

function LiteBadge() {
  return (
    <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
      <Text style={styles.badgeText}>LITE</Text>
    </View>
  );
}


export default function TabNavigator() {
  const { primaryColor } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Budgets"
        component={BudgetListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddBudgetScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <AddButton color={primaryColor} onPress={() => props.onPress?.()} />
          ),
        }}
      />
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="swap-horizontal-outline" size={size} color={color} />
              <LiteBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="calendar-outline" size={size} color={color} />
              <LiteBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Bank"
        component={BankConnectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="link-outline" size={size} color={color} />
              <LiteBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  addButton: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, shadowOpacity: 0.5,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  badge: {
    position: 'absolute', top: -4, right: -10,
    borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1,
  },
  badgeText: { fontSize: 7, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
});
