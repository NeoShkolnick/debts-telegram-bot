var mongoose = require('mongoose');

const Schema = mongoose.Schema;

var DebtSchema = new Schema(
  {
    value: { type: Number, required: true },
    comment: { type: String, default: '' },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    isContactDebtor: { type:Boolean, default: true },
  }
);

module.exports = mongoose.model('Debt', DebtSchema);
