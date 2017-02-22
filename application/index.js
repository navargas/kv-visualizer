var crypto = require('crypto');
var express = require('express');
var request = require('request');
var fmt = require('util').format;
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3030;
// view string
var VIEW = process.env.VIEW || '';
// Array of all nodes in view
var nodes = VIEW.split(',');
// Index of node used for operations
var onNode = 0;
// Array of all keys created
var keys = [];
// Insert type
var MODE = 'round_robin'
// Map of addr:count
var nodeCount = {};
for (var i=0; i<nodes.length; i++) {
    nodeCount[nodes[i]] = 0;
}

var con = 0;
const MAXCON = 1000;
setInterval(()=> {
    if (con > 0)
        console.log(fmt('%s active connections', con));
}, 500);

app.use(bodyParser.json());

function getKeyOwner(k, cb) {
    onNode++;
    var options = {
        url: fmt('http://%s/kvs/%s', nodes[onNode % nodes.length], k),
        method: 'GET'
    }
    function attemptCon() {
        if (con >= MAXCON)
            return;
        con++;
        request(options, (err, r, body) => {
            con--;
            if (err) {
                console.error('HTTP error', err, body);
                cb(undefined);
            } else {
                var resp = JSON.parse(body);
                cb(resp.owner);
            }
        });
        return true;
    }
    if (!attemptCon()) {
        var checkloop;
        checkloop = setInterval(()=> {
            if (attemptCon()) clearInterval(checkloop);
        }, 500);
    }
}

function insertKey(k, v, cb) {
    if (MODE == 'round_robin') onNode++;
    var options = {
        url: fmt('http://%s/kvs/%s', nodes[onNode % nodes.length], k),
        method: 'PUT',
        form: {val:v}
    }
    request(options, (err, r, body) => {
        // Round robin all the nodes to distribute load
        if (err) {
            console.error('HTTP error', err, body);
        } else {
            var resp = JSON.parse(body);
            if (!nodeCount[resp.owner]) {
                nodeCount[resp.owner] = 0;
            }
            nodeCount[resp.owner]++;
            keys.push(k);
        }
        if (cb) cb();
    });
}

app.get('/', (req, res) => {
    res.cookie('view', VIEW);
    res.sendFile('static/index.html' , {root: __dirname});
});

app.get('/state', (req, res) => {
    res.send(nodeCount);
});

app.post('/mode', (req, res) => {
    var mode = req.body.mode;
    if (mode == 'round_robin' || mode == 'all_in_one')
        MODE = mode;
    res.send({status:'ok'});
});

app.post('/insert', (req, res) => {
    var count = req.body.count || 0;
    console.log(fmt('Inserting %s nodes', count));
    var results = 0;
    for (var i=0; i<count; i++) {
        var key = crypto.randomBytes(16).toString('hex');
        var value = crypto.randomBytes(32).toString('hex');
        console.log(fmt('Inserting\n k=%s\n v=%s', key, value));
        insertKey(key, value, ()=>{
            results++;
            if (results == count) {
                res.send(nodeCount);
            }
        });
    }
});

var refreshInProgress = false;

app.get('/refreshstatus', (req, res) => {
    if (refreshInProgress)
        res.send({status:'wait'});
    else
        res.send(nodeCount);
});

app.post('/refresh', (req, res) => {
    console.log('Re-reading all keys');
    if (refreshInProgress) {
        return res.send({status:'ok'});
    }
    if (keys.length > 0) {
        refreshInProgress = true;
    }
    var newNodeCount = {};
    var results = 0;
    for (var i=0; i< keys.length; i++) {
        ((key) => getKeyOwner(key, (owner)=>{
            results++;
            if (!newNodeCount[owner]) {
                newNodeCount[owner] = 0;
            }
            newNodeCount[owner]++;
            if (results == keys.length) {
                console.log('done');
                nodeCount = newNodeCount;
                refreshInProgress = false;
            }
        }))(keys[i]);
    }
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
