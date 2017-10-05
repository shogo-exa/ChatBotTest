const builder = require('botbuilder');
const loger = require('./log.js');

// カード機能を実行する為のライブラリを定義している
// 以下のメソッドで渡されている文字列が、呼び出すときの「:」以前の文字列になる
//    session.beginDialog('Cards:/');
var lib = new builder.Library('Cards');

// 以下でそのライブラリが持っているダイアログ(会話の流れ)を定義する
// 第1引数が、呼び出すときの「:」以降の文字列になる
//    session.beginDialog('Cards:/');
// 第2引数は会話の一つ一つを関数に定義をして、そのリストを渡す
//  渡されたリストの先頭から順に実行される
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
                // 現在のダイアログを終了して引数に渡したダイアログを新たに実行する
                // ここでは上の関数に戻っている
                session.replaceDialog('/');
        }
    },
]);
// ヒーローカードのサンプルをユーザーに送信している
lib.dialog('Hero', (session) => {
    var chatData = new builder.Message(session);
    chatData.attachmentLayout(builder.AttachmentLayout.carousel);
    chatData.attachments([
        new builder.HeroCard(session)
            .title('ジャンル選択')
            .subtitle('音楽')
            .text('どのジャンルが好きですか？')
            .buttons([
                // 第2引数はボタンをクリックした時にボットへ送信される文字列
                //   アプリによってはユーザーの発言としてチャット欄に表示される
                // 第3引数はボタンのタイトル
                builder.CardAction.imBack(session, 'Rock', 'Rock'),
                builder.CardAction.imBack(session, 'J-Pop', 'J-Pop'),
                builder.CardAction.imBack(session, 'Jazz', 'Jazz')
            ])
    ]);
    // ユーザーにチャットを送信して、会話を完全に終了させる
    session.endConversation(chatData);
});

// サインインカードのサンプルをユーザーに送信している
lib.dialog('Signin', (session) => {
    var chatData = new builder.Message(session);
    chatData.attachmentLayout(builder.AttachmentLayout.carousel);
    chatData.attachments([
        new builder.SigninCard(session)
            .text('Googleへサインインしてください')
            // 第1引数は表示される文字列, 第2引数はその文字列に付与されているリンクのアドレス
            .button('サインイン', 'https://accounts.google.com/ServiceLogin')
    ]);
    session.endConversation(chatData);

});

// ボット本体が定義されているファイル(このサンプルではapp.js)でこのライブラリを使用出来るように
// エクスポートしている
module.exports.createLibrary = function () {
    return lib.clone();
};