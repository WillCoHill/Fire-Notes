import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { checkAuth } from '../store/authSlice';
import { RootStackParamList } from '../types/navigation';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import EditNoteScreen from '../screens/EditNoteScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user && token ? (
          // AUTHENTICATED SCREENS
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'My Notes' }}
            />
            <Stack.Screen 
              name="EditNote" 
              component={EditNoteScreen}
              options={{ title: 'Edit Note' }}
            />
          </>
        ) : (
          // AUTH SCREENS REGISTER & LOGIN
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}