var express = require('express');
var app = express();

var PORT = 3000;

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.status(200).sendFile(__dirname+'/public/index.html');
});

app.get('/credit', function(req,res) {
    res.status(200).sendFile(__dirname+'/public/credit.html');
});

app.get('/radio', function(req, res) {
    res.status(200).sendFile(__dirname+'/public/radio.html');
});

app.listen(PORT, function() {
    console.log('Server is running on PORT:',PORT);
});