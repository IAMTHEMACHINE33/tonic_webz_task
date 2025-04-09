import WebzApi from './api.hit.ts';
import Database  from './postgres.connection.ts';
import { QueryBuilder } from './query.builder.ts';
import type { Post, PostOnly, Thread } from './interfaces.ts';
import { post, thread } from './entities.ts';

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
const queryBuilder = new QueryBuilder(stemming('crypto'));
const api_query = queryBuilder
    .and('digital coin')
    .and(literal('ethereum'), literal('bitcoin'))
    .or('doge')
    .getFinalQuery();
// const api_query = 'Tell-me-all-about-cartoon-networks-or-cartoons-in-general';

// API Request To Webz Part
const API_WEBZ = process.env.API_WEBZ ?? 'api.webz.io/newsApiLite';
const API_TOKEN = process.env.API_TOKEN;
const options = {
    host: API_WEBZ.slice(0, API_WEBZ.indexOf('/')),
    path: `${API_WEBZ.slice(API_WEBZ.indexOf('/'))}?token=${API_TOKEN}&q=${api_query}`,
    method: 'GET'
}

// Query To Add every 200
const webz = new WebzApi(options)
const chunksize = 100;
const iterate = webz.iterateCalls(chunksize);

let leftToRetrieve = 0;
let finalCount = 0;

do {
    const chunk = (await iterate.next()).value;
    leftToRetrieve = chunk.totalCount - chunk.count;
    finalCount = chunk.count;

    console.log(`Adding ${chunk.posts.length} from iteration to db`);
    const threads: Thread[] = [];
    const posts: PostOnly[] = [];

    chunk.posts.forEach(({ thread, ...rest }: Post) => {
        threads.push(thread);
        posts.push(rest);
    });

    await db.insert(thread, threads);
    await db.insert(post, posts);
} while (leftToRetrieve > 0)

console.log('Total count:', finalCount);
await db.end();



// TODO : unit test Cases (jest) (no calls to internet or db)
// TODO : Docker compose

// Ref
// https://docs.webz.io/reference/news-api-lite
// https://docs.webz.io/reference/cheat-sheet
// https://github.com/Webhose/webzio-nodejs
// https://api.webz.io/newsApiLite?token=[token]&q=Bitcoin
