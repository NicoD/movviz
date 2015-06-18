'use strict';

var express = require('express'),
  fs = require('fs'),
  logger = require('./src/utils/logger').Logger,
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  multipart = require('connect-multiparty');
var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());


app.use(multipart({uploadDir: '/tmp/movviz/'}));

// static route configuration
require('./routes.js')(app);

// controller configuration
fs.readdirSync('./src/controller').forEach(function(file) {
  if(file.substr(-3) == '.js') {
    logger.log('info', 'loading controller ' + file);
    require('./src/controller/' + file)(app);
  }

});

// default rule > send everything to index 
app.get('/*', function(req, res) {
  res.render('index');
});
app.listen(80);
