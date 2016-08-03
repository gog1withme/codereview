// app/models/user.js
// INITILIAZE your model here
// var User =  new Model()

var nconf = require('nconf');
var db = require('../core/db');
var jwt = require('jwt-simple');
//var development = require('../../config/environments/' + nconf.get('NODE_ENV'));
//var conn = new development.sql.Connection(development.dbConfig);

module.exports = {

    connOpen: function () {
        conn = new development.sql.Connection(development.dbConfig);
    },

    addUser: function (newUser, callback) {
        db.sqlConnection("insert into users (Name, Email, Password, Token) values ('" + newUser.name + "','" + newUser.email + "','" + newUser.password + "','')", "", function (err, rows, _affectedRows) {
            if (err) {
                callback({ success: false, msg: 'User with same Email-Id Already exist.', err: err, result: _affectedRows });
            }
            else {
                callback({ success: true, msg: 'User Created.', result: _affectedRows });
            }
        })
    },

    loginUser: function (user, callback1) {
        /////////////////////

        getToken(user.email, user.password, 'user', function (callback) {
            var token = callback.token;
            console.log("callback : ", token);
            if (callback) {
                db.sqlConnection("update users set Token ='" + token + "'  where Email = '" + user.email + "' and Password='" + user.password + "'", "", function (err, rows, _affectedRows) {
                    if (_affectedRows) {
                        callback1({ success: true, token: token });
                    }
                    else {
                        callback1({ success: false, msg: "Email id or password is wrong." });
                    }
                })
            }

        });

        ////////////////////        

    },

    getUserName: function (email, token, callback) {
        var token = token;
        isTokenValid(token, function (isValid) {
            if(isValid)
            {
                db.sqlConnection("SELECT name FROM users where email='" + email + "' and token = '"+token+"'", '', function (err, rows, _affectedRows) {
                    console.log("select command : ", rows);
                    if (err) {
                        callback("error :" + err);
                    } else {
                        callback(rows);
                    }
                })
            }
        })
    },





    //Dummy Operations:

    //getUser function use to retriev all data from Emp_Designation
    getUser: function (callback) {

        db.sqlConnection('SELECT * FROM Emp_Designation', '', function (err, rows, _affectedRows) {
            if (err) {
                callback("error :" + err);
            } else {
                callback(rows);
            }
        })
    },

    addEmp: function (userName, callback) {
        db.insertIntoTable("Insert into Emp_Designation (Name) values ('" + userName + "')", '', function (err, result) {
            if (err) {
                callback(err);
            }
            callback(result);

        })
    },

    deleteUser: function (userId, callback) {
        db.sqlConnection("delete from Emp_Designation where id = " + userId, '', function (err, result) {
            if (err) {
                callback(err);
            }
            callback("record deleted");

        })
    },

    updateUser: function (userId, userName, callback) {
        db.sqlConnection("update Emp_Designation set name ='" + userName + "'  where id = " + userId, '', function (err, rows, _affectedRows) {
            if (err) {
                callback(err);
            }
            callback("affected rows : " + _affectedRows);
        })
    },

}

//////Token based authentication
function getToken(Email, Password, role, callback) {
    var dbUserObj = {
        email: Email,
        role: role,
        username: Password
    };
    var token = genToken(dbUserObj, callback);
    return token;
}
// private method
function genToken(user, callback) {
    console.log("inside get token");
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('./config/secret.js')());

    callback({
        token: token,
        expires: expires,
        user: user
    });
}

function expiresIn(numDays) {
    console.log("inside expiresIn");
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

function decodeToken(token) {
    var decoded = jwt.decode(token, require('./config/secret.js')());
    if (decoded.exp <= Date.now()) {
        return false;
    }
    return decoded;

}

function isTokenValid(token,isToken){     
    isToken(decodeToken(token));    
}

