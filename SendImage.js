const builder = require('botbuilder');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const loger = require('./log.js');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
});
// Create chat bot
var lib = new builder.Library('sendImage');
lib.dialog('/', [
    (session, args, next) => {
        loger.console('image.js', 'step 1');

        var msg = session.message;
        session.endConversation({
            text: "My Company:",
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: "https://prtimes.jp/i/1318/148/resize/d1318-148-118221-1.jpg",
                    name: "exa_logo"
                }
            ]
        });

    }
]);

// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};