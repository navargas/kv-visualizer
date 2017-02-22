var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({extended:true}));

app.all('*', (req, res) => {
    console.log(req.method, 'on', req.originalUrl);
    console.log(' Body', req.body);
    res.send({owner:'localhost:'+PORT});
});

app.listen(PORT, function () {
    console.log('Started on port', PORT);
});
