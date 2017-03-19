'use strict'

/* global process */

var request = require('request');

var PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

module.exports = {
  sendTextMessage: function (recipientId, messageText) {

    // a function for sending messages to a recipient. `recipientId` is a string.

      console.log('test', recipientId, messageText);
      var messageData = {
          recipient: {
              id: recipientId
          },
          message: {
              text: messageText
          }
      };

      callSendAPI(messageData);
  },

  sendCatMessage: function (recipientId) {
      request({
          uri: 'https://purrify.herokuapp.com/api/cats',
          method: 'GET'
      }, function (err, response, body) {
          if (err) {
              console.log('send cat fact error: ', err);
          }

          var jsonBody = body;

          if (typeof body === 'string') {
              jsonBody = JSON.parse(body);
          }

          console.log('*************BODY******************: ', body);

          var messageData = {
              recipient: {
                  id: recipientId
              },
              message: {
                  attachment: {
                      type: 'image',
                      payload: {
                          url: jsonBody[0].uri
                      }
                  }
              }
          };
          callSendAPI(messageData);
      })
  },

  sendCatFactMessage: function (recipientId) {
      request({
          uri: 'https://purrify.herokuapp.com/api/facts',
          method: 'GET'
      }, function (err, response, body) {
          if (err) {
              console.log('send cat fact error: ', err);
          }

          var jsonBody = body;

          if (typeof body === 'string') {
              jsonBody = JSON.parse(body);
          }

          var messageData = {
              recipient: {
                  id: recipientId
              },
              message: {
                  text: jsonBody[0].fact
              }
          };
          callSendAPI(messageData);
      })
  },

  sendShareMessage: function (recipientId, messageText) {
      var messageData = {
          recipient: {
              id: recipientId
          },
          message: {
              text: 'It\'s very easy to share a cat with us. Just snap a photo of a nearby cat or upload one from your phone or computer. We\'ll love you for it!'
          }
      };

      callSendAPI(messageData);
  },

  sendPostCatMessage: function (messageData) {
      callSendAPI(messageData);
  },

  sendGreetingMessage: function (messageData) {
      callSendAPI(messageData);
  }

}

function callSendAPI (messageData) {
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
