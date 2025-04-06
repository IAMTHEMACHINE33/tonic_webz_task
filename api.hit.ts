import http from 'http';

// Hit API webz.io (using SDK Or Nah)
const hitApi = (options: http.RequestOptions) => {
    return new Promise((resolve, reject) => {
        http.request(options, (res) => {
            res.setEncoding('utf-8');
            let full_response;
            res.on('data', (chunk) => {
                full_response += chunk;
            })
            res.once("end", () => {
                resolve(full_response);
                res.removeAllListeners()
            });
            res.once("error", (err) => {
                reject(err)
                res.removeAllListeners()
            })
        }).end()
    })
}
export default hitApi;
