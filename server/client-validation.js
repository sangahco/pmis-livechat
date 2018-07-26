const http = require('http');
const config = require('./config.js');

exports.validateClient = (token, callback) => {
    const req = http.request({
        hostname: config.client.authentication.host,
        port: config.client.authentication.port,
        path: config.client.authentication.path,
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + token
        }
    }, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed with status code: ' + `${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }
        callback.call(null, res)
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
    req.end();

    return req;
}