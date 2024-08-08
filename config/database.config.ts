import { registerAs } from '@nestjs/config';
import { env } from '../utils/env';

type Connection = {
    driver: 'mysql';
    hostRead: string;
    hostWrite: string;
    port: string;
    user: string;
    pass: string;
    name: string;
};

export const dbConfig: { [key: string]: Connection } = {
    main: {
        driver: 'mysql',
        hostRead: env('DB_HOST_READ'),
        hostWrite: env('DB_HOST_WRITE'),
        port: env('DB_PORT'),
        user: env('DB_USER'),
        pass: env('DB_PASS'),
        name: env('DB_NAME'),
    },
};

export default registerAs('DATABASE', () => {
    const dbConnection = env('DB_CONNECTION', 'main');
    const db = dbConfig[dbConnection];
    return {
        DRIVER: 'mysql',
        HOST_READ: db.hostRead,
        HOST_WRITE: db.hostWrite,
        PORT: db.port,
        USER: db.user,
        PASS: db.pass,
        NAME: db.name,
    };
});
