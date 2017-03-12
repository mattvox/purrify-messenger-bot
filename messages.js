'use strict'

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
