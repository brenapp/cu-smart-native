import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, HeaderBackButton } from "@react-navigation/stack";

import UserNavigator from "./UserNavigator";
import RoomSelectionScreen from "../screens/RoomSelectionScreen";

const AppNavigator = props => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode = 'screen'>
        <Stack.Screen name="Room Selection" component={RoomSelectionScreen} />
        <Stack.Screen name="User Tab" component={UserNavigator} options={{
            headerLeft: () => {},
        }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
