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

    const valid = validate(req.body);

    if (valid) {
        res.json({ "status": "ok", "feedback": req.body });
    } else {
        res.json({ "status": "error", "error_message": "Invalid feedback submission", "feedback": req.body });
    };

});


export default router;