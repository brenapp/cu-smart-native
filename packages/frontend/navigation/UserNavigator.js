import React from "react";
import { Platform, SafeAreaView, Button, View } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import UserFeedbackScreen, {screenOptions as userFeedbackScreenOptions}from "../screens/UserFeedbackScreen";
import HeatMapScreen, {screenOptions as heatMapScreenOptions} from "../screens/HeatMapScreen";
import RecommendationScreen, {screenOptions as recommendationScreenOptions} from "../screens/RecommendationScreen";
import { HeaderBackButton } from "@react-navigation/stack";

const UserNavigator = props => {
  const BottomTab = createBottomTabNavigator();
  React.useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: props.route.headerTitle,
      headerRight: () => (
        <HeaderBackButton
          onPress={() => props.navigation.navigate('Room Selection')}
        />
      ),
    });
  }, [props.navigation]);

  return (
    <BottomTab.Navigator  initialRouteName="Heat Map">
      <BottomTab.Screen name="User Feedback" component={UserFeedbackScreen} options = {userFeedbackScreenOptions}/>
      <BottomTab.Screen name="Heat Map" component={HeatMapScreen} options={heatMapScreenOptions}/>
      <BottomTab.Screen name="Recommendation" component={RecommendationScreen} options={recommendationScreenOptions}/>
    </BottomTab.Navigator>
  );
};

export default UserNavigator;
