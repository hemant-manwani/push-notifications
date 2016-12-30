var express = require('express');
var app = express();
var path = require('path');
var webpush = require('web-push');
var vapidKeys = webpush.generateVAPIDKeys();
 
webpush.setGCMAPIKey('AIzaSyCZ7U7RizYMHX4duAZB3TfY0ypp2lXhlcs');
webpush.setVapidDetails(
  'mailto:hemantmanwani.iitr@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
console.log(vapidKeys);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/client-token', function(req, res){
  res.send({success: true, data: vapidKeys.publicKey});
});
app.listen(8080);
