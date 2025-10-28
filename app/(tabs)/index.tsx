import { Image } from 'expo-image';
import { View, StyleSheet } from 'react-native';

//imports from create-expo-app
//kept for posterity

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { JSX } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from '../../store/store';
import AppNavigator from '../../navigation/AppNavigator';
import { NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <NavigationIndependentTree>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={styles.container}>
        <StatusBar style="auto"/>
      <AppNavigator />
      </View>
      </PersistGate>
    </Provider>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
