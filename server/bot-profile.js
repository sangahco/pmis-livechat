const config = require('./config');
const randomID = require('random-id');
const multiavatar = require('@multiavatar/multiavatar');

module.exports = function(){
    return {
        clientID: '#livechat-bot',
        name: 'LiveChatBot',
        profilePicUrl: multiavatar('bot' + randomID(5))
    }
}();