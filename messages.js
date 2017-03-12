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
  },

  sendCatMessage: function (recipientId) {
      request({
          uri: 'https://purrify.herokuapp.com/api/cats',
          method: 'GET'
      }, function (err, response, body) {
          if (err) {
              console.log('send cat fact error: ', err);
          }

          if (typeof body === 'string') {
              var body = JSON.parse(body);
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
                          url: body[0].uri
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

          if (typeof body === 'string') {
              var body = JSON.parse(body);
          }

          var messageData = {
              recipient: {
                  id: recipientId
              },
              message: {
                  text: body[0].fact
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
  }

}

var callSendAPI = function (messageData) {
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

exports.callSend = callSendAPI;
