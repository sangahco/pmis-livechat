const http = require('http');

exports.validateClient = (token, callback) => {
    const req = http.request({
        hostname: '192.168.99.100',
        port: 80,
        path: '/',
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