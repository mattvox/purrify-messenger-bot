'use strict'

/* global process */

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var messages = require('./messages');

var PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

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

// ***************************** POSTBACKS *******************************

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var payload = event.postback.payload.toLowerCase();

    switch (payload) {
        case 'greeting':
            handleGreeting(senderID);
            break;

        case 'cat':
        case 'cat pic':
        case 'cat photo':
            messages.sendCatMessage(senderID);
            break;

        case 'fact':
        case 'cat fact':
            messages.sendCatFactMessage(senderID);
            break;

        case 'share a cat':
            messages.sendShareMessage(senderID);
            break;

        case 'help':
        case 'need help':
        case 'i need help':
            messages.sendHelpMessage(senderID);
            break;

        default:
            messages.sendTextMessage(senderID, 'I am sorry, I do not understand this postback. Purrrr.....');
    }
}

function handleGreeting(senderID) {
    request({
        uri: 'https://graph.facebook.com/v2.6/' + senderID,
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
            console.log('BODY OBJECT: ', bodyObj);
            greeting = 'Oh herro ' + bodyObj.first_name + '! ';
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

        messages.sendGreetingMessage(messageData);
    })
}


// ***************************** MESSAGES *******************************

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
                messages.sendCatFactMessage(senderID);
                break;

            default:
                messages.sendTextMessage(senderID, 'I am sorry, I do not understand this message.');
        }
    } else if (messageAttachments) {
        console.log('************ IMAGE URL ***********************', messageAttachments[0].payload.url);

        if (messageAttachments[0].type === 'image') {
            postCatToDB(messageAttachments[0].payload.url, senderID);
        }
        // sendTextMessage(senderID, "Message with attachment received");
    }
}

function postCatToDB(url, recipientId) {
  request({
      uri: 'https://purrify.herokuapp.com/api/cats',
      method: 'POST',
      json: {
        uri: url
      }
  }, function (error, response, body) {
      var text = '';

      if (!error && response.statusCode === 201) {
          console.log('Successfully added image.');

          text = 'Thanks for the image!';

      } else {
          console.error("Unable to add image. ", error);

          text = 'Image not added.';

      }

      var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: text
        }
      }
      messages.sendPostCatMessage(messageData);
  });
}
