'use strict'
const builder = require('botbuilder');
const loger = require('./log.js');

// Create chat bot
var lib = new builder.Library('MultiDialog');

// rootDialogの定義
// rootはこのダイアログに遷移してきた時に、指定のパターンがマッチングしなかったとき
// 自動で呼び出されるダイアログ。
// ここで言うと、getNameとgetAge以外が指定された時
lib.dialog('/', [
    (session, args, next) => {
        // ユーザーへテキストを送信する
        session.send(`Hi there! I'm a sample bot showing how multiple dialogs work.`);
        session.send(`Let's start the first dialog, which will ask you your name.`);

        // getNameダイアログを開始する
        session.beginDialog('getName');
    },
    (session, results, next) => {

        // getNameダイアログの終了時に返信結果が登録されているはずなのでその存在をチェックしている
        if (results.response) {
            // 先のダイアログでは名前を取得しているのでそれを受け取っている
            // session.privateConversationDataは、ユーザー個人の情報を会話終了まで保持することが出来る領域
            // その他にもconversationDataなどもあるが、会話に参加している他ユーザーからも参照可能などスコープの違いがある
            // botbuilder\lib\botbuilder.d.ts:1686行目
            const name = session.privateConversationData.name = results.response;

            //getAgeを開始する この時に取得した名前を渡している
            session.beginDialog('getAge', { name: name });
        } else {
            // もしresponseが存在しなかったときは、何か問題があったということなので会話を終了しています
            session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
        }
    },
    (session, results, next) => {
        if (results.response) {
            // ここまでで収集したデータを集めて、それを使ってユーザーに応答している
            const age = session.privateConversationData.age = results.response;
            const name = session.privateConversationData.name;

            session.endConversation(`Hello ${name}. You are ${age}`);
        } else {
            session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
        }
    },
    // ダイアログを途中でキャンセルする為の定義
    // 第1引数：このアクションの名前を定義
    // 第2引数：キャンセルされた時にユーザーへその文字列が送信される
    // ※カレントダイアログが終了して親ダイアログに戻るが、親はそのまま再開されるので注意
]).cancelAction('cancelMultiDialog', "canceled", {
    // キャンセルのトリガーとなるパターンを定義
    matches: /^cancel/i,
    // キャンセルを再度確認する為にユーザーへ送信される文字列
    confirmPrompt: "Are you sure?",
    // テスト中
    onSelectAction: (session, args, next) => {
        session.send("test")
        next();
    }
});

// 名前を収集するためのダイアログ
lib.dialog('getName', [
    (session, args, next) => {
        if (args) {
            // 一度失敗していることを示すデータを取得
            session.dialogData.isReprompt = args.isReprompt;
        }
        // 名前を聞く
        builder.Prompts.text(session, 'What is your name?');
    },
    (session, results, next) => {
        // ユーザーからの返事を取得
        const name = results.response;

        // 名前として有効かどうかをチェックしている (ここでは長さのみ)
        if (!name || name.trim().length < 3) {
            // ある程度失敗すると終了させないと、正常な値をユーザーが入力するまで
            // いつまでも状態が変わらない事になり、UXが非常に悪くなってしまう。
            // それを回避する為に1度失敗しているならこのダイアログを終了させる
            if (session.dialogData.isReprompt) {
                session.endDialogWithResult({ response: '' });
            } else {
                // 初回入力時は期待する入力値をユーザーに伝える
                session.send('Sorry, name must be at least 3 characters.');

                // getNameをもう1度最初から実施する。
                // 1ど失敗したことを記録する為にisRepromptを渡している
                session.replaceDialog('getName', { isReprompt: true });
            }
        } else {
            // 正常に入力されたので名前を親のダイアログに引き継いで終了する
            session.endDialogWithResult({ response: name.trim() });
        }
    }
]);

// 年齢を取得するためのダイアログ
lib.dialog('getAge', [
    (session, args, next) => {
        let name = session.dialogData.name = 'User';

        if (args) {
            session.dialogData.isReprompt = args.isReprompt;

            // getNameで取得したデータは32行目で渡されており
            // argsに格納されているので取得する
            name = session.dialogData.name = args.name;
        }
        // 取得した名前を使用して年齢を聞く
        builder.Prompts.number(session, `How old are you, ${name}?`);
    },
    (session, results, next) => {
        // ユーザーからの返信を取得する
        const age = results.response;
        // 取得したデータが期待する値なのかを判定する
        if (!age || age < 13 || age > 90) {
            // 1度失敗しているかをチェック
            if (session.dialogData.isReprompt) {
                // 1度失敗しているときは終了(理由は79行目)
                session.endDialogWithResult({ response: '' });
            } else {
                // データに不備があったので再度問い合わせる
                session.dialogData.didReprompt = true;
                session.send(`Sorry, that doesn't look right.`);
                session.replaceDialog('getAge',
                    { name: session.dialogData.name, isReprompt: true });
            }
        } else {
            // 年齢を戻してダイアログを終了する
            session.endDialogWithResult({ response: age });
        }
    }
]);

// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};