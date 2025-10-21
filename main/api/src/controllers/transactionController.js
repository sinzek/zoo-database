import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';


async function createOne(req, res){
	const newTransaction = req.body;
	const newTransactionID = crypto.randomUUID();
	const {businessId, price, purchaseDate} = newTransaction;

	await db.query(
		`
		INSERT INTO Transaction (transactionId, businessId, amount, purchaseDate)
		VALUES(?, ?, ?, ?);
		`,
		[newTransactionID, businessId, price, purchaseDate]
	);
	return sendJSON(res,
		201,
		{message: 'Transaction successfully created'}
	);
}

async function deleteOneByID(req, res){
	const deleteTransaction = req.body;
	const deleteTransactionID = deleteTransaction.transactionID;
	
	await db.query(`
		UPDATE Transaction
		SET deletedAt = CURRENT_DATE()
		WHERE transactionId = ? AND deletedAt IS NULL
		`,
	[
		deleteTransactionID
	]);
	//may have to handle PurchasedItem deletion here too.
	return sendJSON(res,
		201,
		{message: 'Transaction successfully deleted'}
	);
}

async function updateOneByID(req, res){
	const updatedTransaction = req.body;
	const {businessId, price, purchaseDate} = updatedTransaction
	await db.query(`
		UPDATE Transaction
		SET businessId = ?, amount = ?, purchaseDate = ?
		WHERE transactionId = ? AND deletedAt IS NULL
		`,
	[
		businessId, price, purchaseDate, updatedTransaction.transactionId
	]);
	return sendJSON(res,
		201,
		{message: 'Transaction successfully updated'}
	);
}

export default {createOne, deleteOneByID,	updateOneByID};