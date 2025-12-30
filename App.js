import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SearchScreen from './src/screens/SearchScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import VibesScreen from './src/screens/VibesScreen';
import SavedScreen from './src/screens/SavedScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SearchHome"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: 'Restaurant Details' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Search"
          component={SearchStack}
          options={{ tabBarLabel: 'Search' }}
        />
        <Tab.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{ tabBarLabel: 'Lists' }}
        />
        <Tab.Screen
          name="Vibes"
          component={VibesScreen}
          options={{ tabBarLabel: 'Vibes' }}
        />
        <Tab.Screen
          name="Saved"
          component={SavedScreen}
          options={{ tabBarLabel: 'Saved' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
