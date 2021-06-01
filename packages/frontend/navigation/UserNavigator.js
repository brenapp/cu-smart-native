import React from "react";
import { Platform, SafeAreaView, Button, View } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import UserFeedbackScreen from "../screens/UserFeedbackScreen";
import HeatMapScreen from "../screens/HeatMapScreen";
import RecommendationScreen from "../screens/RecommendationScreen";

const UserNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator>
      <Tab.Screen name="UserFeedback" component={UserFeedbackScreen} />
      <Tab.Screen name="HeatMap" component={HeatMapScreen} />
      <Tab.Screen name="Recommendation" component={RecommendationScreen} />
    </Tab.Navigator>
  );
};

export default UserNavigator;
