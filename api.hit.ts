import http from 'http';
import type { INewsApiResponse, IWebzApi, Post } from './interfaces';

// Hit API webz.io (using SDK Or Nah)
export default class WebzApi {
    private _host;
    private _path;
    private _method;
    private _abort = false;

    constructor({host, path, method}: IWebzApi){ 
        this._host = host;
        this._path = path;
        this._method = method;
    }

    hitApi<T>(options: http.RequestOptions):Promise<T> {
        return new Promise((resolve, reject) => {
            http.request(options, (res) => {
                res.setEncoding('utf-8');
                let full_response = "";
                res.on('data', (chunk) => {
                        full_response += chunk;
                })
                res.once("end", () => {
                    resolve(JSON.parse(full_response!));
                    res.removeAllListeners()
                });
                res.once("error", (err) => {
                    reject(err)
                    res.removeAllListeners()
                })
            }).end()
        })
    }

    async* iterateCalls(rows: number): AsyncIterableIterator<{posts: Post[], count: number, totalCount: number}> {
        let path = this._path;
        let rowsLeft = 0;
        let count = 0;
        let totalCount = 0;

        const posts = [];
        const numberOfRows = 10;

        console.log('Starting iteration', path)
        do {
            const data = await this.hitApi<INewsApiResponse>({
                host: this._host,
                path,
                method: this._method
            });
            path = data.next;

            rowsLeft = data.totalResults - data.moreResultsAvailable;
            totalCount = data.totalResults;
            count += rowsLeft;

            console.log('Number of posts fetched: ', data.posts.length)
            posts.push(...data.posts);

            if ((count % rows) === 0 || rowsLeft < numberOfRows){
                yield {posts, count, totalCount};
                posts.length = 0;
            }

        } while (rowsLeft >= numberOfRows /* && !this._abort */);
    }

    // Used for callback version No longer relevant
    /* abortIteration() {
        this._abort = true;
    } */
}
