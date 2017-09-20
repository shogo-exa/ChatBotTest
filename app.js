var restify = require('restify');
const cardBot = require('./HeroCard.js');
const mltDialogBot = require('./MultiDialog.js');
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

// ボットがメッセージとして受け取るURL
server.post('/card', cardBot.connector('*').listen()); // 例：https://xxx.co.jp/card
server.post('/multi', mltDialogBot.connector('*').listen()); // 例：https://xxx.co.jp/multi
server.post('/', connector.listen()); // 例：https://xxx.co.jp/multi
// server.post('/message/api', connector.listen()); 例：https://xxx.co.jp/message/api

var bot = module.exports = new builder.UniversalBot(connector);
bot.dialog('/', (session) => {
    loger.log('session',session);
    session.send(session.message);
});