var util = require('util');
var MuxDemux = require('mux-demux');
var net = require('net')

var con = net.connect(3303);
var mx = MuxDemux();
con.pipe(mx).pipe(con);


var my_stream = mx.createStream();

my_stream.write({
  type: 0x08,
  command: "NI"
});

my_stream.on("data", function(frame) {
  console.log(">>>", util.inspect(frame));
});
