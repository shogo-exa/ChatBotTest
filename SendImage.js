const builder = require('botbuilder');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const loger = require('./log.js');

// Create chat bot
var lib = new builder.Library('sendImage');
lib.dialog('/', [
    (session, args, next) => {
        // 画像を送信する処理
        session.endDialog({
            text: "My Company:",
            attachments: [
                {// 画像の情報を入力している
                    contentType: "image/jpeg",
                    contentUrl: "https://prtimes.jp/i/1318/148/resize/d1318-148-118221-1.jpg",
                    name: "exa_logo"
                },
                {// テキストと、そのテキストのリンク先を設定している
                    contentType: "text/plain",
                    contentUrl: "http://www.exa-corp.co.jp",
                    name: "webサイトはこちら"
                }
            ]
        });

    }
]);

// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};