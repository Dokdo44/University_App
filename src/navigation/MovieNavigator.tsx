import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';

import HomeScreen       from '../screens/movie/HomeScreen';
import MovieListScreen  from '../screens/movie/MovieListScreen';
import MovieDetailScreen from '../screens/movie/MovieDetailScreen';
import AddMovieScreen   from '../screens/movie/AddMovieScreen';
import CalendarScreen   from '../screens/movie/CalendarScreen';
import MovieMoreScreen  from '../screens/movie/MovieMoreScreen';

import { colors, typography, spacing } from '../theme';
import { CoupleSpace }                  from '../types/movie';

// ── Context props injected to every screen ────────────────────────────
interface CtxProps {
  coupleSpace: CoupleSpace;
  isUser1:     boolean;
  myName:      string;
  partnerName: string;
}

// ── Tab icons ─────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:     { active: '🏠', inactive: '🏠' },
  Movies:   { active: '🎬', inactive: '🎬' },
  Calendar: { active: '📅', inactive: '📅' },
  More:     { active: '☰',  inactive: '☰'  },
};

// ── Stack navigators ──────────────────────────────────────────────────
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// Movie stack (list + detail + add)
function MovieStack({ coupleSpace, isUser1, myName, partnerName }: CtxProps) {
  const ctx = { coupleSpaceId: coupleSpace.id, user1Name: coupleSpace.user1Name, user2Name: coupleSpace.user2Name };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovieList">
        {p => <MovieListScreen {...p} {...ctx} />}
      </Stack.Screen>
      <Stack.Screen name="MovieDetail">
        {p => <MovieDetailScreen {...p} {...ctx} />}
      </Stack.Screen>
      <Stack.Screen name="AddMovie" options={{ presentation: 'modal' }}>
        {p => <AddMovieScreen {...p} {...ctx} user1Name={myName || coupleSpace.user1Name} user2Name={partnerName || coupleSpace.user2Name} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Home stack (home + detail + add accessible from home)
function HomeStack({ coupleSpace, isUser1, myName, partnerName }: CtxProps) {
  const ctx = { coupleSpaceId: coupleSpace.id, user1Name: coupleSpace.user1Name, user2Name: coupleSpace.user2Name };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {p => <HomeScreen {...p} {...ctx} />}
      </Stack.Screen>
      <Stack.Screen name="MovieDetail">
        {p => <MovieDetailScreen {...p} {...ctx} />}
      </Stack.Screen>
      <Stack.Screen name="AddMovie" options={{ presentation: 'modal' }}>
        {p => <AddMovieScreen {...p} {...ctx} user1Name={myName || coupleSpace.user1Name} user2Name={partnerName || coupleSpace.user2Name} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Calendar stack
function CalendarStack({ coupleSpace, isUser1, myName, partnerName }: CtxProps) {
  const ctx = { coupleSpaceId: coupleSpace.id, user1Name: coupleSpace.user1Name, user2Name: coupleSpace.user2Name };
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain">
        {p => <CalendarScreen {...p} {...ctx} />}
      </Stack.Screen>
      <Stack.Screen name="MovieDetail">
        {p => <MovieDetailScreen {...p} {...ctx} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ── Custom tab bar ────────────────────────────────────────────────────
function MovieTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const focused     = state.index === index;
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

// ── Main tabs ─────────────────────────────────────────────────────────
export default function MovieNavigator({ coupleSpace, isUser1, myName, partnerName }: CtxProps) {
  const ctx = { coupleSpace, isUser1, myName, partnerName };

  return (
    <Tab.Navigator tabBar={props => <MovieTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"     options={{ tabBarLabel: '홈' }}>
        {() => <HomeStack {...ctx} />}
      </Tab.Screen>
      <Tab.Screen name="Movies"   options={{ tabBarLabel: '영화' }}>
        {() => <MovieStack {...ctx} />}
      </Tab.Screen>
      <Tab.Screen name="Calendar" options={{ tabBarLabel: '캘린더' }}>
        {() => <CalendarStack {...ctx} />}
      </Tab.Screen>
      <Tab.Screen name="More"     options={{ tabBarLabel: '더보기' }}>
        {() => (
          <MovieMoreScreen
            coupleSpace={coupleSpace}
            isUser1={isUser1}
            myName={myName}
            partnerName={partnerName}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderTopWidth:  1,
    borderTopColor:  colors.borderLight,
    paddingTop:      spacing.sm,
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
