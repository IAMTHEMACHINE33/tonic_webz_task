import http from 'http';

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

    async iterateCalls(rows: number, cb: (data: Post[]) => void) {
        let path = this._path;
        let rowsLeft = 0;
        let count = 0;
        let totalCount = 0;

        const posts = [];
        const numberOfRows = 10;

        console.log('Starting iteration')
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
                await cb(posts);
                posts.length = 0;
            }

        } while (rowsLeft >= numberOfRows && !this._abort);

        console.log('Iteration finished', count)
        return {count, totalCount};
    }

    abortIteration() {
        this._abort = true;
    }
}

interface IWebzApi extends http.RequestOptions {}

interface INewsApiResponse {
  posts: Post[] | [];
  totalResults: number;
  moreResultsAvailable: number;
  next: string;
  requestsLeft: number;
  warnings: string | null;
}

export interface Post {
  thread: Thread;
  uuid: string;
  url: string;
  ord_in_thread: number;
  parent_url: string | null;
  author: string;
  published: string;
  title: string;
  text: string;
  highlightText: string;
  highlightTitle: string;
  highlightThreadTitle: string;
  language: string;
  sentiment: string | null;
  categories: string[] | null;
  external_links: string[];
  external_images: string[];
  entities: {
    persons: Entity[];
  };
  rating: string | null;
  crawled: string;
  updated: string;
}

interface Thread {
  uuid: string;
  url: string;
  site_full: string;
  site: string;
  site_section: string;
  site_categories: string[];
  section_title: string;
  title: string;
  title_full: string;
  published: string;
  replies_count: number;
  participants_count: number;
  site_type: string;
  country: string;
  main_image: string;
  performance_score: number;
  domain_rank: number | null;
  domain_rank_updated: string | null;
  social: Social;
}

interface Social {
  updated: string;
  facebook: {
    likes: number;
    comments: number;
    shares: number;
  };
  vk: {
    shares: number;
  };
}

interface Entity {
  name: string;
  sentiment: string;
}
