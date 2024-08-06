import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize';
import { dbConfig } from './config/database.config';
import * as fs from 'fs';
import * as path from 'path';
const db = dbConfig[process.env.DB_CONNECTION ?? 'main'];

const sequelize = new Sequelize(db.name, db.user, db.pass, {
    dialect: db.driver,
    replication: {
        read: [
            {
                host: db.hostRead,
                port: db.port,
                username: db.user,
                password: db.pass,
            },
        ],
        write: {
            host: db.hostWrite,
            port: db.port,
            username: db.user,
            password: db.pass,
        },
    },
});
const pathToMigrationsFolder = path.join(__dirname, 'database', 'migrations');

export const migrator = new Umzug({
    migrations: {
        glob: ['database/migrations/*.ts', { cwd: __dirname }],
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize, modelName: 'migration_meta' }),
    logger: console,
    create: {
        folder: pathToMigrationsFolder,
        template: (filepath) => [
            [
                filepath,
                fs
                    .readFileSync(
                        path.join(
                            __dirname,
                            'database',
                            'template',
                            'sample-migration.ts',
                        ),
                    )
                    .toString(),
            ],
        ],
    },
});

export type Migration = typeof migrator._types.migration;