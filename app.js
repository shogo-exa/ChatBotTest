var restify = require('restify');
var builder = require('botbuilder');
const loger = require('./log.js');

//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
var botenv = process.env.BOT_ENV;
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s (%s)', server.name, server.url, botenv);
});
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
});

// ボットがメッセージを受け取るURL
server.post('/', connector.listen()); // 例：https://xxx.co.jp/
// server.post('/message/api', connector.listen()); 例：https://xxx.co.jp/message/api

var bot = module.exports = new builder.UniversalBot(connector, [
    (session, args, next) => {
        loger.console('app.js', 'step 1');
        var chatData = new builder.Message(session);
        chatData.attachmentLayout(builder.AttachmentLayout.carousel);
        chatData.attachments([
            new builder.HeroCard(session)
                .title('機能選択')
                .subtitle('ヒーローカード')
                .text('どのサンプルを実行しますか')
                .buttons([
                    builder.CardAction.imBack(session, 'MultiDialog', '対話'),
                    builder.CardAction.imBack(session, 'HeroCard', 'ヒーローカード'),
                    builder.CardAction.imBack(session, 'SigninCard', 'サインインカード'),
                    builder.CardAction.imBack(session, 'Image', '画像')
                ])
        ]);
        builder.Prompts.text(session, chatData);
    },
    (session, res, next) => {
        const userSelect = res.response;
        loger.console('app.js', 'step 2  ' + userSelect);
        switch (userSelect) {
            case 'MultiDialog':
                session.beginDialog('MultiDialog:/')
                break;

            case 'HeroCard':
                session.beginDialog('Cards:Hero');
                break;

            case 'SigninCard':
                session.beginDialog('Cards:Signin');
                break;

            case 'Image':
                session.beginDialog('sendImage:/');
                break;

            default:
                session.replaceDialog('/');

        }
    },
]);
bot.library(require('./Cards').createLibrary());
bot.library(require('./MultiDialog').createLibrary());
bot.library(require('./SendImage').createLibrary());


bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        loger.log("join Member", message);
        var membersAdded = message.membersAdded
            .map((m) => {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name);
            })
            .join(', ');

        var reply = new builder.Message()
            .address(message.address)
            .text('いらっしゃいませー ' + membersAdded + ' さん');
        bot.send(reply);
    }
    if (message.membersRemoved) {
        loger.log("join Member", message);
        var membersRemoved = message.membersRemoved
            .map((m) => {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name);
            })
            .join(', ');
        var reply = new builder.Message()
            .address(message.address)
            .text('ばいばーい' + membersRemoved);
        bot.send(reply);
    }
});