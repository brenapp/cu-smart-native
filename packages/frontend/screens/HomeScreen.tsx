import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button, H1, Icon, Text, Thumbnail } from "native-base";

import { useNavigation } from "@react-navigation/native";

export default () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={{ padding: 24, paddingTop: 64, backgroundColor: "#FFF" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 32,
        }}>
        <Thumbnail
          small
          source={{
            uri: "https://avatars.githubusercontent.com/u/8839926?v=4",
          }}
        />
        <Pressable onPress={() => navigation.navigate("Room Scanner")}>
          <Icon name="qr-code-outline" />
        </Pressable>
      </View>
      <H1>Welcome Back, Brendan!</H1>
      <Text style={{ color: "#2D3436" }}>Select a room below to continue</Text>
      <Button
        dark
        style={{ alignSelf: "center", marginTop: 32 }}
        onPress={() => navigation.navigate("Select Building")}>
        <Text>Pick Room</Text>
      </Button>
    </ScrollView>
  );
};
