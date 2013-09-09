var util = require('util');
var SerialPort = require('serialport').SerialPort;
var MuxDemux = require('mux-demux');
var net = require("net");

var xbee_stream = require('./lib/xbee-stream.js');
var C = xbee_stream.xbee_api.constants;

var xbeeStream = new xbee_stream.XBeeStream({
  xbee_api: {
    api_mode: 1
  }
});

var serialport = new SerialPort("COM6", {
  baudrate: 57600,
  parser: xbeeStream.xbeeAPI.rawParser()
});

xbeeStream.writeFcn = function(buffer, cb) {
  serialport.write(buffer, function(err, res) {
    setTimeout(function() {
      cb(err, res);
    }, 10); // This protects xbee from crashing
  });
}

serialport.on("open", function() {
  console.log("Serial port open.");
});

net.createServer(function handleTcp(con) {
  var mx = MuxDemux(function(stream) {
    stream.pipe(xbeeStream).pipe(stream);
  });

  con.pipe(mx).pipe(con);

  mx.on('error', function() {
    con.destroy();
  });

  con.on('error', function() {
    mx.destroy();
  });
}).listen(3303);
