import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";

import UserNavigator from "./UserNavigator";
import RoomSelectionScreen from "../screens/RoomSelectionScreen";

const AppNavigator = props => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="RoomSelection" component={RoomSelectionScreen} />
        <Stack.Screen name="UserTab" component={UserNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
