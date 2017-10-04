// RESTful Webサービスを構築するためのNode.js用フレームワーク
// Botの受け口を作成する為に使用している
var restify = require('restify');

// MBF用のボットを作成する為のフレームワーク
var builder = require('botbuilder');

// チャットデータ(json)を出力させるために作成した簡易ロガー
const loger = require('./log.js');

/********** Server セットアップ **********/
//restifyを使用してRESTの口を作成している
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s (%s)', server.name, server.url);
});

// MBFPortalへの接続用コネクタを生成
var connector = new builder.ChatConnector({
    // サーバーの環境変数より、値を取得する
    appId: process.env.MICROSOFT_APP_ID,  // MBFPortalに作成したボットのID
    appPassword: process.env.MICROSOFT_APP_PASSWORD // MBFPortalに作成したボットのPassword
});

// 第1引数のURLに飛んできたPOSTリクエストはMBFのコネクタへ渡るように設定
server.post('/', connector.listen()); // 例：https://xxx.co.jp/
// server.post('/message/api', connector.listen()); 例：https://xxx.co.jp/message/api


/*********** Bot セットアップ ***********/
// 第1引数:MBFPortalと接続するためのコネクタ
// 第2引数:最初のメッセージをボットが受け取った時の処理の流れを定義する
//        関数のリストを渡すことで、チャットの1往復ごとにリストの先頭から順番に実行される
var bot = module.exports = new builder.UniversalBot(connector, [

    // 最初のメッセージを受け取ると、以下の関数が実行される
    // 実行する機能サンプルを選択させる為のボタンを作成している
    // ヒーローカードを使用している
    (session, args, next) => {
        loger.log('start', session.message);
        // 返信する為のデータを作成する
        var chatData = new builder.Message(session);
        // 表示するときのレイアウトを設定する
        chatData.attachmentLayout(builder.AttachmentLayout.carousel);
        // データの中身を定義する 以下では、ヒーローカードのみ設定している
        chatData.attachments([
            new builder.HeroCard(session)
                .title('機能選択')
                .text('どのサンプルを実行しますか')
                .buttons([
                    // 第1引数はボタンをクリックした時にボットへ送信される文字列
                    //   アプリによってはユーザーの発言としてチャット欄に表示される
                    // 第2引数はボタンのタイトル
                    builder.CardAction.imBack(session, 'MultiDialog', '対話'),
                    builder.CardAction.imBack(session, 'HeroCard', 'ヒーローカード'),
                    builder.CardAction.imBack(session, 'SigninCard', 'サインインカード'),
                    builder.CardAction.imBack(session, 'Image', '画像')
                ])
        ]);
        // 次のユーザーのメッセージはテキストに限定させる
        // .number や .timeなども存在する(botbuilder\lib\botbuilder.d.ts:3349行目)
        // ユーザーが以下で指定したもの以外のデータを入力すると、
        // 目的のデータを入力するようにボットが自動で返信する
        // 自動返信の文字列定義場所 (botbuilder\lib\locale\en\BotBuilder.json)
        builder.Prompts.text(session, chatData);
    },
    // 2回目のチャットが飛んできた時に以下の関数が実行される
    (session, res, next) => {
        // ユーザーが返信した内容が以下に入っている
        const userSelect = res.response;
        loger.console('app.js', 'step 2  ' + userSelect);
        // ユーザーの応答によって実行する機能を切り分けている
        switch (userSelect) {
            case 'MultiDialog':
                // 定義されているダイアログに処理を移行する
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
                // 現在のダイアログを終了して引数に渡したダイアログを新たに実行する
                // ここでは上の関数に戻っている
                session.replaceDialog('/');

        }
    }
]);
// 別のjsファイルに定義したDialogを読み込んでいる
// requireはnode.jsで定義されている関数 引数には読み込むjsファイルへの相対パスを記述している
bot.library(require('./Cards').createLibrary());
bot.library(require('./MultiDialog').createLibrary());
bot.library(require('./SendImage').createLibrary());

// チャットルームに人が入退室する等すると送られてくるイベントをキャッチしている
// 以下では挨拶しているだけ
bot.on('conversationUpdate', function (message) {
    loger.log("conversationUpdate", message)

    // メンバーが追加されたときの処理
    if (message.membersAdded) {
        loger.log("join Member", message);
        // 参加してきた人の名前をすべて取得する
        var membersAdded = message.membersAdded
            .map((m) => {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name);
            })
            .join(', ');

        loger.log("joinReply", bot)
        var reply = new builder.Message()
            .address(message.address)
            .text('いらっしゃいませー ' + membersAdded + ' さん');
        bot.send(reply);
    }
    // メンバーが退出した時の処理
    if (message.membersRemoved) {
        loger.log("Leave Member", message);
        // 離脱した人の名前をすべて取得する
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