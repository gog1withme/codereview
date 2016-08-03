
var nconf = require('nconf');

var db = {}
var development = require('../../config/environments/' + nconf.get('NODE_ENV'));
var conn = new development.sql.Connection(development.dbConfig);


//This function is use to get data.
db.sqlConnection = function (sqlQuery, param, callback) {
    console.log(sqlQuery);
    conn = new development.sql.Connection(development.dbConfig)
    conn.connect().then(function () {
        var req = new development.sql.Request(conn);

        req.query(sqlQuery, function (err, recordset, _affectedrows) {            
            console.log("_affectedrows:", _affectedrows);
            if (err) {
                callback(err);
            } else {               
                callback(err, recordset, _affectedrows);
            }
            conn.close();
        })

    })
}



//Extra code
//db.insertIntoTable = function (sqlQuery, param, callback) {   
//    conn = new development.sql.Connection(development.dbConfig)
//    conn.connect().then(function () {
//        var req = new development.sql.Request(conn);

//        var s = req.query(sqlQuery, function (err, recordsets, affectedRows) {          
//            conn.close();
//            if (!err) {
//                callback(err,affectedRows);
//            }
//            else {
//                callback(err);
//            }
//        });
//    }).catch(function (err) {
//        conn.close();
//        console.log("error from db : ", err);
//        callback(err);
//    })
//}


module.exports = db

