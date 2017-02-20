var crypto = require('crypto');
var express = require('express');
var fmt = require('util').format;
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3030;
var keys = [];
var nodeCount = [];

app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.cookie('view', '10.0.0.20:8080,10.0.0.21:8080');
    res.sendFile('static/index.html' , { root : __dirname});
});

app.post('/insert', (req, res) => {
    var count = req.body.count || 0;
    console.log(fmt('Inserting %s nodes', count));
    for (var i=0; i<count; i++) {
        var key = crypto.randomBytes(16).toString('hex');
        var value = crypto.randomBytes(32).toString('hex');
        console.log(fmt('Inserting\n k=%s\n v=%s', key, value));
    }
    res.send({status:'ok'});
});

app.post('/refresh', (req, res) => {
    console.log('Re-reading all keys');
    res.send({status:'ok'});
});

app.post('/removeall', (req, res) => {
    console.log('Removing all keys');
    res.send({status:'ok'});
});

app.use(express.static('static'))

app.listen(PORT, function () {
    console.log('Started on port', PORT);
});
