import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	//assuming req body has the attraction times as well.
	const newAttraction = req.body;
	const newAttractionID = crypto.randomUUID();

	const {name, description, location, uiImage, startingDay, endingDay} = newAttraction;

	await createOneQuery('Attraction', { //NOTE, UI-IMAGE IS NOT AN ATTRIBUTE YET. PLEASE ADD LATER --- JOSEPH
		attractionId: newAttractionID,
		name,
		uiDescription: description,
		location,
		uiImage,
		startDate: startingDay,
		endDate: endingDay
	});

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
			await createOneQuery('AttractionHoursDay', {
				attractionId: newAttractionID,
				dayOfWeek,
				openTime,
				closeTime
			});
		}
}

async function updateOneInfo(req, _res){
	const updatedAttraction = req.body;

	if (!updatedAttraction || !updatedAttraction.attractionId) {
		throw new Error('Missing attraction data or attractionId');
	}

	const {attractionId, name, description, location, uiImage, startingDay, endingDay} = updatedAttraction;

	await updateOneQuery('Attraction', {
		attractionId,
		name,
		uiDescription: description,
		location,
		uiImage,
		startDate: startingDay,
		endDate: endingDay
	}, 'attractionId');

	return [updatedAttraction];
}

async function updateOneHours(req, _res){
	const updatedAttractionHours = req.body;

	if (!updatedAttractionHours || !updatedAttractionHours.attractionId) {
		throw new Error('Missing attraction data or attractionId');
	}

	const {attractionId, mondayOpen, mondayClose, tuesdayOpen, tuesdayClose, wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
		fridayOpen,	fridayClose, saturdayOpen, saturdayClose, sundayOpen, sundayClose} = updatedAttractionHours;

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
			UPDATE AttractionHoursDay
			SET openTime = ?, closeTime = ?
			WHERE attractionId = ? AND dayOfWeek = ?
			`,
			[openTime, closeTime, attractionId, dayOfWeek]
		);
	}

	return [updatedAttractionHours];
}

async function deleteOne(req, _res){
	const deleteAttraction = req.body;
	const deleteAttractionID = deleteAttraction.attractionID;

	if (!deleteAttractionID) throw new Error('Missing attractionID');

	// using db.query for soft delete
	await db.query(
		`
		UPDATE Attraction
		SET deletedAt = CURRENT_DATE()
		WHERE attractionId = ? AND deletedAt IS NULL
		`,
		[deleteAttractionID]
	);

	return [{ message: 'Attraction successfully deleted' }];
}

async function getOne(req, _res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;

	if (!findAttractionID) throw new Error('Missing attractionID');

	const rows = await getNByKeyQuery('Attraction', 'attractionId', findAttractionID);

	return [rows[0]];
}

async function getOneHours(req, _res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;

	if (!findAttractionID) throw new Error('Missing attractionID');

	const rows = await getNByKeyQuery('AttractionHoursDay', 'attractionId', findAttractionID, false);
	
	return rows;
}

export default {createOne, updateOneInfo, updateOneHours, deleteOne, getOne, getOneHours};