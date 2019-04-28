#!/usr/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bits = require('buffer-bits');
var md5 = require('js-md5');
var socken = [];
var proxySocket = '';
var receiverSocket = '';
var timestaps = [];
var dataBits = [];
var codeBits = [];
var factor = 0.5;                  //relation between long and short break
var longBreak = 50;//mil sec
var shortBreak = longBreak*factor;  // milsec
var dataBitsLength = 4;  //bits
var fileLoad = false;
var breakBetweenTransmit = 1000   //mil sec



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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
        pad(date.getMinutes())
    ].join(typeof separator !== 'undefined' ?  separator : ':' );
}


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function getHash(data){
  hashLength = 1;
  seed = new Buffer([129, 69, 229, 238, 16, 104, 178, 222, 95, 5, 171, 147, 231, 170, 105,
         61, 85, 217, 236, 223, 87, 221, 60, 38, 125, 151, 124, 86, 137, 143,
         230, 25, 228, 116, 62, 12, 150, 42, 177, 65, 207, 20, 122, 67, 109,
         220, 208, 102, 183, 90, 28, 15, 245, 97, 145, 162, 156, 181, 155,
         233, 111, 43, 157, 120, 247, 83, 194, 126, 34, 18, 198, 57, 121,
         164, 74, 218, 8, 138, 130, 37, 51, 193, 4, 244, 152, 40, 45, 89,
         35, 209, 21, 224, 76, 189, 96, 17, 201, 235, 64, 161, 68, 254,
         202, 174, 44, 66, 133, 91, 72, 195, 210, 22, 52, 172, 56, 114,
         63, 48, 197, 127, 88, 173, 0, 117, 10, 41, 106, 192, 188, 252,
         169, 199, 242, 31, 214, 136, 7, 23, 103, 251, 6, 185, 11, 123,
         98, 182, 46, 118, 110, 36, 225, 249, 160, 3, 163, 100, 80, 53,
         1, 190, 141, 13, 255, 146, 93, 14, 140, 166, 211, 78, 184, 232,
         108, 115, 19, 32, 167, 9, 113, 165, 253, 226, 132, 187, 154, 227,
         205, 206, 58, 59, 134, 55, 128, 131, 204, 200, 24, 196, 144, 75, 216,
         158, 49, 94, 107, 180, 168, 142, 119, 219, 153, 248, 212, 159, 239, 186,
         179, 54, 27, 30, 84, 149, 203, 2, 191, 215, 175, 139, 81, 47, 92, 240, 241,
         148, 77, 26, 70, 71, 176, 99, 39, 234, 33, 50, 82, 213, 112, 237, 73, 135,
         250, 101, 243, 246, 79, 29]);
	if (!(Buffer.isBuffer(data) || typeof data == 'string')) throw new TypeError('data must either be a string or a buffer');
	if (hashLength && !(typeof hashLength == 'number' && hashLength > 0 && hashLength <= 8 && Math.round(hashLength) == hashLength)) throw new TypeError('when defined, hashLength must be an integer number between 1 and 8 ');
	if (seed && !(Buffer.isBuffer(seed) && seed.length == 256)) throw new TypeError('when defined, seed must be a 256 bytes-long buffer');

	if (data.length == 0) throw new TypeError('data must be at least one byte long');
	if (typeof data == 'string') data = new Buffer(data, 'utf8');

	var s = seed;

	//var i = 0, j = 0;
	var hash = new Buffer(hashLength);
  data = String(data);

	for (var j = 0; j < hashLength; j++){
		var h = s[(parseInt(data.charAt(0)) + j) % 256];  //index hash
		for (var i = 1; i < data.length; i++){
			h = s[(h ^ data[i])];                           // bitwise XOR
		}
		hash[j] = h;
	}
	return hash;
}

function getDataFromFile(){
  fs.readFile('Secret/secret', function (err,data) {
    if (err) {
      return console.log(err);
    }
    dataBits = bits.from(data).toBinaryString();
    dataBits = dataBits.substr(1);
    dataBits = dataBits.substr(1);
    console.log("Data: \t"+dataBits);
    var hashBuffer = new Buffer(getHash(dataBits));
    var hash = bits.from(hashBuffer).toBinaryString();
    hash = hash.substr(1);
    hash = hash.substr(1);
    console.log("Hash: \t"+hash);
    dataBits = dataBits + hash;
    console.log("Data + Hash: \t"+dataBits);

    codeBits = dataBits;
    dataBits = [];
    fileLoad = true;
    covertChannel();
    //channel();
  });
}


async function channel(){
  while (true) {
    if(socken.length != 0){ // vieleicht verzögerung
      socken[0].emit('time', getTimeString());
    }
    await sleep(shortBreak);
  }
}

async function covertChannel(){
  var sync = "xxxxxxxxxxxxxxxx"
  codeBits =  sync.concat(codeBits)
  console.log(codeBits)
  console.log(longBreak)
  console.log(shortBreak)

  while (true) {
    if (fileLoad == true) {
      for(k = 1; k<=15; k++){
	if(socken.length != 0){
	 // socken[0].emit('time', getTimeString());
	}
      }
      for(i = 0; i < codeBits.length; i++){
        if(socken.length != 0){
          socken[0].emit('time', getTimeString());
        }
        if(codeBits[i] == "1"){
          await sleep(longBreak);
        }
        if(codeBits[i] == "0") {
          await sleep(shortBreak);
        }
	else{
         await sleep(10)}
      }
      if(socken.length != 0){
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

  //sends test message
  socket.emit('test', 'test');

  socket.on('ClientHello', function (data) {
      console.log("Client connected");
      socken.push(socket);
    });

    socket.on('disconnect', function () {
      if(socken != ''){
        //deleting socket from array
        for(var i = socken.length - 1; i >= 0; i--) {
            if(socken[i] === socket) {
              socken.splice(i, 1);
              console.log("Client disconnected");
              break;
            }
        }
      }
    });
});


getDataFromFile();
//checkTimestamps();
//sendTime();


http.listen(80, function(){
  console.log('listening on *:80');
});
