/**
 * Manages database access. For right now, this is just an sqlite database in a file, but this may
 * transition to a more """real""" database in the future.
 * 
 * Advantages of the current setup:
 *  - Very simple
 *  - Very fast
 *  - Easy to export data to help develop the model
 *
 * Disadvantages of the current setup:
 *  - Will not have networked access to data
 *  - Little bit harder to administrate
 * 
 **/

import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";
import { sqlite as config } from "../config.json";
import { logger } from "../main";
import { join } from "path";
import appRoot from "app-root-path";

export async function database() {
    return sqlite.open({
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        filename: process.env.PROD ? "/data/cu-smart.db" : join(`${appRoot.path}`, config.path),
        driver: sqlite3.cached.Database,
    });
};

/**
 * Ensures the database is setup correctly.
 **/
export async function ensureSchema() {
    logger.info("Ensuring database compatibility...");
    const db = await database();
    
    // Users
    logger.info("Ensuring database compatibility: users...");
    await db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, 
            username TEXT, 
            admin INTEGER, 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    // User favorites
    logger.info("Ensuring database compatibility: favorites...");
    await db.run(
        `CREATE TABLE IF NOT EXISTS favorites (
            user_id INTEGER, 
            place_id INTEGER, 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);
    
    // Feedback submissions
    logger.info("Ensuring database compatibility: feedback...");
    await db.run(
        `CREATE TABLE IF NOT EXISTS feedback (
            user_id INTEGER, 
            place_id INTEGER,
            sensations_temperature INTEGER,
            preferences_temperature INTEGER,
            clothing_level INTEGER,
            indoor_temp REAL,
            indoor_humidity REAL,
            outdoor_temp REAL,
            outdoor_humidity REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    // Tokens
    logger.info("Ensuring database compatibility: tokens...");
    await db.run(
        `CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    logger.info("Ensuring database compatibility: COMPLETE!");   

};