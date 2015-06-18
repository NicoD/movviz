'use strict';

var fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  jwt = require('jwt-simple'),
  moment = require('moment');


module.exports = function(req, res, next) {
  var configFile = path.dirname(require.main.filename) + '/config/auth.yaml';
  fs.readFile(configFile, function(err, data) {
    if(err) {
      throw err;
    }
    var config = yaml.safeLoad(data);
    if(!req.headers.authorization) {
      return res.status(401).send({
        message: 'Please make sure your request has an Authorization header'
      });
    }
    var token = req.headers.authorization.split(' ')[1];

    var payload = null;
    try {
      payload = jwt.decode(token, config.TOKEN_SECRET);
    } catch(e) {
      return res.status(401).send({
        message: e.message
      });
    }

    if(payload.exp <= moment().unix()) {
      return res.status(401).send({
        message: 'Token has expired'
      });
    }
    req.user = payload.sub;
    next();
  });
};