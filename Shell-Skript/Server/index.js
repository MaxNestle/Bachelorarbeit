var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bits = require('buffer-bits');
var socken = [];
var proxySocket = '';
var receiverSocket = '';
var timestaps = [];
var dataBits;


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


app.get('/SecretProxy', function(req, res){
  res.sendFile(__dirname + '/indexProxy.html');
});


var getTimeString = function(input, separator) {
    var pad = function(input) {return input < 10 ? "0" + input : input;};
    var date = input ? new Date(input) : new Date();
    return [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
      //  date.getMilliseconds()
    ].join(typeof separator !== 'undefined' ?  separator : ':' );
}

var getMinute = function(input, separator) {
    var pad = function(input) {return input < 10 ? "0" + input : input;};
    var date = input ? new Date(input) : new Date();
    return [
      //  pad(date.getHours())
        pad(date.getMinutes())
      //  pad(date.getSeconds())
      //  date.getMilliseconds()
    ].join(typeof separator !== 'undefined' ?  separator : ':' );
}


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function getDataFromFile(){
  fs.readFile('Secret/secret', function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
    dataBits = bits.from(data).toBinaryString();
    dataBits = dataBits.substr(1);
    dataBits = dataBits.substr(1);
    console.log(dataBits);
  });
}


async function sendTime(){
	while(1){
   		await sleep(1000);
      console.log(timestaps);
			for (i = 0; i < socken.length; i++) {
				socken[i].emit('time', getTimeString());
			}
		}
	}

async function checkTimestamps(){
  var min = getMinute();
  	while(1){
     		await sleep(1000);

        if (parseInt(getMinute()) == parseInt(min) + 1){
          min = getMinute();
          console.log("Checking timestaps");
        }
  		}
}


io.on('connection', (socket) => {
  var address = socket.handshake.address.replace(/^.*:/, '');
  timestaps.push({ip: address ,time: getMinute()});

  //tests if the socket is from a user or the proxy
  socket.emit('test', "test");

  //if proxy
  socket.on('proxyHello', function (data) {
    if(proxySocket != ''){
      proxySocket.emit('ACK', "You are no longer the Proxy");
    }
    proxySocket = socket;
    proxySocket.emit('ACK', "You are the Proxy now");
     console.log("Proxy");
   });

   //if normal user
   socket.on('ClientHello', function (data) {
      console.log("Client");
      socken.push(socket);
    });

    socket.on('disconnect', function () {
      if(socken != ''){
        //deleting socket from array
        for(var i = socken.length - 1; i >= 0; i--) {
            if(socken[i] === socket) {
              socken.splice(i, 1);
            }
        }
        console.log("user abgemeldet");
      }
    });
});


getDataFromFile();
checkTimestamps();
sendTime();


http.listen(80, function(){
  console.log('listening on *:80');
});
