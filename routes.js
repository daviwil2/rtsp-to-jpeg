// ./routes/routes.js

'use strict';

module.exports = exports = function(app, config, log){

  var _       = require('lodash');
  var express = require('express');
  var rtsp    = require('rtsp-ffmpeg');

  // use an undocumented setting for express.js to set the formatting of stringified json so the /status path is formatted in a more readable style
  app.set('json spaces', 4);

  // create an array with all the recognised streams
  var streams = [];
  _.forOwn(config.streams, (value, key)=>{
    streams.push(key);
  }); // _.forOwn

  /// express routes that render pages

  // home
  app.get('/', function(req, res, next){
    res.status(200).json({status:"ok"})
  }); // app.get

  // TODO: add handlers for the various paths... /kitchen/image.jpg etc.
  app.get('/:stream', function(req, res, next){

    let streamName = req.params.stream;
    if (streams.indexOf(streamName) !== -1){

      log.trace('received request for image from stream \''+streamName+'\'');

      let haveFrame = false; // set boolean flag as we don't yet have a flag to process

      // get the uri to the stream, use settings or defaults, and intantiate the stream
      let uri = (config.streams[streamName]);
      let resolution = (config.ffmpeg && config.ffmpeg.resolution) ? config.ffmpeg.resolution : "1920x1080" ; // native resolutions are 1920x1080, 1024x576 or 640x360
      let quality = (config.ffmpeg && config.ffmpeg.quality) ? Number(config.ffmpeg.quality) : 5 ;
      log.trace('for stream \''+streamName+'\', connecting to uri \''+uri+'\' at resolution \''+resolution+'\' with quality '+quality.toString());
      let stream = new rtsp.FFMpeg({input: uri, resolution: resolution, quality: quality});

      /// handlers for events generated by the stream emitter

      stream.on('start', () => {
			  log.trace('start event received for stream \''+streamName+'\'');
      }); // start

      stream.on('data', function(chunk){

        // if we don't yet have a frame to process then proceed...
        if(haveFrame == false){

          function _formatNumber(value) {
            return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          }; // _formatNumber

          log.trace('frame received, length '+_formatNumber(chunk.length)+' bytes');
          haveFrame = true; // set flag to prevent processing of another frame
          res.type('jpeg'); // set the type to 'jpeg' which in turn sets the Content-Type header
          res.status(200).send(Buffer.from(chunk)); // return the image to the Homey client, converting it to a Buffer first
          log.trace('frame sent, exiting event handler');
          stream = null;

        }; // if

      }); // data

    } else {
      res.status(404).send('camera not found');
    }; // if
  }); // app.get

  /// error messages, need to be replaced with handlebars-rendered pages that can be displayed in the main region

  // 404 path not found
  app.use(function(req, res, next) {
    log.error('404 error: '+req.path);
    res.status(404);
    res.render('404');
  }); // app.use

  // 500 internal server error
  app.use(function(err, req, res, next) {

    // from the V8 stack extract the location of the error
    var where = err.stack.split(/\r?\n/)[1].trim();
    var array = where.split(/:/);
    where = array[0].split(' ')[1].trim()+' line '+array[1]+' character '+array[2];

    log.error('500 error: '+err.message+' in '+where);
    res.status(500);
    res.render('500', {
      err: err
    }); // res.render

  }); // app.use

} // module.exports
