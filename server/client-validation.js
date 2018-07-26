const request = require('request');
const config = require('./config.js');

exports.validateClient = (token, callback) => {
    const req = request(config.client.authentication.endpoint, {
        method: 'POST',
        json: true,
        headers: {
            'Authorization': 'Token ' + token
        }
    }, (err, res, body) => {
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
        callback.call(null)
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
    req.end();

    return req;
}