import React from "react";
import { StyleSheet, Platform, Dimensions } from "react-native";
import { View, Box, Icon, Button, Heading } from "native-base";

import { Building, BUILDINGS } from "../models/wfic-cevac";
import { ImageBackground } from "react-native";
import { Pressable } from "react-native";

export const images = {
  WATT: require("../assets/buildings/WATT.png"),
  COOPER: require("../assets/buildings/COOPER.jpg"),
  ASC: require("../assets/buildings/ASC.jpg"),
  SIKES: require("../assets/buildings/SIKES.jpg"),
  FIKE: require("../assets/buildings/FIKE.jpg"),
};

const { width: screenWidth } = Dimensions.get("window");

const BuildingCard = ({
  building,
  onPress,
  onBack,
  room,
}: {
  building: Building;
  onPress: () => any;
  onBack?: () => any;
  room?: string;
}) => {
  const styles = StyleSheet.create({
    item: {
      marginHorizontal: 16,
      marginVertical: 8,
    },
    imageContainer: {
      flex: 1,
      marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
      backgroundColor: "white",
      borderRadius: 8,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: "cover",
    },
    room: {
      position: "absolute",
      right: 24,
      bottom: 24,
      color: "rgba(255, 255, 255, 1.0)",
      fontWeight: "100",
    },
    buildingTop: {
      position: "absolute",
      left: 24,
      top: 24,
      color: "rgba(255, 255, 255, 0.9)",
      width: screenWidth / 2,
      fontWeight: "100",
    },
    buildingBottom: {
      position: "absolute",
      left: 24,
      bottom: 24,
      color: "rgba(255, 255, 255, 0.9)",
      width: screenWidth / 2,
      fontWeight: "100",
    },

    cardContainer: {
      height: 200,
      width: undefined,
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 8,
    },

    cardImageBackground: {
      height: 200,
      width: undefined,
      flex: 1,
      borderRadius: 8,
      overflow: "hidden",
    },

    cardColorBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },

    backButton: {
      position: "absolute",
      top: 8,
      left: 0,
    },
  });

  return (
    <View style={styles.item}>
      <Pressable onPress={onPress}>
        <Box style={{ borderRadius: 8 }}>
          <View style={styles.cardContainer}>
            <ImageBackground
              source={images[building]}
              style={styles.cardImageBackground}
              blurRadius={2}>
              <View style={styles.cardColorBackground} />
            </ImageBackground>

            {onBack ? (
              <Button onPress={onBack} style={styles.backButton}>
                <Icon name="md-arrow-back" />
              </Button>
            ) : null}

            <Heading
              size="lg"
              style={room ? styles.buildingTop : styles.buildingBottom}
              numberOfLines={3}>
              {BUILDINGS[building].toUpperCase()}
            </Heading>
            <Heading size="lg" style={styles.room} numberOfLines={3}>
              {room}
            </Heading>
          </View>
        </Box>
      </Pressable>
    </View>
  );
};

export default BuildingCard;
