var fs = require('fs');
var DATATYPE = {
    json: 'json',
    txt: 'txt'
}
const line = '\r\n*******************************************************\r\n'

module.exports = {
    log: function (filename, data) {
        var logData;
        var dataType;
        try {
            logData = JSON.stringify(data, undefined, 4);
            dataType = DATATYPE.json;
        } catch (e) {
            if (e instanceof TypeError) {
                logData = data;
                dataType = DATATYPE.txt;
            }
        }
        if (process.env.BOT_ENV == "local" && dataType == DATATYPE.json) {
            fs.appendFile(filename + '.json', logData, 'utf8', (err) => {
                if (err != null) console.log(err);
            });
            fs.appendFile(filename + '.json', line, 'utf8', (err) => {
                if (err != null) console.log(err);
            });
        } else {
            console.log("\r\n*********************" + filename + "*********************\r\n");
            console.log(logData);
            console.log("\r\n******************************************");
        }
    }
}
