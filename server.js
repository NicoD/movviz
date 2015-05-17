'use strict';

var app = require('express')(),
    server = require('http').createServer(app);


server.listen(80);

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/public/*', function(req, res) {
  // @TODO secure this part
  res.sendfile('./' + req.originalUrl);   
});

