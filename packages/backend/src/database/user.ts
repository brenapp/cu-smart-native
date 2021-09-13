/**
 * Models a user in the database.
 **/

import { database } from "./index"
import { FivePointScale, UserFeedback } from "../routes/feedback";
import { getTemperature, getRelativeHumidity } from "./outside";

export interface UserData {
    id: number;
    username: string;
    admin: number;
    created: Date;
};

// All the different ways we can identify a single user.
interface UserIdentifier {
    username: string;
    id: number;
    token: string;
};

export default class User {

    /**
     * Ensures a specific user exists, given some information about them. Does not ensure that the
     * given information is accurate for given users, instead the passed data is used for new users.
     * 
     * @param data Default user data to use if the user does not exist.
     * @returns The created/existing user.
     **/
    static async ensure(data: Omit<Omit<UserData, "created">, "id">): Promise<User> {
        const db = await database();
        let user = await User.by("username", data.username);

        if (!user) {
            const result = await db.run("INSERT INTO users (username, admin) VALUES (?, ?)", data.username, data.admin);
            user = new User({
                id: result.lastID as number,
                created: new Date(),
                ...data
            });
        };

        return user;
    }


    /**
     * Gets a specific user based on an individual identifier, 
     * 
     * @param characteristic The characteristic to use
     * @param value The value to search for
     * 
     * @returns The user if it exists, otherwise null
     **/
    static async by<T extends keyof UserIdentifier>(characteristic: T, value: UserIdentifier[T]): Promise<User | null> {
        const db = await database();

        let data: UserData | undefined = undefined;
        switch (characteristic) {
            case "id": {
                data = await db.get<UserData>("SELECT * FROM users WHERE id = ?", value.toString());
                break;
            };

            case "username": {
                data = await db.get<UserData>("SELECT * FROM users WHERE username = ?", value.toString());
                break;
            };

            case "token": {

                const id = await db.get("SELECT user_id FROM tokens WHERE token = ?", value.toString());

                if (id) {
                    data = await db.get<UserData>("SELECT * FROM users WHERE id = ?", id);
                }
                break;
            };
        };

        if (data) {

            // Turn created into a date
            data.created = new Date(data.created);

            return new User(data);
        } else {
            return null;
        }

    };

    data: UserData;
    constructor(data: UserData) {
        this.data = data;
    };

    /**
     * Updates information about this user in the database.
     * 
     * @param key The column to update 
     * @param value The new value for the column
     * 
     * @returns The result of the update
     **/
    async update<T extends keyof UserData>(key: T, value: UserData[T]) {
        const db = await database();
        return db.run(`UPDATE users SET ${key} = ? WHERE id = ?`, key, value.toString(), this.data.id).then(result => {
            if (result.changes && result.changes > 0) {
                this.data[key] = value;
            }
        });
    };

    /**
     * Gets all user tokens associated with this account. 
     * 
     * @returns A list of tokens for this user.
     **/
    async tokens(): Promise<string[]> {
        const db = await database();
        const tokens = await db.all<{ token: string }[]>("SELECT token FROM tokens WHERE user_id = ?", this.data.id);

        return tokens.map(token => token.token);
    };

    /**
     * Adds a new token to this user.
     * 
     * @param token The token to add
     * @returns true if the token was added, false otherwise
     **/
    async addToken(token: string): Promise<boolean> {
        const db = await database();
        const result = await db.run("INSERT INTO tokens (token, user_id) VALUES (?, ?)", token, this.data.id);

        return !!result.changes && result.changes > 0;
    };

    /**
     * Deletes the token from the database.
     * 
     * @param token The token to delete
     * @returns true if the token was deleted, false otherwise
     **/
    async deleteToken(token: string): Promise<boolean> {
        const db = await database();
        const result = await db.run("DELETE FROM tokens WHERE token = ?", token);

        return !!result.changes && result.changes > 0;
    };


    /**
     * Returns the PointSliceID of all of this user's favorite places.
     * 
     * @returns A list of ids of all of this user's favorite places.
     **/
    async favorites(): Promise<number[]> {
        const db = await database();
        const favorites = await db.all<{ place_id: number }[]>("SELECT place_id FROM favorites WHERE user_id = ?", this.data.id);

        return favorites.map(fav => fav.place_id);
    };

    /**
     * Adds a new favorite place to the user.
     * 
     * @param favorite The point slice ID of the favorite place to add
     * @returns true if the favorite place was added, false otherwise
     **/
    async addFavorite(favorite: number): Promise<boolean> {
        const db = await database();
        const result = await db.run("INSERT INTO favorites (place_id, user_id) VALUES (?, ?)", favorite, this.data.id);

        return !!result.changes && result.changes > 0;
    };

    /**
     * Deletes the favorite from the database.
     * 
     * @param favorite The favorite to delete
     * @returns true if the favorite was deleted, false otherwise
     **/
    async deleteFavorite(favorite: number): Promise<boolean> {
        const db = await database();
        const result = await db.run("DELETE FROM tokens WHERE token = ?", favorite);

        return !!result.changes && result.changes > 0;
    };

};

/**
 * Submit feedback about a particular place.
 * 
 * @param
 **/
    export async function addFeedback(feedback: UserFeedback): Promise<boolean> {
    const db = await database();

    const outdoorTemp = await getTemperature();
    const outdoorHumidity = await getRelativeHumidity();

    const result = await db.run(`
        INSERT INTO feedback 
            (user_id, 
                place_id,
                sensations_temperature,
                preferences_temperature,
                clothing_level,
                indoor_temp,
                indoor_humidity,
                outdoor_temp,
                outdoor_humidity) VALUES (
                ?, 
                ?, 
                ?,
                ?,
                ?, 
                ?, 
                ?,
                ?,
                ?)`,
        feedback.user_id,
        feedback.place_id,
        feedback.sensations_temperature,
        feedback.preferences_temperature,
        feedback.clothing_level,
        feedback.indoor_temp,
        feedback.indoor_humidity,
        outdoorTemp,
        outdoorHumidity
    );

    return !!result.changes && result.changes > 0;

}