/**
 * Forwarding API for sensor data, accessing the SQL database and providing it in an easily
 * consumable web API
 * 
 */

import { mssql as config } from "../config.json"
import { Router } from "express"
import mssql from "mssql"


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


/**
 * Select the top 96 records (24 * 4)
 */
function generateHistoryQuery(building: string, sensor: string, id: string) {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    console.log(building, sensor);
    const query = 'SELECT TOP (96)\n' +
        '      [ETDateTime] as [Time]\n' +
        '      ,[ActualValue] as [Value]\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_HIST_CACHE] \n` +
        `  WHERE [PointSliceID] = ${id}` +
        '  ORDER BY [Time] DESC ';

    return query;
}
/**
 * Generate live query
 */
function generateLiveQuery(building: string, sensor: string) {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    const query = 'SELECT *\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_LIVE] \n`;
    return query;
}

function generatePXrefQuery(building: string, sensor: string) {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    const query = 'SELECT [PointSliceID]\n' +
        '      ,[Alias]\n' +
        '      ,[in_xref]\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_PXREF]`;
    return query;
}

function generateXrefQuery(building: string, sensor: string) {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();

    const query = 'SELECT [PointSliceID]\n' +
        '      ,[Room]\n' +
        '      ,[RoomType]\n' +
        '      ,[BLG]\n' +
        '      ,[Floor]\n' +
        '      ,[ReadingType]\n' +
        '      ,[Alias]\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_XREF]`;
    return query;
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

router.get("/api/live", (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string") {
        res.status(400).json({
            "status": "err",
            "error_message": "Invalid parameters"
        });
    } else {
        pool.query<LiveEntry>(generateLiveQuery(building, sensor), (err, result) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    "status": "err",
                    "error_message": `Database Error: ${err.message}`
                });
                return;
            }

            if (!result) {
                res.status(404).json({
                    "status": "err",
                    "error_message": `Could not find any records for ${sensor}/${building}`
                });
            } else {
                const record = result.recordsets[0];
                res.status(200).json({
                    "status": "ok",
                    "data": record
                })
            }
        });
    }
});

router.get('/api/hist', (req, res) => {
    const { building, sensor, id, labels } = req.query;

    if (typeof building != "string" || typeof sensor != "string" || typeof id != "string") {
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

        pool.query<HistoricalEntry>(generateHistoryQuery(building, sensor, id), function (err, result) {
            if (err) {
                res.status(500).json({
                    "status": "err",
                    "error_message": `Database Error: ${err.message}`
                });
                return;
            }

            if (!result) {
                res.status(404).json({
                    "status": "err",
                    "error_message": `Could not find any records for ${sensor}/${building}`
                });
            } else {
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
            }
        });
    }
});

router.get('/api/XREF', (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string") {
        res.status(400).json({
            "status": "err",
            "error_message": "Invalid parameters"
        });
    } else {

        pool.query(generatePXrefQuery(building, sensor), function (err, result) {
            if (err) {
                res.status(500).json({
                    "status": "err",
                    "error_message": `Database Error: ${err.message}`
                });
                return;
            }

            if (!result) {
                res.status(404).json({
                    "status": "err",
                    "error_message": `Could not find any records for ${sensor}/${building}`
                });
            } else {
                let record = result.recordsets[0];
                res.status(200).json({
                    "status": "ok",
                    "data": record
                })
            }


        });
    }
});

router.get('/api/PXREF', (req, res) => {
    const { building, sensor } = req.query;

    if (typeof building != "string" || typeof sensor != "string") {
        res.status(400).json({
            "status": "err",
            "error_message": "Invalid parameters"
        });
    } else {

        pool.query(generateXrefQuery(building, sensor), function (err, result) {
            if (err) {
                res.status(500).json({
                    "status": "err",
                    "error_message": `Database Error: ${err.message}`
                });
                return;
            }

            if (!result) {
                res.status(404).json({
                    "status": "err",
                    "error_message": `Could not find any records for ${sensor}/${building}`
                });
            } else {
                let record = result.recordsets[0];
                res.status(200).json({
                    "status": "ok",
                    "data": record
                })
            }
        });
    }
});


export default router;