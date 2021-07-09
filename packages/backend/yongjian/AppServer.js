const express = require('express');
const fetch = require("node-fetch");
const app = express();
const mssql = require('mssql'); // mssql node driver
const mssqlConfig = require('./config/mssql');
const pool = new mssql.ConnectionPool(mssqlConfig);

pool.connect(err => {
    if (err) {
        console.log("Connection failed");
    }
    console.log("Connected to sql server!")
})

/**
 * Select the top 96 records (24 * 4)
 */
const generateHistoryQuery = (building, sensor, id) => {
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
const generateLiveQuery = (building, sensor) => {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    console.log(building, sensor);
    const query = 'SELECT *\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_LIVE] \n`;
    return query;
}

const generatePxrefQuery = (building, sensor) => {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    console.log(building, sensor);
    const query =
        'SELECT [PointSliceID]\n' +
        '      ,[Alias]\n' +
        '      ,[in_xref]\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_PXREF]`;
    return query;
}

const generateXrefQuery = (building, sensor) => {
    building = building.toUpperCase();
    sensor = sensor.toUpperCase();
    console.log(building, sensor);

    const query =
        'SELECT [PointSliceID]\n' +
        '      ,[Room]\n' +
        '      ,[RoomType]\n' +
        '      ,[BLG]\n' +
        '      ,[Floor]\n' +
        '      ,[ReadingType]\n' +
        '      ,[Alias]\n' +
        `  FROM [WFIC-CEVAC].[dbo].[CEVAC_${building}_${sensor}_XREF]`;
    return query;
}

const calculateAvgValue = (recordList) => {
    let newList = {};
    recordList.forEach(e => {
        const hour = e["Time"].getHours(); // extract hours
        newList.hasOwnProperty(hour) ? newList[hour].push(e["Value"]) : newList[hour] = [e["Value"]];
    });
    let average = (array) => array.reduce((a, b) => a + b) / array.length;
    let avg = {};
    for (const property in newList) {
        avg[property] = average(newList[property]);
    }
    return avg;
}

const returnPastData = (data, hour) => {
    let d = new Date();
    let curHour = d.getHours() - 1;
    if (curHour < 0) curHour += 24;
    let res = {};
    let labels = [];
    let sensorData = [];
    for (let i = 0; i < hour; i++) {
        sensorData.unshift(data[curHour]);
        labels.unshift(curHour);
        curHour--;
        if (curHour < 0) curHour += 24;
    }
    res.labels = labels;
    res.data = sensorData;
    return res;
}

/**
 * redirect to cevac database
 */
app.get('/LIVE', (req, res) => {
    const {building, sensor} = req.query;
    pool.query(generateLiveQuery(building, sensor), function (err, recordset) {
        if (err) {
            console.log(err);
            return;
        }
        //extract recordsets from query answer "recordsets":list of list of objects "output": "rowsAffected"
        let record = recordset.recordsets[0];
        res.send(record);
    });
});


app.get('/HIST', (req, res) => {
    const {building, sensor, id} = req.query;
    pool.query(generateHistoryQuery(building, sensor, id), function (err, recordset) {
        if (err) {
            console.log(err);
            return;
        }
        //extract recordsets from query answer "recordsets":list of list of objects "output": "rowsAffected"
        let record = recordset.recordsets[0];

        record = calculateAvgValue(record);
        record = returnPastData(record, 12);
        // send records as a response
        res.send(record);
    });
});

app.get('/XREF', (req, res) => {
    const {building, sensor, id} = req.query;
    pool.query(generatePxrefQuery(building, sensor, id), function (err, recordset) {
        if (err) {
            console.log(err);
            return;
        }
        //extract recordsets from query answer "recordsets":list of list of objects "output": "rowsAffected"
        let record = recordset.recordsets[0];
        res.send(record);
    });
});

app.get('/PXREF', (req, res) => {
    const {building, sensor, id} = req.query;
    pool.query(generateXrefQuery(building, sensor, id), function (err, recordset) {
        if (err) {
            console.log(err);
            return;
        }
        //extract recordsets from query answer "recordsets":list of list of objects "output": "rowsAffected"
        let record = recordset.recordsets[0];
        res.send(record);
    });
});

app.post('/', (req, res) => {
    const oracle = require("oracledb");
    const oracleConfig = {
        user: 'cevac_admin',
        password: 'HardnessDepthGallstone$2',
        connectString: 'wfic-util-sql.campus.cu.clemson.edu'
    };
});


const server = app.listen(3000, function () {
    console.log('Server is running..');
});
