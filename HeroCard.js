const builder = require('botbuilder');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const loger = require('./log.js');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,  // 環境変数より取得する
    appPassword: process.env.MICROSOFT_APP_PASSWORD // 環境変数より取得する
});
//=========================================================
// Conversation Setup
//=========================================================
var conversation = new ConversationV1({
    username: process.env.CONVERSATION_NAME,
    password: process.env.CONVERSATION_PASS,
    version_date: ConversationV1.VERSION_DATE_2017_05_26
});


// Create chat bot
var bot = module.exports = new builder.UniversalBot(connector);
bot.dialog('/', (session) => {
    var reqJson = {
        input: { text: session.message.text },
        workspace_id: process.env.CONVERSATION_WORKSPACE,
        context: session.privateConversationData.context
    };
    loger.log('session', session);

    // conversationへメッセージを送信する
    conversation.message(reqJson, (err, response) => {
        if (err) {
            console.error("************** V1message error ***************")
            console.error(err);
            console.error("**********************************************")
        } else {
            session.privateConversationData.context = response.context;

            // conversationからの応答をファイルに出力する
            var chatData = makeChatData(response, session);
            session.send(chatData);
        }
    });
});

// conversation の現在の状態に応じて応答データを作成する
function makeChatData(response, session) {
    var chatData = new builder.Message(session);
    switch (response.context.system.dialog_stack[0].dialog_node) {
        // かける音楽のジャンルをユーザーに問いかける
        case "Music Appliance Check":
            chatData.attachmentLayout(builder.AttachmentLayout.carousel);
            chatData.attachments([
                new builder.HeroCard(session)
                    .title('Music select')
                    .subtitle('genre')
                    .text(response.output.text[0])
                    .buttons([
                        builder.CardAction.imBack(session, 'Rock', 'Rock'),
                        builder.CardAction.imBack(session, 'J-Pop', 'J-Pop'),
                        builder.CardAction.imBack(session, 'Jazz', 'Jazz')
                    ])
            ]);
            break;

        // 食事のジャンルをユーザーに問いかける
        case "node_14_1467234311677":
            chatData.attachmentLayout(builder.AttachmentLayout.carousel);
            chatData.attachments([
                new builder.HeroCard(session)
                    .title('Music select')
                    .subtitle('genre')
                    .text(response.output.text[0])
                    .buttons([
                        builder.CardAction.imBack(session, 'tacos', 'tacos'),
                        builder.CardAction.imBack(session, 'burgers', 'burgers'),
                        builder.CardAction.imBack(session, 'seafood', 'seafood'),
                        builder.CardAction.imBack(session, 'pasta', 'pasta')
                    ])
            ]);
            break;

        // conversation の応答をそのままユーザーに返す
        default:
            chatData = response.output.text;
            break;

    }
    return chatData;
}