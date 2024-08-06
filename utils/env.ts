import * as dotenv from 'dotenv';
dotenv.config();

export function env(key: string, defaultValue: any = null): any {
    return process.env[key] ?? defaultValue;
}

