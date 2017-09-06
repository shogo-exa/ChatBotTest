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
    appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
});
var bot = new builder.UniversalBot(connector);

// ボットがメッセージとして受け取るURL
server.post('/', connector.listen()); // 例：https://xxx.co.jp/
// server.post('/message/api', connector.listen()); 例：https://xxx.co.jp/message/api

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    var str = {
  "type": "message",
  "attachmentLayout": "list",
  "text": "",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.hero",
      "content": {
        "text": "What kind of sandwich would you like on your sandwich? ",
        "buttons": [
          {
            "type": "imBack",
            "title": "BLT",
            "value": "1"
          },
          {
            "type": "imBack",
            "title": "Black Forest Ham",
            "value": "2"
          },
          {
            "type": "imBack",
            "title": "Buffalo Chicken",
            "value": "3"
          }
        ]
      }
    }
  ]
}
    session.send(str);
});