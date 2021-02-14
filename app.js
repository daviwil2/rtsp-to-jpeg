// ./app.js

'use strict';

var http           = require('http');
var _              = require('lodash');
var express        = require('express');
var helmet         = require('helmet');
var compression    = require('compression');

var config         = require('./config.json');
var log            = require('./lib/log.js')(config);

function _reformatArray(array, suppressApostrophes){
  if (!array) { return null };
  var apostrophe = (suppressApostrophes) ? '' : '\'';
  if (array.length == 1 ) {return apostrophe+array+apostrophe};
  var i;
  var formatted = '';
  var num = array.length;
  for (i=0; i<num-1; i++){
    formatted = formatted + apostrophe+array[i]+apostrophe;
    if (i<num-2) {formatted = formatted + ', '};
  };
  formatted = formatted + ' and ' + apostrophe + array[num-1] + apostrophe;
  return formatted;
};

log.debug('running versions '+_reformatArray(_.map(process.versions, function(version, module){ return module+' '+version }), true));

_.forOwn(config.streams, (value, key)=>{
  log.trace('stream \''+key+'\' mapped to uri \''+value+'\'');
}); // _.forOwn

// Create our express application
var app = express();

app.use(compression()); // use compression, with defaults, for all requests
app.use(helmet());      // use helmet to secure the server - see https://github.com/helmetjs/helmet
log.debug('helmet loaded');

// define routes
require('./routes.js')(app, config, log);
log.debug('routes loaded');

// create a http and https servers, with a WebSocket over TLS server also listening on :443
var httpServer = http.createServer(app).listen(80, function(err){
  if (err){
    log.fatal('express HTTP server failed to start listening: '+err);
  } else {
    log.debug('express HTTP server listening on port 80');
  }; // if
}); // var httpServer
