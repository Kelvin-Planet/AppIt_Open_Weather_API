//Database
var mongoose = require('mongoose');
var weatherSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed
});
mongoose.connect('mongodb://localhost/appit', {useUnifiedTopology: true, useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

const secret = 'secret';

//Express Server
let fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
var jwtVerifer = require('express-jwt');
var express = require('express');
var app = express();

//API

app.post('/token', (req, res) => {
    let exp = Math.floor(Date.now() / 1000) + 60
    var token = jwt.sign({ exp: exp }, secret);
    res.send(token);
})

var api_url = 'https://samples.openweathermap.org/data/2.5/weather?q=Hong%20Kong,hk&appid=5f948fed7a2580ca54feabd9b3d69265'
app.get('/home', jwtVerifer({secret: secret}), function (req, res) {
    // Load OpenWeather Server API
    fetch(api_url, {}).then((response) => {
        return response.json();
    }).then((jsonData) => {
        // Saving to DB
        var Weather = mongoose.model('Weather', weatherSchema);
        var one = new Weather({ data: jsonData });
        one.save(function (err, one) {
            if (err) return console.error(err);
        });
        // Return result
        res.send(jsonData);
    }).catch((err) => {
        // If no internet connection, then load from DB and return result
        var Weather = mongoose.model('Weather', weatherSchema);
        Weather.findOne({}, 'data', function (err, result) {
            if (err) res.send(handleError(err));
            res.send(result);
        })
    });
});

//APP
app.listen(3000, function () {
    console.log('listening on port 3000');
});