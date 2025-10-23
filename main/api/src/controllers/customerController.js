import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	getNByKeyQuery,
} from '../utils/query-utils.js';

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

async function getOne(req, _res){
	const getCustomer = req.body; 
	const getCustomerID = getCustomer.customerID;

	if (!getCustomerID) throw new Error('Missing customerID');

	const rows = await getNByKeyQuery('Customer', 'customerId', getCustomerID);

	return [rows[0]];
}

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