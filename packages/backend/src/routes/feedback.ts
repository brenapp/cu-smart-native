/**
 * Handles feedback submission from the app, logging it into the database
 */

import Ajv, { JSONSchemaType } from "ajv"
import * as bodyParser from "body-parser"
import { Router } from "express"

const ajv = new Ajv()

type FivePointScale = 1 | 2 | 3 | 4 | 5;
interface UserFeedback {
    overallSatisfaction: FivePointScale; // 1 = very dissatisfied, 5 = very satisfied
    sensations: {
        temperature: FivePointScale; // 1 = cool, 5 = hot
        airQuality: FivePointScale; // 1 = very poor, 5 = very good
    };
    preferences: {
        temperature: FivePointScale; // 1 = much cooler, 5 = much warmer
        light: FivePointScale; // 1 = much dimmer, 5 = much brighter
        sound: FivePointScale; // 1 = much quieter, 5 = much louder
    };
}

const schema: JSONSchemaType<UserFeedback> = {
    type: "object",
    properties: {
        overallSatisfaction: { type: "integer", minimum: 1, maximum: 5 },
        sensations: {
            type: "object",
            properties: {
                temperature: { type: "integer", minimum: 1, maximum: 5 },
                airQuality: { type: "integer", minimum: 1, maximum: 5 }
            },
            required: ["airQuality", "temperature"]
        },
        preferences: {
            type: "object",
            properties: {
                temperature: { type: "integer", minimum: 1, maximum: 5 },
                light: { type: "integer", minimum: 1, maximum: 5 },
                sound: { type: "integer", minimum: 1, maximum: 5 }
            },
            required: ["light", "sound", "temperature"]
        }
    },
    required: ["overallSatisfaction", "preferences", "sensations"],
    additionalProperties: false
}

const validate = ajv.compile(schema);

const router = Router();

router.post("/feedback", bodyParser.urlencoded({ extended: false }), bodyParser.json(), (req, res) => {

    // Because this is an automated request (originating from a fetch in the client, redirecting to
    // authentication doesn't make sense, so return an error when the user isn't authenticated, and
    // allow the client to authenticate)
    if (!req.isAuthenticated()) {
        res.status(401).json({
            "status": "error",
            "error_message": "Unauthenticated"
        });
    } else {
        // Validate feedback against submission
        const valid = validate(req.body);

        if (valid) {
            res.status(200).json({ "status": "ok" });

        } else {
            res.status(400).json({ "status": "error", "error_message": "Invalid feedback submission" });
        };

    }
});


export default router;