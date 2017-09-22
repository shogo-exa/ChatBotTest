'use strict'

var WebClient = require('@slack/client').WebClient;
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var log = require('./log');

var bot_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token);

let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        log.console("channel #" + c.name, c);
        if (c.is_member && c.name === 'general') { channel = c.id }
    }
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    // log.console("send to " + channel, "hello")
    // rtm.sendMessage("Hello!", channel);
});

rtm.on(RTM_EVENTS., (rtmData) => {
    log.console("channel_joined", rtmData);
});
rtm.on(RTM_EVENTS.USER_CHANGE, (rtmData) => {
    log.console("channel_joined", rtmData);
});
rtm.on(RTM_EVENTS.IM_CLOSE, (rtmData) => {
    log.console("im_close", rtmData);
});

rtm.start();