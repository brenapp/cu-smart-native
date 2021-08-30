import React, { useState, useEffect } from "react";
import { Pressable, SafeAreaView, View } from "react-native";
import {
  Button,
  Heading,
  Icon,
  Text,
  Image,
  VStack,
  FlatList,
  Box,
  useColorMode,
  StatusBar,
  useTheme,
  Divider,
  HStack,
} from "native-base";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import useSensorData, {
  BUILDINGS,
  ResponseType,
} from "../../models/wfic-cevac";
import { images } from "../../components/BuildingCard";

import { useNavigation } from "@react-navigation/native";
import QRCodeScannerScreen from "../QRCode/QRCodeScannerScreen";
import BuildingSelectionScreen from "../BuildingSelection/BuildingSelectionScreen";
import UserFeedbackScreen from "../UserFeedback/UserFeedbackScreen";

const favorites: ResponseType["XREF"] = [
  {
    PointSliceID: 8919,
    Room: "325",
    RoomType: "Project Room",
    BLG: "WATT",
    Floor: "3rd Floor",
    ReadingType: "Zone Temp",
    Alias: "RM 319"
  },
  {
    PointSliceID: 8941,
    Room: "321",
    RoomType: "Project Room",
    BLG: "WATT",
    Floor: "3rd Floor",
    ReadingType: "Zone Temp",
    Alias: "RM 321"
    },
  {
    PointSliceID: 8916,
    Room: "331",
    RoomType: "Classroom",
    BLG: "WATT",
    Floor: "3rd Floor",
    ReadingType: "Zone Temp",
    Alias: "RM 331"
  },
  {
    PointSliceID: 8921,
    Room: "329",
    RoomType: "Project Room",
    BLG: "WATT",
    Floor: "3rd Floor",
    ReadingType: "Zone Temp",
    Alias: "RM 329"
    }
];

const Screen = () => {
  const navigation = useNavigation();
  const [, actions] = useSensorData();
  const { colorMode, toggleColorMode } = useColorMode();
  const theme = useTheme();

  // Load stored data
  useEffect(() => {
    actions.hydrate();
  }, []);

  return (
    <VStack
      style={{
        padding: 24,
        height: "100%",
      }}
      _dark={{
        backgroundColor: "#1a1a1a",
      }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 32,
        }}>
        <Pressable onPress={() => toggleColorMode()}>
          <Image
            size={10}
            alt="User Icon"
            style={{ borderRadius: 100 }}
            source={{
              uri: "https://avatars.githubusercontent.com/u/8839926?v=4",
            }}
          />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate(QRCodeScannerScreen.name)}>
          <Icon as={Ionicons} name="qr-code-outline" />
        </Pressable>
      </View>
      <Heading size="xl">Welcome Back!</Heading>
      <Text>Select a room below to continue</Text>
      <Box marginTop={8}>
        {favorites.map(room => (
          <Pressable
            key={room.PointSliceID}
            onPress={() =>
              navigation.navigate(UserFeedbackScreen.name, {
                building: room.BLG,
                id: room.PointSliceID,
                room: room.Alias,
              })
            }>
            <HStack paddingY={8} space={8} alignItems="center">
              <Image
                source={images[room.BLG]}
                alt={room.Alias}
                size={16}
                borderRadius={8}
              />
              <VStack>
                <Text fontSize="lg">{room.Alias}</Text>
                <Text>{BUILDINGS[room.BLG]}</Text>
              </VStack>
              <Icon
                as={MaterialIcons}
                name="keyboard-arrow-right"
                marginLeft="auto"
              />
            </HStack>
            <Divider />
          </Pressable>
        ))}
      </Box>
      <HStack
        style={{ alignSelf: "center", marginTop: 32 }}
        alignItems="center"
        space={3}>
        <Button
          onPress={() => navigation.navigate(BuildingSelectionScreen.name)}>
          Other Room
        </Button>
      </HStack>
    </VStack>
  );
};

export default {
  Screen,
  header: {
    headerShown: false,
  },
  name: "HomeScreen",
};
