var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , http = require('http')
  , faye = require('faye')
  , mysql = require('mysql')
  , fayeRedis = require('faye-redis')
  , path = require('path');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'sharkattack'
});
connection.connect();
connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var bayeux = new faye.NodeAdapter({
  mount: '/messages',
  timeout: 60,
  engine: {
    type: fayeRedis,
    host: 'localhost',
    port: 6379
  }
});
bayeux.attach(server);

// Callbacks for bayeux
bayeux.getClient().subscribe('/messages', function(message) {
  var hash = JSON.stringify(message);
  console.log('[subscribe] - ' + hash);
  
  connection.query('INSERT INTO messages (content, user_id, timestamp) VALUES ("'+message.content+'",'+message.user_id+',"'+message.timestamp+'");', function(err, rows) {
    if (err) console.log('[MYSQL] Insert error' + err);
  });
});

bayeux.bind('handshake', function(client_id) {
  console.log('[handshake] - client: ' + client_id + '');
});

bayeux.bind('subscribe', function(client_id, channel) {
  console.log('[subscribe] - client: ' + client_id + ' channel: ' + channel + '');
});

bayeux.bind('publish', function(message, channels) {
  console.log('[publish] - message: ' +message+ ' channels: ' + channels + '')
});

bayeux.bind('unsubscribe', function(client_id, channel) {
  console.log('[unsubscribe] - client: ' + client_id + ' channel: ' + channel + '');
});

bayeux.bind('disconnect', function(client_id) {
  console.log('[disconnect] - client: ' + client_id + '');
});




