const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");

var twilio = require('twilio');
var client = new twilio('AC5ac55112242fd1099f5cc676a26f2765', 'bbcbad078cdd8d6b2aa3df4da6b9a49f');
var scanner = new BeaconScanner();

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost:3000/scanner');

var addressToTrack = '1E5FF8C3-BF57-4D91-8B59-FB97B58E47CC';

socket.on('connect', function(){
  console.log('connected to server');
});

//Set an event handler for beacon
scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    beacon.uuid = advertisement["uuid"];

	if(beacon.uuid == addressToTrack){
		socket.emit('deviceData', {mac: beacon.uuid, rssi:beacon.rssi});
	}
};

scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
});

// server
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var scanner = io.of('/scanner');

scanner.on('connection', function(socket) {

    console.log('Scanner Connected');

    socket.on('deviceData', function(beacon) {
        var distance = calculateDistance(beacon.rssi); //recived message from scanner
        console.log('distance is ' + distance);
        if(distance <= 1){
        // Send the text message if caretakee is within a meter of the door
          client.messages.create({
            to: '+15619016336',
            from: '+15612203028',
            body: 'Daddy says come home NOW!'
          });
        }
        socket.emit('distance', distance);
    });

    socket.on('confirm_distance', function(){
    	console.log('Client received distance from server'); //for debugging
    });

    socket.on('disconnect', function() {
        console.log('Scanner Disconnected');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

// client side

/* $(document).ready(function() {

   var socket = io('http://localhost/client');
   var linearScale = d3.scale.linear()
        .domain([0, 20])
        .range([20, 1000]);

    socket.on('connected', function(msg) {
        console.log('connected to server');

    });

    socket.on('distance', function(distance) {

        socket.emit('confirm_distance');
        var yVal = filter(linearScale(distance));

        TweenLite.to(user, 2, {
            y: yVal,
            ease: 'easeOutExpo'
        });

    });

}); */


function calculateDistance(rssi) {

  var txPower = -59 //hard coded power value. Usually ranges between -59 to -65

  if (rssi == 0) {
    return -1.0;
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;
    return distance;
  }
}
