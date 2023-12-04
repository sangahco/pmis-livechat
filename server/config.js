const logger = require('./logger');

const config = {
    server: {
        host: process.env.SERVER_HOST || '0.0.0.0',
        port: process.env.SERVER_PORT || 3000,
        name: process.env.SERVER_NAME || 'LiveChat',
        webroot: process.env.SERVER_WEBROOT || '',
        vapidkey: {
            public: process.env.PUBLIC_VAPID_KEY || 'BOGAcHPHFJGLUY19XaWNvjTeRrWfV5JlyKowJpWezTxQ6qRRb1uwfSk0DsOvrp_2hlMWuQTAQq96xKmmPCcvoHM',
            private: process.env.PRIVATE_VAPID_KEY || 'rGWV9JMoX-t8nht6bTvZeCbiFENMS2h0xFA8r52i_JE'
        }
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