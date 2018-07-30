const admin = require("firebase-admin");

var serviceAccount = require("./firebase-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://friendlychat-41e71.firebaseio.com"
});

module.exports = admin;