import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getAllQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

// we need to clean this up later, too much repetition

/**
 * Creates a new attraction with operating hours for each day of the week.
 * @param {Object} req.body - Request body containing attraction data and hours
 * @param {string} req.body.name - Attraction name
 * @param {string} [req.body.description] - Attraction description
 * @param {string} req.body.location - Location of the attraction
 * @param {string} [req.body.uiImage] - Image URL for UI
 * @param {string} [req.body.startingDay] - Start date of the attraction
 * @param {string} [req.body.endingDay] - End date of the attraction
 * @param {string} req.body.mondayOpen - Monday opening time
 * @param {string} req.body.mondayClose - Monday closing time
 * @param {string} req.body.tuesdayOpen - Tuesday opening time
 * @param {string} req.body.tuesdayClose - Tuesday closing time
 * @param {string} req.body.wednesdayOpen - Wednesday opening time
 * @param {string} req.body.wednesdayClose - Wednesday closing time
 * @param {string} req.body.thursdayOpen - Thursday opening time
 * @param {string} req.body.thursdayClose - Thursday closing time
 * @param {string} req.body.fridayOpen - Friday opening time
 * @param {string} req.body.fridayClose - Friday closing time
 * @param {string} req.body.saturdayOpen - Saturday opening time
 * @param {string} req.body.saturdayClose - Saturday closing time
 * @param {string} req.body.sundayOpen - Sunday opening time
 * @param {string} req.body.sundayClose - Sunday closing time
 * @returns {Promise<void>}
 */
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

	//create the hours tuple only if provided
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

		// Only create hours if both open and close times are provided for a day
		for (const [dayOfWeek, openTime, closeTime] of hours){
			if (openTime && closeTime) {
				const hoursId = crypto.randomUUID();
				await createOneQuery('AttractionHoursDay', {
					attractionHoursDayId: hoursId,
					attractionId: newAttractionID,
					dayOfWeek,
					openTime,
					closeTime
				});
			}
		}
}

/**
 * Updates an attraction's basic information (not hours).
 * @param {string} req.body.attractionId - UUID of the attraction to update
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.description] - Updated description
 * @param {string} [req.body.location] - Updated location
 * @param {string} [req.body.uiImage] - Updated image URL
 * @param {string} [req.body.startingDay] - Updated start date
 * @param {string} [req.body.endingDay] - Updated end date
 * @returns {Promise<Array>} Array containing the updated attraction object
 * @throws {Error} If attraction data or attractionId is missing
 */
async function updateOneInfo(req, _res){
	const updatedAttraction = req.body;

	if (!updatedAttraction || !updatedAttraction.attractionId) {
		throw new Error('Missing attraction data or attractionId');
	}

	const {attractionId, name, description, location, uiImage, startingDay, endingDay, mondayOpen, mondayClose, tuesdayOpen, tuesdayClose, wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
		fridayOpen, fridayClose, saturdayOpen, saturdayClose, sundayOpen, sundayClose} = updatedAttraction;

	console.log('Received hours data:', {
		mondayOpen, mondayClose,
		tuesdayOpen, tuesdayClose,
		wednesdayOpen, wednesdayClose,
		thursdayOpen, thursdayClose,
		fridayOpen, fridayClose,
		saturdayOpen, saturdayClose,
		sundayOpen, sundayClose
	});

	// Update basic attraction info
	await updateOneQuery('Attraction', {
		attractionId,
		name,
		uiDescription: description,
		location,
		uiImage,
		startDate: startingDay,
		endDate: endingDay
	}, 'attractionId');

	// Handle operating hours - update existing or create new
	if (mondayOpen !== undefined || mondayClose !== undefined || tuesdayOpen !== undefined || tuesdayClose !== undefined 
		|| wednesdayOpen !== undefined || wednesdayClose !== undefined || thursdayOpen !== undefined || thursdayClose !== undefined
		|| fridayOpen !== undefined || fridayClose !== undefined || saturdayOpen !== undefined || saturdayClose !== undefined
		|| sundayOpen !== undefined || sundayClose !== undefined) {
		
		const hours = [
			['Sunday', sundayOpen, sundayClose],
			['Monday', mondayOpen, mondayClose],
			['Tuesday', tuesdayOpen, tuesdayClose],
			['Wednesday', wednesdayOpen, wednesdayClose],
			['Thursday', thursdayOpen, thursdayClose],
			['Friday', fridayOpen, fridayClose],
			['Saturday', saturdayOpen, saturdayClose]
		];

		// Helper to normalize "HH:MM" -> "HH:MM:00"
		const normalizeTime = (t) => {
			if (t === null || t === undefined) return t;
			if (typeof t !== 'string') return t;
			const trimmed = t.trim();
			if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
			return trimmed;
		};

		for (const [dayOfWeek, rawOpen, rawClose] of hours){
			const openTime = normalizeTime(rawOpen);
			const closeTime = normalizeTime(rawClose);
			const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

			console.log(`${dayOfWeek}:`, { rawOpen, rawClose, openTime, closeTime, openEmpty: isEmpty(openTime), closeEmpty: isEmpty(closeTime) });

			// If both times provided and non-empty -> UPSERT (update if exists, else insert)
			if (!isEmpty(openTime) && !isEmpty(closeTime)) {
				try {
					// Try UPDATE first
					const updateResult = await db.query(
						`UPDATE AttractionHoursDay SET openTime = ?, closeTime = ? WHERE attractionId = ? AND dayOfWeek = ?`,
						[openTime, closeTime, attractionId, dayOfWeek]
					);
					const affected = updateResult?.affectedRows ?? updateResult?.[0]?.affectedRows;
					console.log(`Attempted update for ${dayOfWeek}, affected rows:`, affected);

					if (!affected || affected === 0) {
						// No row to update -> INSERT
						const hoursId = crypto.randomUUID();
						const insertResult = await db.query(
							`INSERT INTO AttractionHoursDay (attractionHoursDayId, attractionId, dayOfWeek, openTime, closeTime) VALUES (?, ?, ?, ?, ?)`,
							[hoursId, attractionId, dayOfWeek, openTime, closeTime]
						);
						console.log(`Inserted new hours for ${dayOfWeek}`, insertResult?.affectedRows ?? insertResult);
					} else {
						console.log(`Updated existing hours for ${dayOfWeek}`);
					}
				} catch (err) {
					console.error(`Failed to upsert hours for ${dayOfWeek}:`, { openTime, closeTime, err: err?.message || err });
				}
			} else {
				// If any field is empty/undefined/null -> DELETE existing hours for this day
				try {
					const deleteResult = await db.query(
						`DELETE FROM AttractionHoursDay WHERE attractionId = ? AND dayOfWeek = ?`,
						[attractionId, dayOfWeek]
					);
					console.log(`Deleted hours for ${dayOfWeek}, affected rows:`, deleteResult.affectedRows);
				} catch (err) {
					console.error(`Failed to delete hours for ${dayOfWeek}:`, err?.message || err);
				}
			}
		}
	}

	return [updatedAttraction];
}

/**
 * Updates an attraction's operating hours for all days of the week.
 * @param {string} req.body.attractionId - UUID of the attraction
 * @param {string} req.body.mondayOpen - Monday opening time
 * @param {string} req.body.mondayClose - Monday closing time
 * @param {string} req.body.tuesdayOpen - Tuesday opening time
 * @param {string} req.body.tuesdayClose - Tuesday closing time
 * @param {string} req.body.wednesdayOpen - Wednesday opening time
 * @param {string} req.body.wednesdayClose - Wednesday closing time
 * @param {string} req.body.thursdayOpen - Thursday opening time
 * @param {string} req.body.thursdayClose - Thursday closing time
 * @param {string} req.body.fridayOpen - Friday opening time
 * @param {string} req.body.fridayClose - Friday closing time
 * @param {string} req.body.saturdayOpen - Saturday opening time
 * @param {string} req.body.saturdayClose - Saturday closing time
 * @param {string} req.body.sundayOpen - Sunday opening time
 * @param {string} req.body.sundayClose - Sunday closing time
 * @returns {Promise<Array>} Array containing the updated hours object
 * @throws {Error} If attraction data or attractionId is missing
 */
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

/**
 * Soft deletes an attraction by setting its deletedAt timestamp.
 * @param {string} req.body.attractionID - UUID of the attraction to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If attractionID is missing
 */
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

/**
 * Retrieves a single attraction by its ID.
 * @param {string} req.body.attractionID - UUID of the attraction to retrieve
 * @returns {Promise<Array>} Array containing the attraction object
 * @throws {Error} If attractionID is missing or no attraction is found
 */
async function getOne(req, _res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;

	if (!findAttractionID) throw new Error('Missing attractionID');

	const rows = await getNByKeyQuery('Attraction', 'attractionId', findAttractionID);

	return [rows[0]];
}

/**
 * Retrieves the operating hours for a specific attraction.
 * @param {string} req.body.attractionID - UUID of the attraction
 * @returns {Promise<Array>} Array of hours objects for each day of the week
 * @throws {Error} If attractionID is missing or no hours are found
 */
async function getOneHours(req, _res){
	const findAttraction = req.body;
	const findAttractionID = findAttraction.attractionID;

	if (!findAttractionID) throw new Error('Missing attractionID');

	const rows = await getNByKeyQuery('AttractionHoursDay', 'attractionId', findAttractionID, false);
	
	return rows;
}

/**
 * Retrieves all non-deleted attractions from the database with their operating hours.
 * @returns {Promise<Array>} Array of all attraction objects with operating hours
 */
async function getAll(_req, _res) {
	try {
		const attractions = await getAllQuery('Attraction');
		
		// For each attraction, get its operating hours
		for (const attraction of attractions) {
			try {
				const hours = await getNByKeyQuery('AttractionHoursDay', 'attractionId', attraction.attractionId, false);
				attraction.hours = hours || [];
			} catch {
				// No hours found for this attraction
				attraction.hours = [];
			}
		}
		
		return [attractions];
	} catch {
		// Return empty array if no attractions found
		return [[]];
	}
}

export default {createOne, updateOneInfo, updateOneHours, deleteOne, getOne, getOneHours, getAll};