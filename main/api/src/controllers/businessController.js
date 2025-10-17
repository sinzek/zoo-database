import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	const newBusiness = req.body;
	const newBusinessID = crypto.randomUUID();
	
	const {name, address, phone, email, uiDesc, businessType, createdAt, ownerID} = newBusiness;

	await db.query(
		`
		INSERT INTO Business (businessId, name, address, phone, email, uiDescription, type, createdAt, ownerId)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
		[newBusinessID, name, address, phone, email, uiDesc, businessType, createdAt, ownerID]
	);
	return sendJSON(res,
		201,
		{message: 'Business successfully created'}
	);
}

async function deleteOne(req, res){
	const deleteBusiness = req.body;
	const deleteBusinessID = deleteBusiness.businessID;

	await db.query(`
		UPDATE Business
		SET deletedAt = CURRENT_DATE()
		WHERE businessId = ? AND deletedAt IS NULL
		`,
	[
		deleteBusinessID
	]);

	//need to update ALL employees under business. Maybe allow null for employee's businessid for when business is deleted?

	return sendJSON(res,
		201,
		{message: 'Business successfully deleted'}
	);
}

async function updateOne(req, res){
	const updatedBusiness = req.body;
	const {name, address, phone, email, uiDesc} = updatedBusiness; //if updating a business, only these fields can be updated. If you try to update the ID it could break things, and a business type shouldnt be changed, just create another and delete the old one.

	await db.query(`
		UPDATE Business
		SET name = ?, address = ?, phone = ?, email = ?, uiDescription = ?
		WHERE businessId = ? AND deletedAt IS NULL
		`,
	[
		name, address, phone, email, uiDesc, updatedBusiness.businessId
	]);
	
	return sendJSON(res,
		201,
		{message: 'Business successfully updated'}
	);
}

async function getEmployees(req, res){
	const findBusiness = req.body;
	const findBusinessID = findBusiness.businessID;
	
	const [result] = await db.query(`
		SELECT *
		FROM Employee
		WHERE businessId = ? AND deletedAt IS NULL
		`,
	[
		findBusinessID
	]);
	return sendJSON(res,
		201,
		{employees: result}
	);
}

export default {createOne, updateOne, deleteOne, getEmployees};