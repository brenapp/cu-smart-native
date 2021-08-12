import { Spinner, Text, View } from "native-base";
import React, { useState } from "react";
import WebView from "react-native-webview";

const Screen = () => {
  const [loading, setLoading] = useState(false);

  return (
    <View>
      <Text>AuthenticationScreen</Text>
    </View>
  );
};

export default {
  Screen,
  header: {
    headerShown: true,
  },
  name: "SettingsScreen",
};