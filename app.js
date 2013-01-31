var MESSAGE_CHANNEL = '/messages';
var USERS_ONLINE    = '/users_online';
var USERS_OFFLINE 	= '/users_offline';

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , http = require('http')
  , faye = require('faye')
  , mysql = require('mysql')
  , fayeRedis = require('faye-redis')
	, redis = require('redis')
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

var red = redis.createClient();
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

// GET /
app.get('/', routes.index);

// GET /chats.json
app.get('/chats.json', function(req, res) {
  connection.query('SELECT * FROM messages ORDER BY id ASC', function(err, rows) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(rows));
  });
});

// GET /users.json
app.get('/users.json', function(req, res) {
	var users = red.smembers("online", function(err, content){
		res.writeHead(200, {'Content-Type': 'application/json'});
	  res.end(JSON.stringify(content));
  });
});

server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Used for the chat messaging channel
var bayeux = new faye.NodeAdapter({
  mount: MESSAGE_CHANNEL,
  timeout: 60,
  engine: {
    type: fayeRedis,
    host: 'localhost',
    port: 6379
  }
});
bayeux.attach(server);

// Callbacks for bayeux
bayeux.getClient().subscribe(MESSAGE_CHANNEL, function(message) {
  var hash = JSON.stringify(message);
  console.log('[subscribe] - ' + hash);
  
  connection.query('INSERT INTO messages (content, user_id, timestamp) VALUES ("'+message.content+'",'+message.user_id+',"'+message.timestamp+'");', function(err, rows) {
    if (err) console.log('[MYSQL] Insert error' + err);
  });
});


// When a user connects to the channel
bayeux.bind('handshake', function(client_id) {
  console.log('[handshake] - client: ' + client_id + '');
	bayeux.getClient().publish(USERS_ONLINE, client_id);
	red.sadd('online', client_id);
});

bayeux.bind('subscribe', function(client_id, channel) {
  console.log('[subscribe] - client: ' + client_id + ' channel: ' + channel + '');
});

// When a user publishes a message to the channel
bayeux.bind('publish', function(message, channels) {
  console.log('[publish] - message: ' +message+ ' channels: ' + channels + '')
});

// When a user leaves the channel
bayeux.bind('unsubscribe', function(client_id, channel) {
  console.log('[unsubscribe] - client: ' + client_id + ' channel: ' + channel + '');
	red.srem('online', client_id);
});

bayeux.bind('disconnect', function(client_id) {
  console.log('[disconnect] - client: ' + client_id + '');
	bayeux.getClient().publish(USERS_OFFLINE, client_id);
	red.srem('online', client_id);
});




