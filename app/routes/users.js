/// <reference path="../../config/environments/development.js" />
/// <reference path="../../config/environments/development.js" />
// app/routes/users.js
var jwt = require('jwt-simple');
var async = require('async');
var logger = require('winston');
var fs = require('file-system');


///google drive code
var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;
var readline = require('readline');
var FileReader = require('filereader')

var CLIENT_ID = '946874665854-24t4mhofom0otgmbkc7nqpps8qsgaqu2.apps.googleusercontent.com',
    CLIENT_SECRET = '-Vkt11QAmjKTSO2hKbHcHaow',
    REDIRECT_URL = 'http://localhost:50912',
    SCOPE = 'https://www.googleapis.com/auth/drive.file';

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var drive = googleapis.drive({ version: 'v2', auth: oauth2Client });

//End of google drive

module.exports = function (router, app) {
    'use strict';


    var io = require('socket.io').listen(app.listen('3000'));
    var client = require('socket.io-client');

    io.sockets.on('connection', function (socket) {
        console.log("user connected");
        socket.on('send', function (data) {
            console.log("client says : ", data);
            io.emit('message', data);
        });
    });
    io.sockets.on('connect', function () {
        console.log("Connection setup ");
    });


    var userModel = require('../models/user');

    //signup
    router.route('/signup/')
      .post(function (req, res) {
          if (!req.body.name || !req.body.password || !req.body.email) {
              res.json({ success: false, msg: 'Please pass name and password with email.' });
          } else {
              var newUser = {
                  name: req.body.name,
                  password: req.body.password,
                  email: req.body.email
              };
              // save the user
              userModel.addUser(newUser, function (responce) {
                  console.log("data from signup function :  ", responce);
                  res.send(responce);
              })
          }
      });

    //login
    router.route('/login/')
      .post(function (req, res) {



          if (!req.body.email || !req.body.password) {
              res.json({ success: false, msg: 'Please pass email and password.' });
          } else {
              var user = {
                  password: req.body.password,
                  email: req.body.email
              };
              // loginUser
              userModel.loginUser(user, function (responce) {
                  console.log("data from login function :  ", responce);
                  res.send(responce);
              })
          }
      });



    //Google Drive code

    router.route('/auth/')
  .get(function (req, res) {
      var execute = function (err, client) {
          var url = oauth2Client.generateAuthUrl({ scope: SCOPE });
          console.log('Visit the url: ', url);
          res.json({ success: true, msg: 'Auth function called', visit: url });
      };
      execute();
  })

    router.route('/gettoken/')
       .post(function (req, res) {
           console.log("Token code from clident", req.body.code);
           var code = req.body.code;
           oauth2Client.getToken(code, function (err, tokens) {
               if (err) {
                   console.log('Error while trying to retrieve access token', err);
                   return;
               }
               console.log("Token to client : ", tokens);
               res.json({ success: true, token: tokens });
           });
       })

    router.route('/file/')
    .post(function (req, res) {
        var tokens = req.body.token;
        var filename = req.body.filename;
        var filetext = req.body.filetext;
        oauth2Client.credentials = tokens;
        ///upload file
        var drive = googleapis.drive({ version: 'v3', auth: oauth2Client });
        if (!drive) {
            res.json({ success: true, msg: 'authentication error' });
        }
        drive.files.create({
            resource: {
                name: filename + ".txt",
                mimeType: 'text/plain'
            },
            media: {
                mimeType: 'text/plain',
                body: filetext
            }
        });

        //
        ////!--Spread sheet code
        //var fileMetadata = {
        //    'name': 'My Report',
        //    'mimeType': 'application/vnd.google-apps.spreadsheet'
        //};
        //var media = {
        //    mimeType: 'text/csv',
        //    body: fs.createReadStream("./images/Text")
        //};
        //drive.files.create({
        //    resource: fileMetadata,
        //    media: media,
        //    fields: 'id'
        //}, function (err, file) {
        //    if (err) {
        //        // Handle error
        //        console.log(err);
        //    } else {
        //        console.log('File Id:', file.id);
        //    }
        //});

        //
        res.json({ success: true, msg: 'File created' });

    })

    router.route('/uploadimage/')
  .post(function (req, res) {
      var tokens = req.body.token;
      var filename = req.body.filename;
      var image = req.body.img;
      oauth2Client.credentials = tokens;
      ///upload file
      var drive = googleapis.drive({ version: 'v3', auth: oauth2Client });
      if (!drive) {
          res.json({ success: true, msg: 'authentication error' });
      }

      //decodeBase64Image
      function decodeBase64Image(dataString) {
          var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          var response = {};

          if (matches.length !== 3) {
              return new Error('Invalid input string');
          }

          response.type = matches[1];
          response.data = new Buffer(matches[2], 'base64');

          return response;
      }
      ///////////////
      var imageTypeRegularExpression = /\/(.*?)$/;
      var imageBuffer = decodeBase64Image(image);
      var imageTypeDetected = imageBuffer.type.match(imageTypeRegularExpression);
      var imgName = filename + '.' + imageTypeDetected[1];

      drive.files.create({
          resource: {
              name: imgName,
              mimeType: 'image/png'
          },
          media: {
              mimeType: 'image/png',
              body: imageBuffer.data// read streams are awesome!
          }
      });

      res.json({ success: true, msg: 'Image Uploaded' });

  })

    router.route('/loadfiles/')
  .post(function (req, res) {
      var tokens = req.body.token;
      var filesUrl = [];
      ////////////////////
      function listFiles(auth) {
          console.log("inside auth");
          oauth2Client.credentials = tokens;
          var service = googleapis.drive('v3');
          service.files.list({
              auth: oauth2Client,
              pageSize: 10,
              fields: "nextPageToken, files(id, name)"
          }, function (err, response) {
              if (err) {
                  console.log('The API returned an error: ' + err);
                  return;
              }
              var files = response.files;
              if (files.length == 0) {
                  console.log('No files found.');
              } else {
                  console.log('Files:');
                  for (var i = 0; i < files.length; i++) {
                      var file1 = fs.createWriteStream("./images/" + files[i].name);
                      filesUrl.push(files[i].name);
                      file1.on("finish", function () {
                          console.log("downloaded 1 file");
                      });

                      // Download file
                      drive.files.get({
                          auth: oauth2Client,
                          fileId: files[i].id,
                          alt: "media"
                      }).pipe(file1);
                  }


                  res.json({ success: true, msg: 'Google Drive Files', files: files, url: filesUrl });
              }
          });
      }
      listFiles(tokens);
      //////////////////

  })


    router.route('/getfilebyid/')
  .post(function (req, res) {
      var tokens = req.body.token;
      var fileId = req.body.fileid;

      console.log("inside getfile");
      oauth2Client.credentials = tokens;

     
   
      res.json({ success: true, msg: 'File id'+fileId  });
   

  })

    //End Of google drive



















    //Dummy Operations

    // This will handle the url calls for /users/:user_id
    router.route('/:userId')
      .delete(function (req, res, next) {
          // Delete record
          var userId = req.params.userId;
          userModel.deleteUser(userId, function (responce) {
              console.log("data from paramsURI delete function :  ", responce);
              res.send(responce);
          })
      })

      .put(function (req, res, next) {
          var userId = req.params.userId;
          var userName = req.body.name;
          // update record
          userModel.updateUser(userId, userName, function (responce) {
              console.log("data from paramsURI update function :  ", responce);
              res.send(responce);
          })
      })

      .get(function (req, res, next) {
          var token = req.headers.authorization;
          var email = req.params.userId;
          userModel.getUserName(email, token, function (responce) {
              res.send(responce);
          })
          // Logic for GET /users routes
      })

    // This will handle the url calls for /users/
    router.route('/exp')
     .get(function (req, res, next) {
         userModel.getUser(function (responce) {
             console.log("data from default get function :  ", responce);
             res.send(responce);
         })
         // Logic for GET /users routes
     })
     .put(function (req, res, next) {
         // Update user
         var userName = req.body.name;
         userModel.addEmp(userName, function (responce) {
             console.log("data from default put function :  ", responce);
             res.send("inserted record : " + responce);
         })
     });

    router.route('/')
       .get(function (req, res, next) {
           var email = req.body.username;
           userModel.getUserName(email, function (responce) {
               console.log("data from default get function :  ", responce);
               res.send(responce);
           })
           // Logic for GET /users routes
       });

};





