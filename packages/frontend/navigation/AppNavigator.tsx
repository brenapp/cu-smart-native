import React, { useState } from "react";

import {
  NavigationContainer,
  RouteProp,
  useNavigation,
} from "@react-navigation/native";
import {
  createStackNavigator,
  HeaderBackButton,
} from "@react-navigation/stack";

import BuildingSelectionScreen from "../screens/BuildingSelection/BuildingSelectionScreen";
import RoomSelectionScreen from "../screens/RoomSelection/RoomSelectionScreen";
import UserFeedbackScreen from "../screens/UserFeedback/UserFeedbackScreen";
import AuthenticationScreen from "../screens/Authentication/AuthenticationScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import QRCodeScannerScreen from "../screens/QRCode/QRCodeScannerScreen";
import { StatusBar, useColorMode, useTheme } from "native-base";

const screens = [
  HomeScreen,
  AuthenticationScreen,
  QRCodeScannerScreen,
  BuildingSelectionScreen,
  RoomSelectionScreen,
  UserFeedbackScreen,
];

const AppNavigator = () => {
  const Stack = createStackNavigator();
  const [screen, setScreen] = useState<number>(0);
  const { colorMode, toggleColorMode } = useColorMode();
  const theme = useTheme();

  return (
    <NavigationContainer onStateChange={state => setScreen(state?.index ?? -1)}>
      <StatusBar
        backgroundColor={
          colorMode === "dark" ? "#1a1a1a" : theme.colors.primary["500"]
        }
      />
      <Stack.Navigator headerMode="float">
        {screens.map(({ Screen, name, header }) => (
          <Stack.Screen
            name={name}
            component={Screen}
            key={name}
            options={header}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
