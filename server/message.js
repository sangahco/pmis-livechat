const randomID = require('random-id');

class Message {
    constructor(text, name, profilePicUrl, imageUrl) {
        this.text = text;
        this.name = name;
        this.time = new Date();
        this.id = randomID(16);
        this.profilePicUrl = profilePicUrl;
        this.imageUrl = imageUrl;
    }
}

module.exports = Message;