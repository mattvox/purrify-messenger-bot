'use strict'

/* global process */

var request = require('request');

var PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

module.exports = {
  sendTextMessage: function (recipientId, messageText) {
      console.log('test', recipientId, messageText);
      var messageData = {
          recipient: {
              id: recipientId
          },
          message: {
              text: 'echo: ' + messageText
          }
      };

      callSendAPI(messageData);
  }
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        console.log('status code', response.statusCode);
        if (!error && response.statusCode === 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            // console.error(response);
            // console.error(error);
        }
    });
}
