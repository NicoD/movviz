'use strict';

var userModelFactory = require('../model/user'),
    customlistModelFactory = require('../model/customlist'),
  mydb = require('../db'),
  authMiddleware = require('../middleware/auth.js'),
  request = require('request'),
  jwt = require('jwt-simple'),
  path = require('path'),
  yaml = require('js-yaml'),
  fs = require('fs'),
  moment = require('moment');



/**
 * create a JSON web token
 * @param {Object}
 * @return {string}
 */
function createJWT(user, token) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, token);
}


module.exports = function(app) {


  app.get('/api/profile', authMiddleware, function(req, res) {
    mydb.connect(function(err, conn) {
      if(err) {
        throw err;
      }
      var UserModel = userModelFactory.create(conn);
      UserModel.findById(req.user, function(err, user) {
        res.send(user);
      });
    });

  });


  var configFile = path.dirname(require.main.filename) + '/config/auth.yaml';
  fs.readFile(configFile, function(err, data) {
    if(err) {
      throw err;
    }
    var config = yaml.safeLoad(data);

    app.post('/auth/google', function(req, res) {

      var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
      var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
      var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: config.GOOGLE_SECRET,
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
      };


      // 1: Exchange authorization code for access token
      request.post(accessTokenUrl, {
        json: true,
        form: params
      }, function(err, response, token) {
        if(err) {
          throw err;
        }

        var accessToken = token.access_token;
        var headers = {
          Authorization: 'Bearer ' + accessToken
        };

        //2: Retrieve profile information about the current user
        request.get({
          url: peopleApiUrl,
          headers: headers,
          json: true
        }, function(err, response, profile) {

          mydb.connect(function(err, conn) {
            if(err) {
              throw err;
            }

            var UserModel = userModelFactory.create(conn);
            // 3a: Link user accounts
            if(req.headers.authorization) {
              UserModel.findOne({
                google: profile.sub
              }, function(err, existingUser) {
                if(existingUser) {
                  return res.status(409).send({
                    message: 'There is already a Goole account that belongs to you'
                  });
                }
                var token = req.headers.authorization.split(' ')[1];
                var payload = jwt.decode(token, config.TOKEN_SECRET);
                UserModel.findById(payload.sub, function(err, user) {
                  if(!user) {
                    return res.status(400).send({
                      message: 'User not found'
                    });
                  }
                  user.google = profile.sub;
                  user.picture = user.picture || profile.picture.replace('sz=50', 'sz=40');
                  user.displayName = user.displayName || profile.name;
                  user.save(function() {
                    var token = createJWT(user, config.TOKEN_SECRET);
                    res.send({
                      token: token
                    });
                  });
                });
              });
            } else {
              // 3b: Create a new account or reurn an existing one
              UserModel.findOne({
                google: profile.sub
              }, function(err, existingUser) {
                if(existingUser) {
                  return res.send({
                    token: createJWT(existingUser, config.TOKEN_SECRET)
                  });
                }
                var user = new UserModel();
                user.google = profile.sub;
                user.picture = profile.picture.replace('sz=50', 'sz=40');
                user.displayName = profile.name;

                user.save(function(err, savedUser) {
                  if(err) { throw err; }
                  // create the default lists
                  customlistModelFactory.install(conn, savedUser._id, function(err) {
                    var token = createJWT(user, config.TOKEN_SECRET);
                    res.send({
                      token: token
                    });
                  });
                });
              });
            }
          });
        });
      });
    });
  });
};
