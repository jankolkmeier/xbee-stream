/*
 * xbee-stream
 * https://github.com/jouz/xbee-stream
 *
 * Copyright (c) 2013 Jan Kolkmeier
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');
var stream = require('stream');

exports = module.exports;

var xbee_api = exports.xbee_api = require('xbee-api');
exports.XBeeStream = XBeeStream;

var _options = {
  xbee_api: {}
};

function XBeeStream(options) {
  if (!(this instanceof XBeeStream))
    return new XBeeStream(options);
  stream.Duplex.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;

  this.reading = true;

  var self = this;

  options = options || {};
  options.__proto__ = _options;
  this.options = options;
  this.xbeeAPI = new xbee_api.XBeeAPI(this.options.xbee_api);

  this.writeFcn = function(buffer, cb) {
    console.log(util.inspect(buffer));
    cb(null, buffer.length);
  };
  
  this.xbeeAPI.on("frame_object", function(frame) {
    self.onAPIFrame(frame);
  });

  this.queue = [];

  return this;
};
util.inherits(XBeeStream, stream.Duplex);

XBeeStream.prototype._write = function(obj, encoding, next) {
  this.writeFcn(this.xbeeAPI.buildFrame(obj), next);
};

XBeeStream.prototype._read = function() {
  this.reading = true;
  while (this.queue.length > 0 && this.reading) {
    this.reading = this.push(this.queue.shift());
  }
};

XBeeStream.prototype.close = function() {
  // ...
  this.push(null);
};

XBeeStream.prototype.onAPIFrame = function(frame) {
  if (!this.reading) {
    this.queue.push(frame);
  } else if (frame != null) {
    this.reading = this.push(frame);
  }
};
