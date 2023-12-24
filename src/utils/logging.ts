import dotenv from "dotenv";
dotenv.config();

export const devLog = (
    message: any,
    ...optionalParams: any[]
): void => {
    // log if environment variable DEV_LOG is set to true
    if (process.env.DEV_LOG === "1" || process.env.DEV_LOG?.toLowerCase() === "true") {
        console.log(message, ...optionalParams);
    }
}