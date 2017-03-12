'use strict'

/* global process */

const request = require('request');

const persistentMenu = {
    setting_type: "call_to_actions",
    thread_state: "existing_thread",
    call_to_actions: [
        {
            type: "postback",
            title: "Give Me A Cat",
            payload: "Cat"
        }, {
            type: "postback",
            title: "Give Me A Cat Fact",
            payload: "Cat Fact"
        }, {
            type: "web_url",
            title: "View Website",
            url: "https://purrify.herokuapp.com/"
        }
    ]
}

request({
    uri: 'https://graph.facebook.com/v2.6/thread_settings',
    qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: persistentMenu
}, function (err, response) {
    if (err) {
        console.log(err);
    }
    console.log('finished');
});
