/**
 * Handles feedback submission from the app, logging it into the database
 */

import Ajv, { JSONSchemaType } from "ajv"
import * as bodyParser from "body-parser"
import { Router } from "express"
import User, { addFeedback } from "../database/user";
import { logger } from "../main";


const ajv = new Ajv()

export type FivePointScale = 1 | 2 | 3 | 4 | 5;
export type ActivityType = "Computer" | "Paper";

export interface UserFeedback {
    user_id: number,
    place_id: number,
    sensations_temperature: FivePointScale,
    preferences_temperature: FivePointScale,
    clothing_level: FivePointScale,
    indoor_temp: number,
    indoor_humidity: number,
}

const schema: JSONSchemaType<UserFeedback> = {
    type: "object",
    properties: {    
        user_id: { type: "number" },
        place_id: { type: "number" },
        sensations_temperature: { type: "number" },
        preferences_temperature: { type: "number" },
        clothing_level: { type: "number" },
        indoor_temp: { type: "number" },
        indoor_humidity: { type: "number" },
    },
    required: [
        "user_id",
        "place_id",
        "sensations_temperature",
        "preferences_temperature",
        "clothing_level",
        "indoor_temp",
        "indoor_humidity",
    ],
    additionalProperties: false
}

const validate = ajv.compile(schema);

const router = Router();

router.post("/feedback", bodyParser.urlencoded({ extended: false }), bodyParser.json(), async (req, res) => {

    logger.info(JSON.stringify(req.body));

    // Validate feedback against submission
    const valid = validate(req.body);

    if (valid) {
        res.status(200).json({ "status": "ok" });
        addFeedback(req.body);
        res.end();
    } else {
        res.status(400).json({ "status": "error", "error_message": "Invalid feedback submission" });
    };

});


export default router;