import { Router } from "express";
import { logger } from "../main"
import { database } from "../database/";
import { UserFeedback } from "./feedback";

const router = Router();


router.get("/takeout.csv", async (req, res) => {
    let { start, end } = req.query as { start: string, end: string };

    const db = await database();

    const result = await db.all<UserFeedback[]>(`SELECT * FROM feedback`);

    if (result.length === 0) {
        res.status(500).send("No feedback found");
        return;
    }

    let response = Object.keys(result[0]).join(",") + "\n";
    for (let feedback of result) {
        response += Object.values(feedback).join(",") + "\n";
    }
    
    res.set("Content-Type", "text/csv");
    res.status(200).send(response);


});


export default router;