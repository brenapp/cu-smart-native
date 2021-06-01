import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Button,
  useColorScheme,
  View,
} from "react-native";

const RoomSelectionScreen = props => {
  const clickButtionHandler = () => {
    props.navigation.navigate('User Tab');
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Press me" onPress={clickButtionHandler}/>
    </View>
  );
};
export default RoomSelectionScreen;
