import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	const newTransaction = req.body;

	if (!newTransaction) throw new Error('Missing transaction data');

	const newTransactionID = crypto.randomUUID();
	const {businessId, price, purchaseDate} = newTransaction;

	await createOneQuery('Transaction', {
		transactionId: newTransactionID,
		businessId,
		amount: price,
		purchaseDate
	});

	return [{ transactionId: newTransactionID, ...newTransaction }];
}

async function deleteOneByID(req, _res){
	const deleteTransaction = req.body;
	const deleteTransactionID = deleteTransaction.transactionID;

	if (!deleteTransactionID) throw new Error('Missing transactionID');
	
	// using db.query for soft delete
	await db.query(
		`
		UPDATE Transaction
		SET deletedAt = CURRENT_DATE()
		WHERE transactionId = ? AND deletedAt IS NULL
		`,
		[deleteTransactionID]
	);
	//may have to handle PurchasedItem deletion here too.
	return [{ message: 'Transaction successfully deleted' }];
}

async function updateOneByID(req, _res){
	const updatedTransaction = req.body;

	if (!updatedTransaction || !updatedTransaction.transactionId) {
		throw new Error('Missing transaction data or transactionId');
	}

	const {transactionId, businessId, price, purchaseDate} = updatedTransaction;

	await updateOneQuery('Transaction', {
		transactionId,
		businessId,
		amount: price,
		purchaseDate
	}, 'transactionId');

	return [updatedTransaction];
}

export default {createOne, deleteOneByID,	updateOneByID};