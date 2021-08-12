import React, { useState } from "react";
import { Pressable, ScrollView } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Building, METRICS } from "../../models/wfic-cevac";
import { useEffect } from "react";
import useSensorData, { BUILDINGS } from "../../models/wfic-cevac";
import { Box, Button, HStack, Icon, Spinner, Text } from "native-base";
import theme from "../../theme/theme";
import useAuthentication from "../../models/authentication";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityType, UserFeedback } from "../../models/feedback";
import Survey, { ClothingQuestion, SliderQuestion } from "./Survey";

const FavoriteIcon = () => (
  <Pressable onPress={() => alert("hello")}>
    <Icon
      as={MaterialCommunityIcons}
      name="heart-outline"
      marginRight={8}
      color="white"
    />
  </Pressable>
);

const Screen = () => {
  const [data, actions] = useSensorData();
  const route = useRoute();
  const params = route.params as Readonly<{
    building: Building;
    room: string;
    id: number;
  }>;
  const [feedback, setFeedback] = useState<UserFeedback>({
    overallSatisfaction: 3,
    sensations: { temperature: 3, airQuality: 3 },
    preferences: { temperature: 3, light: 3, sound: 3 },
    id: params.id,
    clothing: 2,
    activityLevel: ActivityType.Computer,
  });
  const [favorite, setFavorite] = useState<boolean>(false);
  const navigation = useNavigation();

  const auth = useAuthentication();

  // Get relevant live data for this building and determine if it is loaded
  let live = data.live[params.building];
  const loaded = Object.values(live).every(metric => metric.loaded);

  const TEMP =
    live.TEMP.loaded && live.TEMP.data
      ? live.TEMP.data.find(r => r.Alias.startsWith(params.room))
      : undefined;
  const CO2 =
    live.CO2.loaded && live.CO2.data
      ? live.CO2.data.find(r => r.Alias.startsWith(params.room))
      : undefined;

  // Load all metrics, with a maximum age of 5min
  useEffect(() => {
    for (const sensor of METRICS) {
      actions.ensureData(
        "live",
        { building: params.building, sensor },
        1000 * 60 * 5,
      );
    }
  }, []);

  function submitFeedback() {
    fetch("http://fmo14.clemson.edu/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    }).then(async r => {
      const json = await r.json();
      if (r.ok) {
        alert("Feedback submitted successfully!");
      } else {
        alert(`Could not submit feedback: ${json.message}`);
      }
    });
  }

  function SensorIcon({ icon, value }: { icon: string; value: string }) {
    return (
      <HStack space={6} alignItems="center">
        <Box
          height="48px"
          width="48px"
          borderRadius={36}
          bg="primary.100"
          display="flex"
          alignItems="center"
          justifyContent="center">
          <Icon as={MaterialCommunityIcons} name={icon} color="primary.500" />
        </Box>
        <Text color="white">{value}</Text>
      </HStack>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <Box
          height="96px"
          bg="primary.500"
          borderBottomLeftRadius={36}
          borderBottomRightRadius={36}
          paddingTop="24px">
          <HStack justifyContent="space-evenly" alignItems="center">
            <SensorIcon
              icon="thermometer"
              value={TEMP ? `${TEMP.ActualValue.toFixed(1)} °F` : "Unavailable"}
            />
            <SensorIcon
              icon="molecule-co2"
              value={CO2 ? `${CO2.ActualValue.toFixed(0)} ppm` : "Unavailable"}
            />
          </HStack>
        </Box>
        {loaded ? (
          <ScrollView>
            {auth.authenticated ? (
              <Survey onSubmit={submitFeedback} style={{ paddingTop: 32 }}>
                <SliderQuestion
                  prompt="Overall, how satisfied are you with your space?"
                  left="sad-outline"
                  right="happy-outline"
                  current={feedback.overallSatisfaction}
                  onSelect={overallSatisfaction =>
                    setFeedback({ ...feedback, overallSatisfaction })
                  }
                  labels={[
                    "Very Dissatisfied",
                    "Somewhat Dissatisfied",
                    "Neutral",
                    "Somewhat Satisfied",
                    "Very Satisfied",
                  ]}
                />
                <SliderQuestion
                  prompt="This space's temperature is..."
                  left="snow-outline"
                  right="flame-outline"
                  current={feedback.sensations.temperature}
                  onSelect={temperature =>
                    setFeedback({
                      ...feedback,
                      sensations: { ...feedback.sensations, temperature },
                    })
                  }
                  labels={["Cold", "Cool", "Neutral", "Warm", "Hot"]}
                />
                <SliderQuestion
                  prompt="This space's air quality is..."
                  left="cloud-outline"
                  right="leaf-outline"
                  current={feedback.sensations.airQuality}
                  onSelect={airQuality =>
                    setFeedback({
                      ...feedback,
                      sensations: { ...feedback.sensations, airQuality },
                    })
                  }
                  labels={[
                    "Very Poor",
                    "Poor",
                    "Acceptable",
                    "Good",
                    "Very Good",
                  ]}
                />
                <SliderQuestion
                  prompt="I want this space's temperature to be..."
                  left="snow-outline"
                  right="thermometer-outline"
                  current={feedback.preferences.temperature}
                  onSelect={temperature =>
                    setFeedback({
                      ...feedback,
                      preferences: { ...feedback.preferences, temperature },
                    })
                  }
                  labels={[
                    "Much Cooler",
                    "Cooler",
                    "As Is",
                    "Warmer",
                    "Much Warmer",
                  ]}
                />
                <SliderQuestion
                  prompt="I want this space's light to be..."
                  left="moon-outline"
                  right="sunny-outline"
                  current={feedback.preferences.light}
                  onSelect={light =>
                    setFeedback({
                      ...feedback,
                      preferences: { ...feedback.preferences, light },
                    })
                  }
                  labels={[
                    "Much Dimmer",
                    "Dimmer",
                    "As Is",
                    "Brighter",
                    "Much Brighter",
                  ]}
                />
                <SliderQuestion
                  prompt="I want this space's sound to be..."
                  left="volume-off-outline"
                  right="volume-high-outline"
                  current={feedback.preferences.sound}
                  onSelect={sound =>
                    setFeedback({
                      ...feedback,
                      preferences: { ...feedback.preferences, sound },
                    })
                  }
                  labels={[
                    "Much Quieter",
                    "Quieter",
                    "As Is",
                    "Louder",
                    "Much Louder",
                  ]}
                />
                <Box>
                  <Text>
                    Select the image below that is closest to your current
                    clothing level.
                  </Text>
                  <ClothingQuestion
                    current={feedback.clothing}
                    onSelect={clothing => {}}
                  />
                </Box>
              </Survey>
            ) : (
              <Button
                style={{ margin: 16 }}
                onPress={() => auth.authenticate()}>
                Login to submit feedback
              </Button>
            )}
          </ScrollView>
        ) : (
          <Spinner />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default {
  Screen,
  header: (options: any) => ({
    headerShown: true,
    headerTitle: `${options.route.params.room} in ${
      BUILDINGS[options.route.params.building as Building]
    }`,
    headerStyle: {
      backgroundColor: theme.colors.primary[500],
      color: "white",
    },
    hideHeaderShadow: true,
    headerTintColor: "white",
    headerRight: FavoriteIcon,
  }),
  name: "UserFeedbackScreen",
};
