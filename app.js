var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
var botenv = process.env.BOT_ENV;
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s (%s)', server.name, server.url, botenv);
});

// Create chat bot
var connector = new builder.ChatConnector({
    // appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    // appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
    appId: "00a02aa7-0290-4e04-a61d-3c52dcff4673",
    appPassword: "pP2X72vVeVcsWaYSi3qR5oj"
}, function(){
    console.log("Complete making connector");
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    console.log("send Message");
    session.send("Hello World from " + botenv );
});