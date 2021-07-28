import auth from "./auth"
import feedback from "./feedback"
import data from "./data"

import app, { logger } from "../main"
import winston from "winston"
import expressWinston from "express-winston"

// Setup logging 
app.use(expressWinston.logger({
    winstonInstance: logger,
  }));

// Routers
app.use(auth);
app.use(feedback);
app.use(data);

// Default handlers
app.use((req, res) => {
    res.status(404).json({
        "status": "error",
        "error_message": "Could not find route specified"
    });
});

// Error handling 
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  }));