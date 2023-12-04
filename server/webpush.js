const webpush = require('web-push');
const config = require('./config');

const publicVapidKey = config.server.vapidkey.public;
const privateVapidKey = config.server.vapidkey.private;

webpush.setVapidDetails('mailto:emawind84@gmail.com', publicVapidKey, privateVapidKey);

module.exports = function (app) {

  var subscription;

  app.post('/subscribe', (req, res) => {
    subscription = req.body;
    res.status(201).json({});
    
    console.log(subscription);
    
    // const payload = JSON.stringify({ title: 'test' });
    // webpush.sendNotification(subscription, payload).catch(error => {
    //   console.error(error.stack);
    // });
  });

  return {
    sendNotification : function (text) {
      const payload = JSON.stringify({ title: text });
      webpush.sendNotification(subscription, payload).catch(error => {
        console.error(error.stack);
      });
    }
  };
};
