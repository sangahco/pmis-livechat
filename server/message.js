const randomID = require('random-id');

class Message {
    constructor(text, name, profilePicUrl, imageUrl) {
        this.text = text;
        this.name = name;
        this.time = new Date();
        this.id = randomID(16);
        this.profilePicUrl = profilePicUrl || 'images/user-icon.png';
        this.imageUrl = imageUrl;
    }
}

module.exports = Message;