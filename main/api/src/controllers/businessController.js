import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	const newBusiness = req.body;

	if (!newBusiness) throw new Error('Missing business data');

	const newBusinessID = crypto.randomUUID();
	
	const {name, address, phone, email, uiDesc, businessType, createdAt, ownerID} = newBusiness;

	await createOneQuery('Business', {
		businessId: newBusinessID,
		name,
		address,
		phone,
		email,
		uiDescription: uiDesc,
		type: businessType,
		createdAt,
		ownerId: ownerID
	});

	const {mondayOpen, mondayClose,	tuesdayOpen, tuesdayClose,	wednesdayOpen,	wednesdayClose,	thursdayOpen,	thursdayClose,
		fridayOpen,	fridayClose,	saturdayOpen,	saturdayClose,	sundayOpen,	sundayClose} = newBusiness;

	//create business hours
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
		await createOneQuery('BusinessHoursDay', {
			businessId: newBusinessID,
			dayOfWeek,
			openTime,
			closeTime
		});
	}

	return [{ businessId: newBusinessID, ...newBusiness }];
}

async function deleteOne(req, _res){
	const deleteBusiness = req.body;
	const deleteBusinessID = deleteBusiness.businessID;

	if (!deleteBusinessID) throw new Error('Missing businessID');

	// using db.query for soft delete
	await db.query(
		`
		UPDATE Business
		SET deletedAt = CURRENT_DATE()
		WHERE businessId = ? AND deletedAt IS NULL
		`,
		[deleteBusinessID]
	);

	//need to update ALL employees under business. Maybe allow null for employee's businessid for when business is deleted?

	return [{ message: 'Business successfully deleted' }];
}

async function updateOneInfo(req, _res){
	const updatedBusiness = req.body;

	if (!updatedBusiness || !updatedBusiness.businessId) {
		throw new Error('Missing business data or businessId');
	}

	const {businessId, name, address, phone, email, uiDesc} = updatedBusiness; //if updating a business, only these fields can be updated. If you try to update the ID it could break things, and a business type shouldnt be changed, just create another and delete the old one.

	await updateOneQuery('Business', {
		businessId,
		name,
		address,
		phone,
		email,
		uiDescription: uiDesc
	}, 'businessId');
	
	return [updatedBusiness];
}

async function updateOneHours(req, _res){
	const updatedBusinessHours = req.body;

	if (!updatedBusinessHours || !updatedBusinessHours.businessId) {
		throw new Error('Missing business data or businessId');
	}

	const {businessId, mondayOpen, mondayClose, tuesdayOpen, tuesdayClose, wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
		fridayOpen,	fridayClose, saturdayOpen, saturdayClose, sundayOpen, sundayClose} = updatedBusinessHours;
		
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
	
	// using db.query for composite key update
	for (const [dayOfWeek, openTime, closeTime] of hours){
		await db.query(
			`
			UPDATE BusinessHoursDay
			SET openTime = ?, closeTime = ?
			WHERE businessId = ? AND dayOfWeek = ?;
			`,
			[openTime, closeTime, businessId, dayOfWeek]
		);
	}
	return [updatedBusinessHours];
}

async function getEmployees(req, _res){
	const findBusiness = req.body;
	const findBusinessID = findBusiness.businessID;

	if (!findBusinessID) throw new Error('Missing businessID');
	
	const rows = await getNByKeyQuery('Employee', 'businessId', findBusinessID);

	return rows;
}

export default {createOne, updateOneInfo, updateOneHours, deleteOne, getEmployees};