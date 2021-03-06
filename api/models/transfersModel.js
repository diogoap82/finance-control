'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transferSchema = new Schema({
	date: { type: Date, default: Date.Now },
	amount: { type: Number, default: 0 },
	accountOrigin_id: String,
	_accountOrigin: Object,
	accountTarget_id: String,
	_accountTarget: Object,
	user_id: String,
	currency_id: String,
	_currency: Object	
});

module.exports = mongoose.model('Transfer', transferSchema);
