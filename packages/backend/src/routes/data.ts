/**
 * Forwarding API for sensor data, accessing the SQL database and providing it in an easily
 * consumable web API
 * 
 */

import { mssql as config } from "../config.json"
import { Router } from "express"
import mssql from "mssql"

const BUILDINGS = [
    "WATT",
    "COOPER",
    "ASC",
    "SIKES",
    "FIKE"
];

const SENSORS = [
    "TEMP",
    "CO2"
];

// Connect to database
const pool = new mssql.ConnectionPool(config);
pool.connect(err => {
    if (err) {
        console.log("Could not connect to SQL server!")
    } else {
        console.log("Connect to SQL server")
    }
});

const router = Router();

interface HistoricalEntry {
    Time: Date;
    Value: number;
}

interface LiveEntry {
    PointSliceID: string,
    Alias: string,
    UTCDateTime: string,
    ETDateTime: string,
    ActualValue: number
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

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {

        try {
            const result = await pool.query<LiveEntry>`SELECT * FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_LIVE]`;

            const record = result.recordsets[0];
            res.status(200).json({
                "status": "ok",
                "data": record
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err.message}`
            });
        }
    }
});

router.get('/api/hist', async (req, res) => {
    const { building, sensor, id, labels } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || typeof id != "string" || !BUILDINGS.includes(building) || !SENSORS.includes(sensor)) {
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

            const result = await pool.query<HistoricalEntry>
                `SELECT TOP (96) \n [ETDateTime] as [Time], [ActualValue] as [Value] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_HIST_CACHE] WHERE [PointSliceID] = ${id} ORDER BY [Time] DESC `;

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
                "error_message": `Database Error: ${err.message}`
            });
        }

    }
});

router.get('/api/PXREF', async (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {
        try {

            const result = await pool.query`SELECT [PointSliceID], [Alias], [in_xref] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_PXREF]`;

            const record = result.recordsets[0];
            res.status(200).json({
                "status": "ok",
                "data": record
            })
        } catch (err) {
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err.message}`
            });
        };
    }
});


router.get('/api/XREF', async (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || !BUILDINGS.includes(building) || !SENSORS.includes(sensor)) {
        res.status(400).json({
            "status": "err",
            "error_message": `Invalid parameters. Must specify a "building" in ${BUILDINGS.join(", ")} and "sensor" in ${SENSORS.join(", ")}.`
        });
    } else {
        try {
            const result = await pool.query`SELECT [PointSliceID], [Room], [RoomType], [BLG], [Floor], [ReadingType], [Alias] FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_XREF]`;

            const record = result.recordsets[0];
            res.status(200).json({
                "status": "ok",
                "data": record
            })
        } catch (err) {
            res.status(500).json({
                "status": "err",
                "error_message": `Database Error: ${err.message}`
            });
        };
    }
});


export default router;