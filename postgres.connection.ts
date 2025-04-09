// Connect To DB from env (pg)
import pg from 'pg';
import assert from 'assert';
const { Pool, DatabaseError } = pg;
import type { IDatabase, Thread } from './interfaces';
import { thread, type ISchema, post } from './entities.ts';

export default class Database extends Pool{
    private _user;
    private _password;
    private _host;
    private _port;
    private _db_name;
    // private _connection; 
    constructor({user, password, host, port, db_name}: IDatabase) {
        super({
            user: user,
            password: password,
            host: host,
            port: port,
            database: db_name
        });
        this._user = user;
        this._password = password;
        this._host = host;
        this._port = port;
        this._db_name = db_name;
    }

    async connection() {
        try{
            await super.connect();
            console.log('Database connected')
            return 0;
        }
        catch (err){
            assert(err instanceof DatabaseError)
            switch(err?.code) {
                case '3D000': {
                    console.error('Database doesn\'t exists');
                    return 1;
                }
                default:{
                    console.error('Something went wrong');
                    break;
                }
            }
            return 2;
        }
    }

    async initialize() {
        if (await this.connection() === 1) {
            // Try creating new DB using default DB
            try {
                const db = new Database({
                    user: this._user,
                    password: this._password,
                    host: this._host,
                    port: this._port,
                    db_name: "postgres" 
                })
                await db.query(`CREATE DATABASE ${this._db_name};`);
                console.log('Database created successfully')

                await this.connection();
                await this.createTables();
            }
            catch (err) {
                console.log(err)
                console.error('Error while initializing database')
            }
        }
    }

    async createTables() {
        const entities = [thread, post];

        for (const entity of entities) {
            await super.query(entity.createQuery);
        }
    }

    async insert<T>(entity: ISchema<T>, data: T[]) {
        const client = await super.connect();
        try {
            await client.query('BEGIN;');
            // Chunking the data as sending in a single query is not scaling well
            await Promise.all(this._chunkArray(data)
                .map(chunkedArray => {
                    const {query, value} = this._formatInsert(entity, chunkedArray);
                    client.query(query, value)
            }));
            await client.query('COMMIT;');
        } catch (e) {
            await client.query('ROLLBACK;')
        }
    }

    private _formatInsert<T>(schemaData: ISchema<T>, data: T[]) {
        const query = `
            INSERT INTO ${schemaData.name} (
            ${schemaData.schema.join(",")}
            ) VALUES
            `
        .replaceAll('\n', '')
        .replace(/\s+/g, ' ')
        .trim();
        const values: T[keyof T][] = [];
        const valuePlaceholders: string[] = [];

        data.forEach((item: T, index) => {
            const lengthPerRow = schemaData.schema.length;
            const start = index * lengthPerRow + 1; 
            const placeholders = Array.from({ length: lengthPerRow }, (_, ind) => `$${start + ind}`).join(", "); 
            valuePlaceholders.push(`(${placeholders})`);

            values.push(
                ...schemaData.schema.map((schema: keyof T) => 
                    item[schema])
            );
        });

        const finalQuery = query + valuePlaceholders.join(', ') + 'ON CONFLICT (uuid) DO NOTHING' + ';';
        return {query: finalQuery, value: values};
    }

    private _chunkArray<T>(array: T[], chunkSize = 25) {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }

    // TODO: Fix Not begin able to query on the connection
    /* async startTransaction() {
        this._connection = await super.connect(); 
        await this._connection.query('BEGIN;');
        return {
            commit: this.commitTransaction,
            rollback: this.rollbackTransaction,
            query: this._connection.query
        };
    }

    private async commitTransaction() {
        await this._connection.query('COMMIT;');
    }

    private async rollbackTransaction() {
        await this._connection.query('ROLLBACK;');
    } */


    async end() {
        await super.end();
        console.log('Database connection ended')
    }
}

