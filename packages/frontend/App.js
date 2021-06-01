/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import AppNavigator from "./navigation/AppNavigator";

const App = () => {
  return (
    <AppNavigator />
  );
};

const styles = StyleSheet.create();

export default App;
