import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer }       from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen      from '../screens/auth/LoginScreen';
import CoupleSetupScreen from '../screens/couple/CoupleSetupScreen';
import MovieNavigator   from './MovieNavigator';

import { colors }      from '../theme';
import { useAuth }     from '../hooks/useAuth';
import { useCouple }   from '../hooks/useCouple';

const RootStack = createNativeStackNavigator();

// ── Root navigator ──────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading: authLoading }           = useAuth();
  const { coupleSpace, loading: coupleLoading, isUser1, myName, partnerName, refresh } = useCouple(user);

  if (authLoading || (user && coupleLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // ── Not logged in ───────────────────────────────────────────
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : !coupleSpace ? (
          // ── Logged in but no couple space ───────────────────────────
          <RootStack.Screen name="CoupleSetup">
            {() => (
              <CoupleSetupScreen
                userId={user.uid}
                onJoined={refresh}
              />
            )}
          </RootStack.Screen>
        ) : (
          // ── Fully set up: show movie journal ────────────────────────
          <RootStack.Screen name="MovieApp">
            {() => (
              <MovieNavigator
                coupleSpace={coupleSpace}
                isUser1={isUser1}
                myName={myName}
                partnerName={partnerName}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
