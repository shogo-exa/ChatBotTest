const builder = require('botbuilder');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const loger = require('./log.js');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
});
// Create chat bot
var bot = module.exports = new builder.UniversalBot(connector, [
    (session, args, next) => {
        var chatData = new builder.Message(session);
        chatData.attachmentLayout(builder.AttachmentLayout.carousel);
        chatData.attachments([
            new builder.HeroCard(session)
                .title('Image Select')
                .text("What kind of AI do you like?")
                .buttons([
                    builder.CardAction.imBack(session, 'Watson', 'Watson'),
                    builder.CardAction.imBack(session, 'siri', 'siri'),
                    builder.CardAction.imBack(session, 'Cortana', 'Cortana')
                ])
        ]);
        session.send(chatData);
        session.beginDialog('selectAI', { ai: ai });
    }
]);
bot.dialog('selectAI', (session) => {
    const ai = session.message;
    var chatData = new builder.Message(session);
    switch (ai) {
        case 'Watson':
            break;

        case 'siri':
            break;

        case 'Cortana':
            break;
    }
});
