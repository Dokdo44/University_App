import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer }           from '@react-navigation/native';
import { createBottomTabNavigator }      from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator }    from '@react-navigation/native-stack';
import { useSafeAreaInsets }             from 'react-native-safe-area-context';

import TimetableScreen  from '../screens/timetable/TimetableScreen';
import BoardScreen      from '../screens/board/BoardScreen';
import PostScreen       from '../screens/board/PostScreen';
import WritePostScreen  from '../screens/board/WritePostScreen';
import ReviewScreen     from '../screens/review/ReviewScreen';
import MoreScreen       from '../screens/more/MoreScreen';
import LoginScreen      from '../screens/auth/LoginScreen';

import { colors, typography } from '../theme';
import { useAuth }            from '../hooks/useAuth';

// ── Tab icons (text-based, swap for react-native-vector-icons) ──────
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Timetable: { active: '📅', inactive: '🗓️' },
  Board:     { active: '💬', inactive: '💬' },
  Review:    { active: '⭐', inactive: '☆' },
  More:      { active: '☰',  inactive: '☰' },
};

// ── Stack navigators ────────────────────────────────────────────────
const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BoardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BoardList"  component={BoardScreen} />
      <Stack.Screen name="Post"       component={PostScreen} />
      <Stack.Screen name="WritePost"  component={WritePostScreen} />
    </Stack.Navigator>
  );
}

// ── Custom Tab Bar ──────────────────────────────────────────────────
function TossTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label: string = options.tabBarLabel ?? route.name;
        const icons = TAB_ICONS[route.name] ?? { active: '●', inactive: '○' };

        return (
          <View key={route.key} style={styles.tabItem}>
            <Text
              style={[styles.tabIcon, focused && styles.tabIconActive]}
              onPress={() => navigation.navigate(route.name)}
            >
              {focused ? icons.active : icons.inactive}
            </Text>
            <Text
              style={[styles.tabLabel, focused && styles.tabLabelActive]}
              onPress={() => navigation.navigate(route.name)}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Main tabs ───────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TossTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Timetable" component={TimetableScreen}  options={{ tabBarLabel: '시간표' }} />
      <Tab.Screen name="Board"     component={BoardStack}        options={{ tabBarLabel: '게시판' }} />
      <Tab.Screen name="Review"    component={ReviewScreen}      options={{ tabBarLabel: '강의평가' }} />
      <Tab.Screen name="More"      component={MoreScreen}        options={{ tabBarLabel: '더보기' }} />
    </Tab.Navigator>
  );
}

// ── Root navigator ──────────────────────────────────────────────────
const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;   // splash placeholder

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <RootStack.Screen name="Main"  component={MainTabs} />
          : <RootStack.Screen name="Login" component={LoginScreen} />}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ── Tab bar styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderTopWidth:  1,
    borderTopColor:  colors.borderLight,
    paddingTop:      8,
    // iOS shadow
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -2 },
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       8,
  },
  tabItem:       { flex: 1, alignItems: 'center' },
  tabIcon:       { fontSize: 20, marginBottom: 3, color: colors.textTertiary },
  tabIconActive: { color: colors.primary },
  tabLabel:      { ...typography.caption2, color: colors.textTertiary },
  tabLabelActive:{ color: colors.primary, fontWeight: '600' },
});
