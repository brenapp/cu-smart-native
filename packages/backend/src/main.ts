import express from "express"
import * as database from "./database"
import winston from "winston";

// Setup logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
    ),

    transports: [
        new winston.transports.Console()
    ]
});

export { logger };


const app = express();
app.listen(3000, async () => {
    logger.info("Listening for new connections!")

    await database.ensureSchema();
});

export default app;
import "./routes"