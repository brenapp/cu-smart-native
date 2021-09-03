/**
 * Forwarding API for sensor data, accessing the SQL database and providing it in an easily
 * consumable web API
 * 
 */

import { mssql as cevac, shades } from "../config.json"
import { Router } from "express"
import mssql, { ConnectionPool } from "mssql"
import { logger } from "../main";

export type Building =
    "ASC" |
    // "BRACK" |
    // "BROOKS" |
    // "COB" |
    "COOPER" |
    // "DOUTHITA" |
    "FIKE" |
    // "GODFREY" |
    // "GRC" |
    // "HARDIN" |
    // "HARRIS" |
    // "HENDRIX" |
    // "HOLMES" |
    // "JORDAN" |
    // "LEE_III" |
    // "LJ" |
    // "MANN" |
    // "MCFADDEN" |
    // "RHODES" |
    // "RHODESANNEX" |
    // "RIGGS" |
    // "SD" |
    "SIKES" |
    "WATT";

export const BUILDING_NAMES: { [building in Building]?: string } = {
    WATT: "Watt Innovation Center",
    COOPER: "Cooper Library",
    ASC: "Academic Success Center",
    SIKES: "Sikes Hall",
    FIKE: "Fike Recreation Center",
};

const BUILDINGS: Building[] = [
    "ASC",
    // "BRACK",
    // "BROOKS",
    // "COB",
    "COOPER",
    // "DOUTHITA",
    "FIKE",
    // "GODFREY",
    // "GRC",
    // "HARDIN",
    // "HARRIS",
    // "HENDRIX",
    // "HOLMES",
    // "JORDAN",
    // "LEE_III",
    // "LJ",
    // "MANN",
    // "MCFADDEN",
    // "RHODES",
    // "RHODESANNEX",
    // "RIGGS",
    // "SD",
    "SIKES",
    "WATT",
];

export type Metric = 
    "TEMP" | 
    "CO2";

export const SENSORS = [
    "TEMP",
    "CO2"
];

// Use the following mobile sensors for the given point slice IDs
const mobileSensors = new Map<number, string>([
    [8916, "Sensor14"],
    [8921, "Sensor15"],
    [8939, "Sensor16"],
    [8941, "Sensor17"],
]);

// Connect to each database appropriately
const thermostatData = new mssql.ConnectionPool(cevac);
const mobileSensorData = new mssql.ConnectionPool(shades);

function connectionHandler(retries: number, pool: ConnectionPool, database: any) {
    return (err: any) => {
        if (err) {

            if (retries <= cevac.retries.max) {
                logger.error(`Could not connect to ${database.database} database! Retrying (${retries}/${database.retries.max}) in ${database.retries.delayMillis}ms... [${err}]`);
            }

            setTimeout(() => {
                pool.connect(connectionHandler(retries + 1, pool, database));
            }, database.retries.delayMillis);


        } else {
            logger.info(`Connected to ${database.database} database!`);
        }
    }
}
thermostatData.connect(connectionHandler(1, thermostatData, cevac));
mobileSensorData.connect(connectionHandler(1, mobileSensorData, shades));

const router = Router();

interface HistoricalEntry {
    Time: Date;
    Value: number;
}

interface LiveEntry {
    PointSliceID: number,
    Alias: string,
    UTCDateTime: string,
    ETDateTime: string,
    ActualValue: number
}

interface XrefEntry {
    PointSliceID: number;
    Room: string;
    RoomType: string;
    BLG: string;
    Floor: string;
    ReadingType: string;
    Alias: string;
}

interface PXrefEntry {
    PointSliceID: string;
    Alias: string;
    in_xref: true;
}

function calculateAvgValue(recordList: HistoricalEntry[]) {
    let newList: Record<number, number[]> = {};
    recordList.forEach(e => {
        const hour = e["Time"].getHours(); // extract hours
        newList.hasOwnProperty(hour) ? newList[hour].push(e["Value"]) : newList[hour] = [e["Value"]];
    });
    let average = (array: number[]) => array.reduce((a, b) => a + b) / array.length;
    let avg: Record<string, number> = {};
    for (const property in newList) {
        avg[property] = average(newList[property]);
    }
    return avg;
}

function returnPastData(data: Record<string, number>, hour: number) {
    let d = new Date();
    let curHour = d.getHours() - 1;
    if (curHour < 0)
        curHour += 24;
    let res = {
        labels: [] as number[],
        data: [] as number[]
    };
    let labels = [];
    let sensorData = [];
    for (let i = 0; i < hour; i++) {
        sensorData.unshift(data[curHour]);
        labels.unshift(curHour);
        curHour--;
        if (curHour < 0)
            curHour += 24;
    }
    res.labels = labels;
    res.data = sensorData;
    return res;
}

router.get("/api/live", async (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building as Building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {

        try {

            // Safety: While tagged templates are not being used here, because we are validating the
            // values of building and sensor to a set of known, constant values, it is ok to
            // directly substitute here
            const result = await thermostatData.query<LiveEntry>(`SELECT * FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_LIVE]`);

            const record = result.recordsets[0];

            // Artificially insert RM 319 in WATT TEMP
            if (sensor == "TEMP" && building == "WATT") {
                record.push({
                    "PointSliceID": 8939,
                    "Alias": "RM 319",
                    "UTCDateTime": "",
                    "ETDateTime": "",
                    "ActualValue": 0
                });
            };


            console.log(record);
            // Swap in mobile sensor data for the applicable point slice IDs
            for (const item of record) {
                if (mobileSensors.has(+item.PointSliceID)) {
                    const sensor = mobileSensors.get(+item.PointSliceID) as string;

                    console.log(`Replacing ${item.PointSliceID} with ${sensor}`);

                }
            };

            res.status(200).json({
                "status": "ok",
                "data": record
            });

        } catch (err) {
            console.log(err);

            // Special Case: If the database reports the table does not exist, it makes the most
            // sense to just return an empty array instead of a 500 error. The client will report
            // this data as unavailable instead of producing an error. This means when these data is
            // added to the database, it will work seamlessly
            if (err instanceof Error && err.message.startsWith("Invalid object name")) {
                res.status(200).json({
                    "status": "ok",
                    "data": []
                });
            } else {
                res.status(500).json({
                    "status": "err",
                    "error_message": `Database Error: ${err instanceof Error ? err.message : "Unknown Error"}`
                });
            }



        }
    }
});

router.get('/api/hist', async (req, res) => {
    const { building, sensor, id, labels } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || typeof id != "string" || !BUILDINGS.includes(building as Building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": "Invalid parameters"
        });
    } else {

        // If the user specifies a valid number of labels to include, otherwise default
        let size = 12;
        if (typeof labels == "string") {

            if (!isNaN(parseInt(labels))) {
                size = parseInt(labels);
            } else {
                res.status(400).json({
                    "status": "err",
                    "error_message": "Invalid label size"
                });
            }

        };
        try {

            // Safety: While tagged templates are not being used here, because we are validating the
            // values of building and sensor to a set of known, constant values, it is ok to
            // directly substitute here
            const result = await thermostatData.query<HistoricalEntry>(
                `SELECT TOP (96) [ETDateTime] as [Time], [ActualValue] as [Value] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_HIST_CACHE] WHERE [PointSliceID] = ${id} ORDER BY [Time] DESC `);

            let timesteps = result.recordsets[0];

            // Find the average value for each timestep
            let average = calculateAvgValue(timesteps);

            // Rearrange the averages into a summary
            let summary = returnPastData(average, size);

            // record = returnPastData(record, 12);
            res.status(200).json({
                "status": "ok",
                "data": summary
            })

        } catch (err) {
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err instanceof Error ? err.message : "Unknown Error"}`
            });
        }

    }
});

router.get('/api/PXREF', async (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building as Building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {
        try {

            const result = await thermostatData.query<PXrefEntry>(`SELECT [PointSliceID], [Alias], [in_xref] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_PXREF]`);

            const record = result.recordsets[0];
            res.status(200).json({
                "status": "ok",
                "data": record
            })
        } catch (err) {
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err instanceof Error ? err.message : "Unknown Error"}`
            });
        };
    }
});


router.get('/api/XREF', async (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building as Building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {
        try {
            const result = await thermostatData.query<XrefEntry>(`SELECT [PointSliceID], [Room], [RoomType], [BLG], [Floor], [ReadingType], [Alias] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_XREF]`);

            const record = result.recordsets[0].map(r => ({...r, "BLG": r.BLG.toUpperCase()}));

            // In WATT TEMP, artificially add RM 319 to the list of rooms
            if (building == "WATT" && sensor == "TEMP") {   
                record.push({
                    "PointSliceID": 8939,
                    "Room": "319",
                    "RoomType": "Project Room",
                    "BLG": "WATT",
                    "Floor": "3rd Floor",
                    "ReadingType": "Zone Temp",
                    "Alias": "RM 319 / Zone Temp"
                });
            };


            res.status(200).json({
                "status": "ok",
                "data": record
            })
        } catch (err) {
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err instanceof Error ? err.message : "Unknown Error"}`
            });
        };
    }
});


export default router;