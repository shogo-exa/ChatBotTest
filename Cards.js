const builder = require('botbuilder');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const loger = require('./log.js');

//=========================================================
// Conversation Setup
//=========================================================
// Create chat bot
var lib = new builder.Library('Cards');
lib.dialog('/', [
    (session, args, next) => {
        loger.console('cards.js', 'step 1');
        var chatData = '表示するカードの種類を記入してください(Hero, Signin)'
        builder.Prompts.text(session, chatData);
    },
    (session, res, next) => {
        const userSelect = res.response;
        loger.console('cards.js', 'step 2  ' + userSelect);
        switch (userSelect) {
            case 'Hero':
                session.beginDialog('HeroCard');
                break;

            case 'Signin':
                session.beginDialog('SigninCard');
                break;

            default:
                session.replaceDialog('/');
        }
    },
]);
lib.dialog('Hero', (session) => {
    var chatData = new builder.Message(session);
    chatData.attachmentLayout(builder.AttachmentLayout.carousel);
    chatData.attachments([
        new builder.HeroCard(session)
            .title('ジャンル選択')
            .subtitle('音楽')
            .text('どのジャンルが好きですか？')
            .buttons([
                builder.CardAction.imBack(session, 'Rock', 'Rock'),
                builder.CardAction.imBack(session, 'J-Pop', 'J-Pop'),
                builder.CardAction.imBack(session, 'Jazz', 'Jazz')
            ])
    ]);
    session.endConversation(chatData);
});

lib.dialog('Signin', (session) => {
    var chatData = new builder.Message(session);
    chatData.attachmentLayout(builder.AttachmentLayout.carousel);
    chatData.attachments([
        new builder.SigninCard(session)
            .text('Googleへサインインしてください')
            .button('サインイン', 'https://accounts.google.com/ServiceLogin')
    ]);
    session.endConversation(chatData);

});
// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};