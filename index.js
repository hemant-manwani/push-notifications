var express = require('express');
var app = express();
var path = require('path');
var webpush = require('web-push');
var vapidKeys = webpush.generateVAPIDKeys();
var compress = require('compression'),
    bodyParser = require('body-parser'),
    request = require('request');

webpush.setGCMAPIKey('AIzaSyCZ7U7RizYMHX4duAZB3TfY0ypp2lXhlcs');
webpush.setVapidDetails(
  'mailto:hemantmanwani.iitr@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
console.log(vapidKeys);


app.use(compress());
app.use(bodyParser.urlencoded({limit: '1mb', extended: false}));
app.use(bodyParser.json({limit: '1mb'}));
app.use(function(req, res, next){
  if(req.headers.origin)
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  if (req.headers['access-control-request-method'])
   res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
  if (req.headers['access-control-request-headers'])
     res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  res.header("Access-Control-Expose-Headers", "Content-Length, x-items-count");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/client-token', function(req, res){
  res.send({success: true, data: vapidKeys.publicKey});
});
app.post('/send-message', function(req, res){
  var url = "https://gcm-http.googleapis.com/gcm/send";
  request.post({
    url: url,
    form: {
      data: {
        body: req.body.message
      },
      to: req.body.to
    },
    headers: {
      "Content-Type": "application/json",
      "Authorization": "AIzaSyCZ7U7RizYMHX4duAZB3TfY0ypp2lXhlcs"
    },
    function(err,httpResponse,body){
      console.log(body);
      if(err==null)
        res.send({success: true, data: body});
      else
        {console.log(err);res.send({success: false, data: err});}
    }
  });
});
app.listen(8080);
