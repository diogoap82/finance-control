'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var incomeSchema = new Schema({
	description: String,
	dueDate: { type: Date, default: Date.Now },
	amount: { type: Number, default: 0 },
	category_id: String,
	_categoryNames: String,
	_category: Object,
	account_id: String,
	_accountNames: String,
	_account: Object,
	amountReceived: { type: Number, default: 0 },
	status: { type: String, default: '' },
	notes: String,
	isLatePayment: { type: Boolean, default: false },
	detail: [ {
	 	description: String,
		amount: { type: Number, default: 0 },
		category_id: ObjectId,
		_category: Object,
		account_id: ObjectId,
		_account: Object,
		status: String
	} ]
});

module.exports = mongoose.model('Income', incomeSchema);