var mongoose = require('mongoose');

const Schema = mongoose.Schema;

var ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    debts: [{ type: Schema.Types.ObjectId, ref: 'Debt' }]
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
