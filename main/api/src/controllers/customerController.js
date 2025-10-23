import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	getNByKeyQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new customer record.
 * Uses db.query directly to leverage CURRENT_DATE() SQL function.
 * @param {string} req.body.firstName - First name
 * @param {string} req.body.lastName - Last name
 * @param {string} [req.body.middleInitial] - Middle initial
 * @returns {Promise<Array>} Array containing the created customer object with generated customerID
 * @throws {Error} If customer data is missing
 */
async function createOne(req, _res){
	const newCustomer = req.body;

	if (!newCustomer) throw new Error('Missing customer data');
	
	const {firstName, lastName, middleInitial} = newCustomer;

	const customerID = crypto.randomUUID();

	// using db.query because we need CURRENT_DATE() function
	await db.query(
		`
		INSERT INTO Customer (customerId, firstName, lastName, middleInitial, joinDate, email)
		VALUES(?, ?, ?, ?, CURRENT_DATE(), NULL);
		`,
		[customerID, firstName, lastName, middleInitial]
	);

	return [{ customerID, ...newCustomer }];
}

/**
 * Retrieves a single customer by their ID.
 * @param {string} req.body.customerID - UUID of the customer to retrieve
 * @returns {Promise<Array>} Array containing the customer object
 * @throws {Error} If customerID is missing or no customer is found
 */
async function getOne(req, _res){
	const getCustomer = req.body; 
	const getCustomerID = getCustomer.customerID;

	if (!getCustomerID) throw new Error('Missing customerID');

	const rows = await getNByKeyQuery('Customer', 'customerId', getCustomerID);

	return [rows[0]];
}

/**
 * Soft deletes a customer by setting their deletedAt timestamp.
 * @param {string} req.body.customerID - UUID of the customer to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If customerID is missing
 */
async function deleteOne(req, _res){
	const deleteCustomer = req.body;
	const deleteCustomerID = deleteCustomer.customerID;

	if (!deleteCustomerID) throw new Error('Missing customerID');
	
	// using db.query for soft delete
	await db.query(
		`
		UPDATE Customer
		SET deletedAt = CURRENT_DATE()
		WHERE customerId = ? AND deletedAt IS NULL
		`,
		[deleteCustomerID]
	);

	return [{ message: 'Customer successfully deleted' }];
}

export default {createOne, getOne, deleteOne};
