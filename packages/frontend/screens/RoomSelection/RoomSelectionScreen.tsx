import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Text,
  Icon,
  Spinner,
  Select,
  Box,
  Pressable,
  VStack,
  HStack,
  Divider,
} from "native-base";
import React, { useState } from "react";
import useSensorData, { Building, ResponseType } from "../../models/wfic-cevac";
import BuildingCard from "../../components/BuildingCard";
import { useEffect } from "react";
import { ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserFeedbackScreen from "../UserFeedback/UserFeedbackScreen";

type RoomData = ResponseType["XREF"][0];

/**
 * Returns a list of floor names based on the parsed data
 * @param rooms
 */
function getFloors(data: RoomData[]) {
  return data
    .map(room => room.Floor)
    .filter((floor, index, array) => array.indexOf(floor) === index);
}

/**
 * Removes duplicate entries and sensors that do not correspond to a specific room (like a sensor in
 * an Air Handling Unit). Additionally strips out additional information beyond just the room number
 * (like Temp, Cooling SP, etc)
 * @param sensors
 */
function getRooms(sensors: RoomData[]) {
  // We want to eject sensors that don't correspond to a specific room, so reject ones with
  // Building-type room types
  const reject = [
    "Building",
    "Building (Left)",
    "Building (Right)",
    "Floor (Right)",
    "Floor (Left)",
    null,
    "Outside",
  ];

  const valid = sensors.filter(
    sensor => reject.indexOf(sensor.RoomType) === -1,
  );

  // Now strip out information in the alias that isn't the room number (the information after the
  // first slash), and remove duplicates (if there are multiple sensors in one room)
  return valid
    .map(room => ({ ...room, Alias: room.Alias.split(" /")[0] }))
    .filter(
      (room, index, array) =>
        array.findIndex(r => r.Alias === room.Alias) === index,
    );
}

const RoomList = ({
  rooms,
  floor,
  building,
}: {
  rooms?: RoomData[];
  floor?: string;
  building: Building;
}) => {
  const navigation = useNavigation();

  if (!rooms) {
    return <Spinner />;
  }

  const items = floor ? rooms.filter(rm => rm.Floor === floor) : rooms;

  const Item = ({ room }: { room: ResponseType["XREF"][0] }) => (
    <Pressable
      onPress={() =>
        navigation.navigate(UserFeedbackScreen.name, {
          room: room.Alias,
          id: room.PointSliceID,
          building,
        })
      }>
      <HStack
        borderRadius={8}
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          padding: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Text>{room.Alias}</Text>
        <Icon as={Ionicons} name="arrow-forward" />
      </HStack>
      <Divider />
    </Pressable>
  );

  return (
    <ScrollView style={{ marginBottom: 64 }}>
      <VStack style={{ marginBottom: 64 }}>
        {items.map(room => (
          <Item key={room.Alias} room={room} />
        ))}
      </VStack>
    </ScrollView>
  );
};

const Screen = () => {
  const route = useRoute();
  const params = route.params as Readonly<{ building: Building }>;
  const [data, actions] = useSensorData();
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Ensure room information for this building is loaded
    actions.ensureData(
      "XREF",
      { building: params.building, sensor: "TEMP" },
      24 * 60 * 60 * 1000,
    );

    // Preload live temperature for this building
    actions.ensureData(
      "live",
      { building: params.building, sensor: "TEMP" },
      24 * 60 * 60 * 1000,
    );
  }, []);

  const floorData = data.XREF[params.building]["TEMP"];

  if (floorData.loaded) {
    const rooms = getRooms(floorData.data);
    const floors = getFloors(rooms).sort();

    return (
      <ScrollView style={{ paddingTop: 8 }}>
        <BuildingCard building={params.building} onPress={() => {}} />
        <Box style={{ marginHorizontal: 16 }}>
          <Select
            placeholder="Filter by floor"
            selectedValue={filter}
            onValueChange={setFilter}>
            {floors.map(floor => (
              <Select.Item key={floor} label={floor} value={floor} />
            ))}
          </Select>
        </Box>
        <RoomList rooms={rooms} floor={filter} building={params.building} />
      </ScrollView>
    );
  } else {
    if (floorData.error) {
      return (
        <ScrollView style={{ marginTop: 8 }}>
          <BuildingCard building={params.building} onPress={() => {}} />
          <Icon as={Ionicons} name="sad-outline" color={"primary.200"} />
        </ScrollView>
      );
    }

    return (
      <ScrollView style={{ marginTop: 8 }}>
        <BuildingCard building={params.building} onPress={() => {}} />
        <Spinner />
      </ScrollView>
    );
  }
};

export default {
  Screen,
  header: {
    headerShown: true,
    title: "Select Room",
  },
  name: "RoomSelectionScreen",
};
