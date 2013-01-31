var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('messages', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    content: 'text',
    user_id: 'string',
    timestamp: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('messages', callback);
};
