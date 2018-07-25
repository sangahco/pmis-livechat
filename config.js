//const config = require('./config.json');

const config = {
    server: {
        host: process.env.SERVER_HOST || '0.0.0.0',
        port: process.env.SERVER_PORT || 3000,
        name: process.env.SERVER_NAME || 'LiveChat'
    },
    client: {
        authentication: process.env.CLIENT_AUTHENTICATION || false
    }
};

module.exports = config;


// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
//     if (index == 2) {
//         serverPort = val;
//     }
//     if (index == 3) {
//         serverHost = val;
//     }
// });