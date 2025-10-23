import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	deleteOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

// We don't need this function, creating a new user account already creates a customer record
// async function createOne(req, _res){
// 	const newCustomer = req.body;

// 	if (!newCustomer) throw new Error('Missing customer data');
	
// 	const {firstName, lastName, middleInitial} = newCustomer;

// 	const customerID = crypto.randomUUID();

// 	// using db.query because we need CURRENT_DATE() function
// 	await db.query(
// 		`
// 		INSERT INTO Customer (customerId, firstName, lastName, middleInitial, joinDate, email)
// 		VALUES(?, ?, ?, ?, CURRENT_DATE(), NULL);
// 		`,
// 		[customerID, firstName, lastName, middleInitial]
// 	);

// 	return [{ customerID, ...newCustomer }];
// }

async function getOne(req, _res){
	const { customerId } = req.body;

	if (!customerId) throw new Error('Missing customerId');

	const [customer] = await getNByKeyQuery('Customer', 'customerId', customerId);

	return [customer];
}

async function deleteOne(req, _res){
	const { customerId } = req.body;

	if (!customerId) throw new Error('Missing customerId');
	
	// first, get userId associated with this customer
	const [customer] = await getNByKeyQuery('Customer', 'customerId', customerId);

	const userId = customer.userId;

	if(!userId) throw new Error('No userId associated with this customer');

	await deleteOneQuery('Customer', 'customerId', customerId);

	await deleteOneQuery('User', 'userId', userId);

	return [{ message: `Successfully deleted customer ${customer.firstName} ${customer.lastName} [ID: ${customer.customerId}]` }];
}

async function updateOne(req, _res) {
	const updatedCustomer = req.body;

	if (!updatedCustomer) {
		throw new Error('Missing customer data');
	}

	if(!updatedCustomer.customerId) throw new Error('Missing customerId in customer data');

	// making a copy to avoid mutating the original object
	const updatedCustomerData = { ...updatedCustomer };
	delete updatedCustomerData.userId; // prevent updating userId

	await updateOneQuery('Customer', updatedCustomerData, 'customerId');

	return [updatedCustomer];
}

export default { getOne, deleteOne, updateOne };