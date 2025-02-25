import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import BeanDetailScreen from '../screens/BeanDetailScreen';
import RatingScreen from '../screens/RatingScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import theme
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textInverse,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Beanio' }} 
        />
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Scan Coffee Beans' }} 
        />
        <Stack.Screen 
          name="BeanDetail" 
          component={BeanDetailScreen} 
          options={({ route }) => ({ title: route.params?.beanName || 'Bean Details' })} 
        />
        <Stack.Screen 
          name="Rating" 
          component={RatingScreen} 
          options={{ title: 'Rate Coffee Beans' }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Your Profile' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
