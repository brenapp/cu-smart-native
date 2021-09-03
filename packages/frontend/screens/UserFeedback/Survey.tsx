import React, { useState } from "react";
import { Pressable, ScrollView, StyleProp, ViewStyle } from "react-native";

import { Box, Button, HStack, Icon, Image, Text, VStack } from "native-base";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { FivePointScale } from "@cu-smart/backend/routes/feedback";

const SliderQuestion = ({
  current,
  onSelect,
  labels,
  prompt,
  left,
  right,
}: {
  current: FivePointScale;
  onSelect: (value: FivePointScale) => void;
  labels: [string, string, string, string, string];
  prompt: string;
  left: string;
  right: string;
}) => {
  return (
    <ScrollView style={{ width: "100%", display: "flex" }}>
      <Text style={{ width: "100%", paddingBottom: 24 }}>{prompt}</Text>
      <Box
        style={{
          flex: 1,
          justifyContent: "space-evenly",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          paddingBottom: 24,
        }}>
        <Icon name={left} as={Ionicons} />
        <Slider
          style={{ flex: 1, padding: 24 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={current}
          onValueChange={value => onSelect(value as FivePointScale)}
          minimumTrackTintColor="#F99765"
          thumbTintColor="#F99765"
        />
        <Icon name={right} as={Ionicons} />
      </Box>
      <Text style={{ textAlign: "center", marginTop: -32, marginBottom: 16 }}>
        {labels[current - 1]}
      </Text>
    </ScrollView>
  );
};

const ClothingQuestion = ({
  current,
  onSelect,
}: {
  current: FivePointScale;
  onSelect: (value: FivePointScale) => void;
}) => {
  const images: { [key: string]: any } = {
    clothing1: require("../../assets/clothing/clothing1.png"),
    clothing2: require("../../assets/clothing/clothing2.png"),
  };

  return (
    <VStack alignItems="center" margin={8} space={2}>
      <Text>What is closest to your current clothing level?</Text>
      <HStack space={2}>
      {[1, 2].map(level => {
        const selected = current === level;
        const color = selected ? "#F56600" : "#ffffff";

        return (
          <Pressable
            key={level}
            onPress={() => onSelect(level as FivePointScale)}>
              <Box border={`4px solid ${color}`} borderRadius={8} padding={2}>
                <Image source={images[`clothing${level}`]} alt={`${level}`} size="lg"/>
              </Box>
          </Pressable>
        );
      })}
      </HStack>
    </VStack>
  );
};

const Survey = ({
  children,
  style,
  onSubmit,
}: {
  children: JSX.Element[];
  style?: StyleProp<ViewStyle>;
  onSubmit: () => void;
}) => {
  const [progress, setProgress] = useState<number>(1);

  return (
    <VStack
      style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: "white",
        marginHorizontal: 16,
        marginVertical: 8,
      }}>
      <Box style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <Text color="primary.400">
          Survey ({progress} of {children.length})
        </Text>
      </Box>
      <Box>{children[progress - 1]}</Box>
      <HStack space={3}>
        {progress > 1 ? (
          <Button
            onPress={() => setProgress(Math.max(progress - 1, 1))}
            variant="ghost">
            Previous
          </Button>
        ) : null}
        {progress < children.length ? (
          <Button onPress={() => setProgress(progress + 1)} variant="ghost">
            Next
          </Button>
        ) : (
          <Button onPress={onSubmit}>Submit</Button>
        )}
      </HStack>
    </VStack>
  );
};

export default Survey;
export { SliderQuestion, ClothingQuestion };
