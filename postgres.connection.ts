// Connect To DB from env (pg)
import pg from 'pg';
import assert from 'assert';
const { Pool, DatabaseError } = pg;

interface IDatabase {
    user: string,
    password: string,
    host: string,
    port: number,
    db_name: string
}
export default class Database extends Pool{
    private _user;
    private _password;
    private _host;
    private _port;
    private _db_name;
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
            }
            catch (err) {
                console.error('Error while initializing database')
            }
        }
    }

    async end() {
        await super.end();
        console.log('Database connection ended')
    }
}

