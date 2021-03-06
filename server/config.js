const logger = require('./logger');

const config = {
    server: {
        host: process.env.SERVER_HOST || '0.0.0.0',
        port: process.env.SERVER_PORT || 3000,
        name: process.env.SERVER_NAME || 'LiveChat',
        webroot: process.env.SERVER_WEBROOT || ''
    },
    client: {
        profile: {
            endpoint: process.env.CLIENT_PROFILE_ENDPOINT || ''
        },
        authentication: {
            enabled: (process.env.CLIENT_AUTH_ENABLED == 'true') || false,
            endpoint: process.env.CLIENT_AUTH_ENDPOINT || 'http://127.0.0.1',
        }
    },
    room: {
        default: {
            unlisted: false
        }
    }
};

module.exports = config;

logger.info(JSON.stringify(config));

// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
//     if (index == 2) {
//         serverPort = val;
//     }
//     if (index == 3) {
//         serverHost = val;
//     }
// });