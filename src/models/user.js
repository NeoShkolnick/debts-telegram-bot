var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema(
  {
    chat_id: {type: Number, required: true, unique:true},
    username: String,
    name: String
  }
);

module.exports = mongoose.model('User', UserSchema);
