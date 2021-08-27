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
    overall_satisfaction: FivePointScale,
    sensations_temperature: FivePointScale,
    sensations_air_quality: FivePointScale,
    preferences_temperature: FivePointScale,
    preferences_light: FivePointScale,
    preferences_sound: FivePointScale,
    measured_temp: number,
    measured_co2: number,
}

const schema: JSONSchemaType<UserFeedback> = {
    type: "object",
    properties: {
        user_id: { type: "number" },
        place_id: { type: "number" },
        overall_satisfaction: { type: "number" },
        sensations_temperature: { type: "number" },
        sensations_air_quality: { type: "number" },
        preferences_temperature: { type: "number" },
        preferences_light: { type: "number" },
        preferences_sound: { type: "number" },
        measured_temp: { type: "number" },
        measured_co2: { type: "number" },
    },
    required: [
        "user_id",
        "place_id",
        "overall_satisfaction",
        "sensations_temperature",
        "sensations_air_quality",
        "preferences_temperature",
        "preferences_light",
        "preferences_sound",
        "measured_temp",
        "measured_co2"
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