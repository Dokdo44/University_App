import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import ScheduleScreen   from '../screens/scheduling/ScheduleScreen';
import EnrollScreen     from '../screens/scheduling/EnrollScreen';
import ForumListScreen  from '../screens/forum/ForumListScreen';
import ThreadListScreen from '../screens/forum/ThreadListScreen';
import ThreadScreen     from '../screens/forum/ThreadScreen';
import LoginScreen      from '../screens/auth/LoginScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function SchedulingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Enroll"   component={EnrollScreen} />
    </Stack.Navigator>
  );
}

function ForumStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Forums"    component={ForumListScreen} />
      <Stack.Screen name="Threads"   component={ThreadListScreen} />
      <Stack.Screen name="Thread"    component={ThreadScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Scheduling" component={SchedulingStack} />
      <Tab.Screen name="Community"  component={ForumStack} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // In production, swap between LoginScreen and MainTabs based on auth state.
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main"  component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
