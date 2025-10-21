import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	const newCustomer = req.body;
	
	const {firstName, lastName, middleInitial} = newCustomer;

	const customerID = crypto.randomUUID();

	await db.query(
		`
		INSERT INTO Customer (customerId, firstName, lastName, middleInitial, joinDate, email)
		VALUES(?, ?, ?, ?, CURRENT_DATE(), NULL);
		`,
		[customerID, firstName, lastName, middleInitial]
	);

	return sendJSON(res,
		201,
		{message: 'Customer successfully created'}
	);
}

async function getOne(req, res){
	const getCustomer = req.body; 
	const getCustomerID = getCustomer.customerID;
	const [result] = await db.query(`
		SELECT *
		FROM Customer
		WHERE customerId = ? AND deletedAt IS NULL
		`,
	[
		getCustomerID
	]);
	//check if customer exists maybe here.

	return sendJSON(res,
		201,
		{customer: result[0]}
	);
}

async function deleteOne(req, res){
	const deleteCustomer = req.body;
	const deleteCustomerID = deleteCustomer.customerID;
	
	await db.query(`
		UPDATE Customer
		SET deletedAt = CURRENT_DATE()
		WHERE customerId = ? AND deletedAt IS NULL
		`,
	[
		deleteCustomerID
	]);

	return sendJSON(res,
		201,
		{message: 'Customer successfully deleted'}
	);
}


export default {createOne, getOne, deleteOne};