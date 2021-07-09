const mssqlConfig = {
    user: 'cevac_admin',
    password: 'HardnessDepthGallstone$2',
    server: 'wfic-util-sql.campus.cu.clemson.edu',
    database: 'WFIC-CEVAC',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        trustServerCertificate: true
    }
};

module.exports = mssqlConfig;
