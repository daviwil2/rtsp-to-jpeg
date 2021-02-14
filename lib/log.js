// ./lib/log.js

'use strict';

/*
Log levels are:

'fatal' (60)
'error' (50)
'warn'  (40)
'info'  (30)
'debug' (20)
'trace' (10)
*/

module.exports = exports = function(config){

  var bunyan       = require('bunyan');
  var bunyanFormat = require('bunyan-format');

  // default to log level 60, override with any setting in the config file
  var level = (config.log.level) ? Number(config.log.level) : 60 ;

  // set a default name if one isn't defined in config
  var name = config.name ? config.name : 'rtsp-to-jpeg'; 

  var logger = {
    name: name,
    serializers: bunyan.stdSerializers,
    src: false,
    streams: [
      {
        level: level,
        stream: bunyanFormat({ outputMode: 'long', levelInString: true, color: true })
      },
    ] // streams
  }; // var logger

  // declare the logger
  var log = bunyan.createLogger(logger);

  // now log that the logger itself as been loaded
  var logLevels = {'10': 'trace (10)', '20': 'debug (20)', '30': 'info (30)', '40': 'warn (40)', '50': 'error (50)', '60': 'fatal (60)'};
  log.debug('bunyan loaded, log level '+logLevels[config.log.level]);

  return log;

};
