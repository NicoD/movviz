'use strict';

var express = require('express'),
    path = require('path');

module.exports = function(app) {

  app.use('/public', express.static(path.join(__dirname, '../public')));
  // only for dev purpose (sourceMap);
  app.use('/client', express.static(path.join(__dirname, '../client')));

  // partial view may be rendered through jade
  app.get('/partial/:name?', function(req, res) {
    res.render('partial/' + req.params.name);
  });
  // render partial diretly from assets
  app.get('/\*partial\.html', function(req, res, next) {
    res.sendFile(path.resolve(__dirname + '/../client/javascript' + req.originalUrl));
  });
};
