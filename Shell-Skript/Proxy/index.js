var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var first = true;
var target = "";
var buffer = [];

var server = http.createServer(function(req1, res1) {
  req = req1;
  res = res1;
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  if(first == true){
    target = req.url;
    first = false;
  }
  setTimeout(function() {
    proxy.web(req, res, { target: target });
  }, 100);
});


console.log("listening on port 5050")
server.listen(5050);
