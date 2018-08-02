const randomID = require('random-id');

function Message(text, name) {
    this.text = text;
    this.name = name;
    this.time = new Date();
    this.id = randomID(16);
    this.profilePicUrl = 'http://placehold.it/50/FA6F57/fff.gif&text=U';
}

module.exports = Message;