const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");

var scanner = new BeaconScanner();

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

var addressToTrack = '1E5FF8C3-BF57-4D91-8B59-FB97B58E47CC'; 

socket.on('connect', function(){  
  console.log('connected to server');
});

//Set an event handler for beacon
scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    beacon.uuid = advertisement["uuid"];    
    console.log(JSON.stringify(beacon, null, "    "))

	if(beacon.uuid == addressToTrack){
		socket.emit('deviceData', {mac: peripheral.uuid, rssi:peripheral.rssi});   
	}
};

scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
});



