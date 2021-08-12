import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

/**
 * For parameter setup, see
 * @link https://github.com/indiespirit/react-native-chart-kit
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const SensorBezierLineChart = (props: {
  title:
    | string
    | number
    | boolean
    | {}
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactNodeArray
    | React.ReactPortal
    | null
    | undefined;
  data: LineChartData;
  screenWidth: number;
  height: number;
  yAxisSuffix: string | undefined;
  chartConfig: AbstractChartConfig | undefined;
}) => {
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.text}> {props.title} </Text>
      <LineChart
        data={props.data}
        width={props.screenWidth}
        height={props.height}
        yAxisSuffix={props.yAxisSuffix}
        chartConfig={props.chartConfig}
        verticalLabelRotation={0}
        bezier
      />
    </View>
  );
};

export const SensorLineChart = (props: {
  data: LineChartData;
  screenWidth: number;
  height: number;
  chartConfig: AbstractChartConfig | undefined;
}) => {
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.text}> Line Chart </Text>
      <LineChart
        data={props.data}
        width={props.screenWidth}
        height={props.height}
        yAxisSuffix="F"
        chartConfig={props.chartConfig}
        verticalLabelRotation={0}></LineChart>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  text: {
    flex: 0,
    color: "blue",
  },
});
