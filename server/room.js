const config = require('./config');

class Room {
    constructor(roomName, settings, clients) {
        this.name = roomName;
        this.roomID = roomName;
        this.settings = settings || {
            unlisted: config.room.default.unlisted
        };
        this.clients = clients || [];
    }

    setUnlisted(unlisted) {
        if (unlisted != null) {
            this.settings.unlisted = !!unlisted;
        }
    }

    setRoomName(name) {
        name && (this.settings.roomName = name);
    }
}

module.exports = Room;