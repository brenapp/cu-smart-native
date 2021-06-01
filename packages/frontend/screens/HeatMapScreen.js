import React, { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";

import { HeaderBackButton } from "@react-navigation/stack";
import {
  useNavigation,
  useFocusEffect
} from '@react-navigation/native'

const HeatMapScreen = props => {

  // Effect will be triggered everytime the Tab changes
  //      Mounting is not enough -> Tabs will not be unmount by change
  useFocusEffect(
    useCallback(() => {

      // Get StackNav navigation item
      const stackNavigator = props.navigation.dangerouslyGetParent();
      if (stackNavigator) {

        // Actually set Title
        stackNavigator.setOptions({
          title: "Heat Map",
        });
      }
    }, [props.navigation]),
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This is a HeatMap!</Text>
    </View>
  );
};
export default HeatMapScreen;
export const screenOptions = navData => {
  return {
    headerTitle: "Heat Map",
  };
};
