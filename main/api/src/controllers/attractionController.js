import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	//assuming req body has the attraction times as well.
	const newAttraction = req.body;
	const newAttractionID = crypto.randomUUID();

	const {name, description, location, uiImage, startingDay, endingDay} = newAttraction;

	await db.query(
		`
		INSERT INTO Attraction (attractionId, name, description, location, uiImage, startingDay, endingDay)
		VALUES(?, ?, ?, ?, ?, ?, ?);
		`,
		[newAttractionID, name, description, location, uiImage, startingDay, endingDay]
	);

	//create the hours tuple
	const {mondayOpen, mondayClose,	tuesdayOpen, tuesdayClose,	wednesdayOpen,	wednesdayClose,	thursdayOpen,	thursdayClose,
		fridayOpen,	fridayClose,	saturdayOpen,	saturdayClose,	sundayOpen,	sundayClose} = newAttraction;

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
				INSERT INTO AttractionHoursDay (attractionId, dayOfWeek, openTime, closeTime)
				VALUES(?, ?, ?, ?);
				`,
				[newAttractionID, dayOfWeek, openTime, closeTime]
			);
		}
	return sendJSON(res,
		201,
		{message: 'Attraction successfully created'}
	);
}

async function updateOneInfo(req, res){
	const updatedAttraction = req.body;
	const {name, description, location, uiImage, startingDay, endingDay} = updatedAttraction;

	await db.query(`
		UPDATE Attraction
		SET name = ?, description = ?, location = ?, uiImage = ?, startingDay = ?, endingDay = ?
		WHERE attractionId = ? AND deletedAt IS NULL
		`,
	[
		name, description, location, uiImage, startingDay, endingDay, updatedAttraction.attractionId
	]);

	return sendJSON(res,
		201,
		{message: 'Attraction successfully updated'}
	);
}

async function updateOneHours(req, res){
	const updatedAttractionHours = req.body;
	const {mondayOpen, mondayClose,	tuesdayOpen, tuesdayClose,	wednesdayOpen,	wednesdayClose,	thursdayOpen,	thursdayClose,
		fridayOpen,	fridayClose,	saturdayOpen,	saturdayClose,	sundayOpen,	sundayClose} = updatedAttractionHours;

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
			UPDATE AttractionHoursDay
			SET openTime = ?, closeTime = ?
			WHERE attractionId = ? AND dayOfWeek = ?;
			`,
		[
			openTime, closeTime, updatedAttractionHours.attractionId, dayOfWeek
		]);
	}
	return sendJSON(res,
		201,
		{message: 'Attraction hours successfully updated'}
	);
}

async function deleteOne(req, res){
	const deleteAttraction = req.body;
	const deleteAttractionID = deleteAttraction.attractionID;

	await db.query(`
		UPDATE Attraction
		SET deletedAt = CURRENT_DATE()
		WHERE attractionId = ? AND deletedAt IS NULL
		`,
	[
		deleteAttractionID
	]);
	
	return sendJSON(res,
		201,
		{message: 'Attraction successfully deleted'}
	);
}

async function getOne(req, res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;
	const [result] = await db.query(`
		SELECT *
		FROM Attraction
		WHERE attractionId = ? AND deletedAt IS NULL
		`,
	[
		findAttractionID
	]);

	return sendJSON(res,
		201,
		{attraction: result[0]}
	);
}

async function getOneHours(req, res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;
	const [result] = await db.query(`
		SELECT *
		FROM AttractionHoursDay
		WHERE attractionId = ?
		`,
	[
		findAttractionID
	]);
	
	return sendJSON(res,
		201,
		{result}
	);
}

export default {createOne, updateOneInfo, updateOneHours, deleteOne, getOne, getOneHours};