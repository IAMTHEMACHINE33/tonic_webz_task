import WebzApi from './api.hit.ts';
import Database  from './postgres.connection.ts';
import { QueryBuilder } from './query.builder.ts';

// DB Initializing Part
const db = new Database({
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: +(process.env.DB_PORT ?? 5432),
    db_name: process.env.DB_DATABASE_NAME!
});
await db.initialize();


// Query Building Part
const {literal, stemming, disableStemming} = QueryBuilder;
const queryBuilder = new QueryBuilder('initial');
const api_query = queryBuilder
    .and('name','surname')
    .and('another')
    .or(literal('abc'))
    .getFinalQuery();


// API Request To Webz Part
const API_WEBZ = process.env.API_WEBZ ?? 'api.webz.io/newsApiLite';
const API_TOKEN = process.env.API_TOKEN;
const options = {
    host: API_WEBZ.slice(0, API_WEBZ.indexOf('/')),
    path: `${API_WEBZ.slice(API_WEBZ.indexOf('/'))}?token=${API_TOKEN}&q=${api_query}`,
    method: 'GET'
}
// TODO: Query To Add every 200
const webz = new WebzApi(options)
// await webz.iterateCalls(20, async (chunk) => {
//     // db.query(``)
//     console.log('done', chunk.length)
// });

// TODO: Invoke callback with count & totalCount(totalResults)





// TODO : unit test Cases (jest) (no calls to internet or db)
// TODO : Docker compose

// Ref
// https://docs.webz.io/reference/news-api-lite
// https://docs.webz.io/reference/cheat-sheet
// https://github.com/Webhose/webzio-nodejs
// https://api.webz.io/newsApiLite?token=[token]&q=Bitcoin
