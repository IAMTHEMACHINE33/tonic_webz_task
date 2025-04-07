import hitApi from './api.hit.ts';
import Database  from './postgres.connection.ts';

const db = new Database({
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: +(process.env.DB_PORT ?? 5432),
    db_name: process.env.DB_DATABASE_NAME!
});
await db.initialize();

// const API_WEBZ = "api.webz.io/newsApiLite?token=[token]&q=[query]"
const API_WEBZ = process.env.API_WEBZ ?? 'api.webz.io/newsApiLite';
const API_WEBZ_BASE = API_WEBZ.slice(0, API_WEBZ.indexOf('/'));

const API_TOKEN = process.env.API_TOKEN;
const api_query = "bitcoin";
const api_webz_path = `${API_WEBZ.slice(API_WEBZ.indexOf('/'))}\
?token=${API_TOKEN}\
&q=${api_query}`;

const options = {
    host: API_WEBZ_BASE,
    path: api_webz_path,
    method: 'GET'
}
console.log(await hitApi(options), 'from here');
    // TODO: Builder For Query in webz (Make queries extendable)
        // wildcard asterisk *,
        // disable stemming $, 
        // encapsulate parenthesis (), AND +, OR , NOT -, 
        // literal quotation "",
// TODO: Query To Add every 200
db.query(``)

// TODO: Invoke callback with count & totalCount(totalResults)
// TODO : unit test Cases (jest) (no calls to internet or db)
// TODO : Docker compose

// Ref
// https://docs.webz.io/reference/news-api-lite
// https://docs.webz.io/reference/cheat-sheet
// https://github.com/Webhose/webzio-nodejs
// https://api.webz.io/newsApiLite?token=[token]&q=Bitcoin
