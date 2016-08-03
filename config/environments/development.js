//var nconf = require('nconf');
////nconf.set('url', 'mywebsite.com');

//nconf.set('database', {
//    user: 'sa',
//    password: 'hrhk',
//    server: 'ADMIN\\SQLSERVER2012',
//    database: 'employee'
//});

var mysql = require('mssql');
exports.sql = mysql
 exports.dbConfig = {
    user: 'sa',
    password: 'hrhk',
    server: 'ADMIN\\SQLSERVER2012',
    database: 'nodeAPI_DB'
 };

