var changeCase = require('change-case');
var express = require('express');
var routes = require('require-dir')();


module.exports = function(app) {
  'use strict';
 
  // Initialize all routes
  Object.keys(routes).forEach(function(routeName) {
    var router = express.Router();
    // You can add some middleware here 
      // router.use(someMiddleware);
    app.all('*', function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
        res.setHeader('Access-Control-Max-Age', '1000');
        next();
    });
  
    var auth = function (req, res, next)
    {
        if (!req.isAuthenticated())
            res.send(401);
        else
            next();
    };
    // Initialize the route to add its functionality to router
    require('./' + routeName)(router,app);
    console.log("router: ", routeName);
      // Add router to the speficied route name in the app
   
    app.use('/' + changeCase.paramCase(routeName), router);  

  }); 
};

