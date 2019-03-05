var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bits = require('buffer-bits');
var hammingCode = require('hamming-code');
var socken = [];
var proxySocket = '';
var receiverSocket = '';
var timestaps = [];
var dataBits = [];
var codeBits = [];
var factor = 0.5;//relation between long and short break
var longBreak = 100;//mil sec
var shortBreak = longBreak*factor;// milsec
var dataBitsLength = 4;//bits
var fileLoad = false;
var breakBetweenTransmit = 1000//mil sec

console.log("Encode 10111011: ", hammingCode.encode("10111011"));
console.log("Decode 001101111011: ", hammingCode.decode("001101101001"))

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
        pad(date.getSeconds()),
        date.getMilliseconds()
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
    makeHammingCode();
    covertChannel();
  });
}


function makeHammingCode(){
  var tmp = "";
  while (true) {
    if(dataBits.length >= dataBitsLength){
      tmp = dataBits.substr(0,dataBitsLength);
      codeBits = codeBits+hammingCode.encode(tmp);
    }
    else {
      tmp = dataBits;
      dataBits = "";
      codeBits = codeBits+hammingCode.encode(tmp);
      console.log(tmp);
      break;
    }
    dataBits = dataBits.substr(dataBitsLength,dataBits.length);
    console.log(tmp);
  }
  console.log("Länge"+codeBits.length);
  fileLoad = true;
}

async function sendTime(){
	while(1){
   		await sleep(1000);
			for (i = 0; i < socken.length; i++) {
				socken[i].emit('time', getTimeString());
			}
		}
	}

async function covertChannel(){
  while (true) {
    if (fileLoad == true) {
      for(i = 0; i < codeBits.length; i++){
        if(socken.length != 0){ // vieleicht verzögerung
          socken[0].emit('time', getTimeString());
        }
        if(codeBits[i] == "1"){
          //process.stdout.write("_");
          await sleep(longBreak);
        }
        else {
          //process.stdout.write(".");
          await sleep(shortBreak);
        }
      }
      if(socken.length != 0){ // vieleicht verzögerung
        socken[0].emit('time', getTimeString());
      }
    }
    await sleep(breakBetweenTransmit);
  }
}

//checks every minute the timstaps for receiver
async function checkTimestamps(){
  var min = getMinute();
  	while(true){
     		await sleep(1000);
        if (parseInt(getMinute()) == parseInt(min) + 1){       //jede Minute suchen
          min = getMinute();
          console.log("Checking timestaps");
          for (i = 0; i < timestaps.length; i++) {    //durchsuchen aller timstaps
            var tmp = [];
            for (k = i; k < timestaps.length; k++){   // nach gleichen ips suchen
              if(timestaps[i].ip == timestaps[k].ip){
                tmp.push(parseInt(timestaps[k].time));          // zeit der einzelnen ips in array abspeichern
              }
            }
            if(tmp.length <= 6){
              if(tmp[0]==tmp[1]){
                if(tmp[1] == tmp[2]){
                  if((tmp[2]+1) == tmp[3]){
                    if(tmp[3] == tmp[4]){
                      if((tmp[4]+1) == tmp[5]){
                        console.log("angemeldet");
                      }
                    }
                  }
                }
              }
            }
            console.log(tmp);
            for (w = 0; w < timestaps.length; w++){
              if(timestaps[w].time < (min-4)){
                console.log("zahl gelöscht");
              }
            }
          }
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
//checkTimestamps();
//sendTime();


http.listen(80, function(){
  console.log('listening on *:80');
});
