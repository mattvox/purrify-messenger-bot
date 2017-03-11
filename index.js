'use strict'

/* global process */

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})

app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/webhook', function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.postback) {
                    receivedPostback(event);
                } else if (event.message) {
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        res.sendStatus(200);
    }
});

// ---------------------------------------------------------

function receivedPostback(event) {
    var senderID = event.sender.id;
    var payload = event.postback.payload;

    if (payload === 'Greeting') {
        request({
            uri: `https://graph.facebook.com/v2.6/${senderID}`,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: 'first_name'
            },
            method: 'GET'
        }, function (err, response, body) {
            var greeting = '';

            if (err) {
                console.log('error finding user name: ', err);
            } else {
                var bodyObj = JSON.parse(body);
                greeting = 'Oh herro' + bodyObj.first_name + '! ';
            }

            var messageData = {
                recipient: {
                    id: senderID
                },
                message: {
                    text: greeting + 'Welcome to the Purrrify bot. Would you like a cat fact right meow?',
                    quick_replies: [
                        {
                            content_type: 'text',
                            title: 'Yes',
                            payload: 'cat fact'
                        }, {
                            content_type: 'text',
                            title: 'No',
                            payload: 'no cat fact'
                        }
                    ]
                }
            }
            
            callSendAPI(messageData);
        })
    }
}

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;
    var messageText = message.text.toLowerCase().trim();
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'cat fact' || 'yes':
                sendCatFactMessage(senderID);
                break;

            case 'get started':
                sendIntroMessage(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendIntroMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: 'Would you like a badass cat fact?',
            quick_replies: [
                {
                    content_type: 'text',
                    title: 'Yes',
                    payload: 'cat fact'
                }, {
                    content_type: 'text',
                    title: 'No',
                    payload: 'no cat fact'
                }
            ]
        }
    }
}

function sendGenericMessage(recipientId, messageText) {
    console.log('generic message');
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
            console.error(error);
        }
    });
}
