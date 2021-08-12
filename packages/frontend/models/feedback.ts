export type FivePointScale = 1 | 2 | 3 | 4 | 5;
export enum ActivityType {
    Computer,
    Paper,
}

export interface UserFeedback {
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
    clothing: FivePointScale;
    activityLevel: ActivityType;
    id: number;
}
