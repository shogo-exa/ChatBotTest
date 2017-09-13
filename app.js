var restify = require('restify');
var builder = require('botbuilder');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

/********* logger sertup ***********/
var fs = require('fs');
function log(filename, data) {
    fs.appendFile(filename, data, 'utf8', (err) => {
        if (err != null) console.log(err);
    });
}

//=========================================================
// Conversation Setup
//=========================================================
var conversation = new ConversationV1({
    username: process.env.CONVERSATION_NAME,
    password: process.env.CONVERSATION_PASS,
    version_date: ConversationV1.VERSION_DATE_2017_05_26
});


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
var context = null;
bot.dialog('/', (session) => {
    var reqJson = {
        input: { text: session.message.text },
        workspace_id: process.env.CONVERSATION_WORKSPACE,
        context: context
    };
    var reqData = JSON.stringify(reqJson, null, '    ');
    log('V1Request.json', reqData);
    conversation.message(reqJson, (err, response) => {
        if (err) {
            console.error("************** V1message error ***************")
            console.error(err);
            console.error("**********************************************")
        } else {
            context = response.context;

            // conversationからの応答をファイルに出力する
            var rData = JSON.stringify(response, null, '    ');
            log('V1response.json', rData);
            // クライアントに応答結果を送信する
            var chatData = makeChatData(response);
            session.send(chatData);
        }
    });
});

function makeChatData(response) {
    var chatData = {
        "type": "message",
        "attachmentLayout": "list",
        "text": "",
        "attachments": [
            {
                "contentType": "",
                "content": {
                    "text": "",
                    "buttons": ""
                }
            }
        ]
    }
    switch (response.context.system.dialog_stack[0].dialog_node) {
        case "root":
            chatData = response.output.text;
            break;
        case "Music Appliance Check":
            chatData.attachments[0].contentType = "application/vnd.microsoft.card.hero";
            chatData.attachments[0].content.text = response.output.text;
            chatData.attachments[0].content.buttons = [
                {
                    "type": "imBack",
                    "title": "Rock",
                    "value": "Rock"
                },
                {
                    "type": "imBack",
                    "title": "POP",
                    "value": "POP"
                },
                {
                    "type": "imBack",
                    "title": "classic",
                    "value": "classic"
                }
            ]
            break;
    }
    return chatData;
}