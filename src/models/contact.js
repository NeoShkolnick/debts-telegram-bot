var mongoose = require('mongoose');

const Schema = mongoose.Schema;

var ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
