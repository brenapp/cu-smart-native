import React from "react";
import { ScrollView } from "react-native";
import { Box } from "native-base";

import { Building, BUILDINGS } from "../../models/wfic-cevac";
import { useNavigation } from "@react-navigation/native";
import RoomSelectionScreen from "../RoomSelection/RoomSelectionScreen";
import BuildingCard from "../../components/BuildingCard";

const Screen = () => {
  const navigation = useNavigation();

  return (
    <Box>
      <ScrollView>
        {Object.keys(BUILDINGS).map(building => (
          <BuildingCard
            key={building}
            building={building as Building}
            onPress={() =>
              navigation.navigate(RoomSelectionScreen.name, { building })
            }
          />
        ))}
      </ScrollView>
    </Box>
  );
};

export default {
  Screen,
  header: {
    headerShown: true,
    headerTitle: "Select Building",
  },
  name: "BuildingScreen",
};
