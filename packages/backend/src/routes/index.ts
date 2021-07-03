import auth from "./auth"
import feedback from "./feedback"

import app from "../main"
import winston from "winston"
import expressWinston from "express-winston"


// Setup logging 
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    )
  }));

// Routers
app.use(auth);
app.use(feedback);

// Default handlers
app.use((req, res) => {
    res.status(404).json({
        "status": "error",
        "error_mesage": "Could not find route specified"
    });
});

// Error handling 
app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console()
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    )
  }));