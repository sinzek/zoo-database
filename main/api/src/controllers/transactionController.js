import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new transaction record.
 * @param {string} req.body.businessId - UUID of the associated business
 * @param {number} req.body.price - Transaction amount
 * @param {string} req.body.purchaseDate - Date/time of purchase
 * @returns {Promise<Array>} Array containing the created transaction object with generated transactionId
 * @throws {Error} If transaction data is missing
 */
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

/**
 * Soft deletes a transaction by setting its deletedAt timestamp.
 * @param {string} req.body.transactionID - UUID of the transaction to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If transactionID is missing
 */
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

/**
 * Updates an existing transaction record.
 * @param {string} req.body.transactionId - UUID of the transaction to update
 * @param {string} [req.body.businessId] - Updated business ID
 * @param {number} [req.body.price] - Updated amount
 * @param {string} [req.body.purchaseDate] - Updated purchase date
 * @returns {Promise<Array>} Array containing the updated transaction object
 * @throws {Error} If transaction data or transactionId is missing
 */
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
