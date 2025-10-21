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

	const {mondayOpen, mondayClose,	tuesdayOpen, tuesdayClose,	wednesdayOpen,	wednesdayClose,	thursdayOpen,	thursdayClose,
		fridayOpen,	fridayClose,	saturdayOpen,	saturdayClose,	sundayOpen,	sundayClose} = newBusiness;

		//update business hours
	const hours = [
		['Sunday', sundayOpen, sundayClose],
		['Monday', mondayOpen, mondayClose],
		['Tuesday', tuesdayOpen, tuesdayClose],
		['Wednesday', wednesdayOpen, wednesdayClose],
		['Thursday', thursdayOpen, thursdayClose],
		['Friday', fridayOpen, fridayClose],
		['Saturday', saturdayOpen, saturdayClose]
	];

	for (const [dayOfWeek, openTime, closeTime] of hours){
		await db.query(
			`
			INSERT INTO BusinessHoursDay (businessId, dayOfWeek, openTime, closeTime)
			VALUES(?, ?, ?, ?);
			`,
			[newBusinessID, dayOfWeek, openTime, closeTime]
		);
	}

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

async function updateOneInfo(req, res){
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

async function updateOneHours(req, res){
	const updatedBusinessHours = req.body;
	const {mondayOpen, mondayClose,	tuesdayOpen,	tuesdayClose,	wednesdayOpen,	wednesdayClose,	thursdayOpen,	thursdayClose,
		fridayOpen,	fridayClose,	saturdayOpen,	saturdayClose,	sundayOpen,	sundayClose} = updatedBusinessHours;
		
		//update business hours
	const hours = [
		['Sunday', sundayOpen, sundayClose],
		['Monday', mondayOpen, mondayClose],
		['Tuesday', tuesdayOpen, tuesdayClose],
		['Wednesday', wednesdayOpen, wednesdayClose],
		['Thursday', thursdayOpen, thursdayClose],
		['Friday', fridayOpen, fridayClose],
		['Saturday', saturdayOpen, saturdayClose]
	];
	
	for (const [dayOfWeek, openTime, closeTime] of hours){
		await db.query(`
			UPDATE BusinessHoursDay
			SET openTime = ?, closeTime = ?
			WHERE businessId = ? AND dayOfWeek = ?;
			`,
		[
			openTime, closeTime, updatedBusinessHours.businessId, dayOfWeek
		]);
	}
	return sendJSON(res,
		201,
		{message: 'Business hours successfully updated'}
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

export default {createOne, updateOneInfo, updateOneHours, deleteOne, getEmployees};