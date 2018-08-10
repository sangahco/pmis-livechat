const config = require('./config');

function Room(roomName, settings) {
    let room = {
        name: roomName,
        roomID: roomName,
        settings: settings || config.room.default,
        clients: [],
        setUnlisted: (unlisted) => {
            if (unlisted != null) {
                room.settings.unlisted = !!unlisted;
            }
        },
        setRoomName: (name) => {
            name && (room.settings.roomName = name);
        }
    };

    return room;
}

module.exports = Room;