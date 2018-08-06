const request = require('request');
const config = require('./config.js');

module.exports.validateClient = () => { return new Promise((resolve) => resolve())};

if (config.client.authentication.enabled) {
    module.exports.validateClient = (token) => {
        return new Promise((resolve, reject) => {
            const req = request(config.client.authentication.endpoint, {
                method: 'POST',
                json: true,
                headers: {
                    'Authorization': 'Token ' + token
                }
            }, (err, res, body) => {
                if (err) {
                    return;
                }
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
                    reject({ error: error.message, statusCode: statusCode });
                }
        
                resolve({token: token});
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                reject({ error: `Got error: ${e.message}` });
            });
        });
    }
}

module.exports.retrieveClientProfile = function(token) {
    return new Promise((resolve, reject) => {
        console.log(config.client.profile.endpoint);
        if (config.client.profile.endpoint) {
            const req = request(config.client.profile.endpoint, {
                json: true,
                headers: {
                    'Authorization': 'Token ' + token
                }
            }, (err, res, body) => {
                console.log(body);
                if (body && body.data) {
                    resolve(body.data);
                }
                resolve({});
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                //reject({ error: `Got error: ${e.message}` });
                resolve({});
            });
        }
        else {
            resolve({});
        }
    });
}