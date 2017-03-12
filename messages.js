'use strict'

module.exports = {
    receivedMessage,
    sendTextMessage,
    sendCatMessage,
    sendCatFactMessage,
    sendShareMessage
}

function receivedMessage(event) {
    var quickReply;
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log('************ MESSAGE: ', message);

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;
    var messageText = message.text;
    var messageAttachments = message.attachments;


    if (message.quick_reply){
        quickReply = message.quick_reply.payload;
        console.log(quickReply);
    }

    if (quickReply) {
        messageText = quickReply;
    }


    if (messageText) {
        switch (messageText.toLowerCase().trim()) {
            case 'cat fact':
                sendCatFactMessage(senderID);
                break;

            // case 'yes':
            //     sendCatFactMessage(senderID);
            //     break;

            default:
                sendTextMessage(senderID, 'I am sorry, I do not understand this message.');
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendTextMessage(recipientId, messageText) {
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

function sendCatMessage(recipientId) {
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
}

function sendCatFactMessage(recipientId) {
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
}

function sendShareMessage(recipientId, messageText) {
    console.log('test', recipientId, messageText);
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
