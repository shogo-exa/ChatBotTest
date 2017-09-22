'use strict'

var fs = require('fs');
var DATATYPE = {
    json: 'json',
    txt: 'txt'
}
const line = '\r\n*******************************************************\r\n';

class loger {
    constructor(){};
    outputFile (filename, logData) {
        fs.appendFile(filename, logData, 'utf8', (err) => {
            if (err != null) console.log(err);
        });
        fs.appendFile(filename, line, 'utf8', (err) => {
            if (err != null) console.log(err);
        });
    }
    outputConsole (name, logData) {
        console.log("\r\n********************* " + name + " *********************\r\n");
        console.log(logData);
        console.log("\r\n******************************************");
    }
    log (name, data) {
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
            outputFile(name + '.json', logData);
        } else {
            outputConsole(name, logData);
        }
    }
}

module.exports = new loger();
