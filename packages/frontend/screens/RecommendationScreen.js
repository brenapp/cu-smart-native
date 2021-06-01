import React, { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  useNavigation,
  useFocusEffect
} from '@react-navigation/native'

const RecommendationScreen = props => {
  // Effect will be triggered everytime the Tab changes
  //      Mounting is not enough -> Tabs will not be unmount by change
  useFocusEffect(
    useCallback(() => {

      // Get StackNav navigation item
      const stackNavigator = props.navigation.dangerouslyGetParent();
      if (stackNavigator) {

        // Actually set Title
        stackNavigator.setOptions({
          title: "Recommendation",
        });
      }
    }, [props.navigation]),
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Recommendation Page</Text>
    </View>
  );
}
export default RecommendationScreen;

export const screenOptions = navData => {
  return {
    headerTitle: "Recommendation"
  };
};
