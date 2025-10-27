import crypto from 'crypto';
import { query } from '../db/mysql.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new diet record with optional schedule days.
 * @param {string} [req.body.specialNotes] - Special dietary notes
 * @param {Array<Object>} [req.body.scheduleDays] - Array of schedule day objects
 * @param {string} req.body.scheduleDays[].dayOfWeek - Day of week
 * @param {string} req.body.scheduleDays[].feedTime - Time to feed (HH:mm)
 * @param {string} req.body.scheduleDays[].food - Food to feed
 * @returns {Promise<Array>} Array containing the created diet object with generated dietId
 * @throws {Error} If diet data is missing
 */
async function createOne(req, _res) {
	const newDiet = req.body;

	if (!newDiet) throw new Error('Missing diet data');

	const dietId = crypto.randomUUID();

	const dietData = {
		dietId,
		specialNotes: newDiet.specialNotes || null,
		deletedAt: null,
	};

	await createOneQuery('Diet', dietData);

	// If schedule days are provided, create them
	if (newDiet.scheduleDays && Array.isArray(newDiet.scheduleDays)) {
		for (const day of newDiet.scheduleDays) {
			const dietScheduleDayId = crypto.randomUUID();
			await createOneQuery('DietScheduleDay', {
				dietScheduleDayId,
				dietId,
				dayOfWeek: day.dayOfWeek,
				feedTime: day.feedTime,
				food: day.food,
			});
		}
	}

	return [{ dietId, ...newDiet }];
}

/**
 * Retrieves a single diet by its ID.
 * @param {string} req.body.dietId - UUID of the diet to retrieve
 * @returns {Promise<Array>} Array containing the diet object
 * @throws {Error} If dietId is missing or no diet is found
 */
async function getOneById(req, _res) {
	const { dietId } = req.body;

	if (!dietId) throw new Error('Missing dietId');

	const rows = await getNByKeyQuery('Diet', 'dietId', dietId);

	return [rows[0]];
}

/**
 * Retrieves a diet with all its associated schedule days.
 * @param {string} req.body.dietId - UUID of the diet to retrieve
 * @returns {Promise<Array>} Array containing the diet object with scheduleDays array
 * @throws {Error} If dietId is missing or no diet is found
 */
async function getOneWithSchedule(req, _res) {
	const { dietId } = req.body;

	if (!dietId) throw new Error('Missing dietId');

	// Get diet info
	const dietRows = await getNByKeyQuery('Diet', 'dietId', dietId);
	const diet = dietRows[0];

	// Get schedule days
	const scheduleRows = await getNByKeyQuery(
		'DietScheduleDay',
		'dietId',
		dietId,
		false
	);

	return [{ ...diet, scheduleDays: scheduleRows }];
}

/**
 * Updates an existing diet record.
 * @param {string} req.body.dietId - UUID of the diet to update
 * @param {string} [req.body.specialNotes] - Updated special notes
 * @returns {Promise<Array>} Array containing the updated diet object
 * @throws {Error} If diet data or dietId is missing
 */
async function updateOne(req, _res) {
	const updatedDiet = req.body;

	if (!updatedDiet || !updatedDiet.dietId) {
		throw new Error('Missing diet data or dietId');
	}

	const { dietId, specialNotes } = updatedDiet;

	await updateOneQuery(
		'Diet',
		{
			dietId,
			specialNotes,
		},
		'dietId'
	);

	return [updatedDiet];
}

/**
 * Soft deletes a diet by setting its deletedAt timestamp.
 * @param {string} req.body.dietId - UUID of the diet to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If dietId is missing
 */
async function deleteOne(req, _res) {
	const { dietId } = req.body;

	if (!dietId) throw new Error('Missing dietId');

	// using query for soft delete
	await query(
		`
		UPDATE Diet
		SET deletedAt = CURRENT_TIMESTAMP()
		WHERE dietId = ? AND deletedAt IS NULL
		`,
		[dietId]
	);

	return [{ message: 'Diet successfully deleted' }];
}

/**
 * Adds a new feeding schedule day to an existing diet.
 * @param {string} req.body.dietId - UUID of the diet
 * @param {string} req.body.dayOfWeek - Day of week (Monday-Sunday)
 * @param {string} req.body.feedTime - Time to feed (HH:mm)
 * @param {string} req.body.food - Food to feed
 * @returns {Promise<Array>} Array containing the created schedule day object
 * @throws {Error} If required schedule day data is missing
 */
async function addScheduleDay(req, _res) {
	const { dietId, dayOfWeek, feedTime, food } = req.body;

	if (!dietId || !dayOfWeek || !feedTime || !food) {
		throw new Error('Missing required schedule day data');
	}

	const dietScheduleDayId = crypto.randomUUID();

	await createOneQuery('DietScheduleDay', {
		dietScheduleDayId,
		dietId,
		dayOfWeek,
		feedTime,
		food,
	});

	return [{ dietScheduleDayId, dietId, dayOfWeek, feedTime, food }];
}

/**
 * Retrieves all schedule days for a specific diet.
 * @param {string} req.body.dietId - UUID of the diet
 * @returns {Promise<Array>} Array of schedule day objects
 * @throws {Error} If dietId is missing or no schedule days are found
 */
async function getScheduleDaysByDiet(req, _res) {
	const { dietId } = req.body;

	if (!dietId) throw new Error('Missing dietId');

	const rows = await getNByKeyQuery('DietScheduleDay', 'dietId', dietId, false);

	return rows;
}

/**
 * Updates an existing diet schedule day.
 * @param {string} req.body.dietScheduleDayId - UUID of the schedule day to update
 * @param {string} [req.body.dayOfWeek] - Updated day of week
 * @param {string} [req.body.feedTime] - Updated feed time
 * @param {string} [req.body.food] - Updated food
 * @returns {Promise<Array>} Array containing the updated schedule day object
 * @throws {Error} If schedule day data or dietScheduleDayId is missing
 */
async function updateScheduleDay(req, _res) {
	const updatedScheduleDay = req.body;

	if (!updatedScheduleDay || !updatedScheduleDay.dietScheduleDayId) {
		throw new Error('Missing schedule day data or dietScheduleDayId');
	}

	await updateOneQuery(
		'DietScheduleDay',
		updatedScheduleDay,
		'dietScheduleDayId'
	);

	return [updatedScheduleDay];
}

/**
 * Deletes a diet schedule day (hard delete).
 * @param {string} req.body.dietScheduleDayId - UUID of the schedule day to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If dietScheduleDayId is missing
 */
async function deleteScheduleDay(req, _res) {
	const { dietScheduleDayId } = req.body;

	if (!dietScheduleDayId) throw new Error('Missing dietScheduleDayId');

	// using query for hard delete (cascade will handle this properly)
	await query(
		`
		DELETE FROM DietScheduleDay
		WHERE dietScheduleDayId = ?
		`,
		[dietScheduleDayId]
	);

	return [{ message: 'Schedule day successfully deleted' }];
}

/**
 * Retrieves all feeding schedules for a specific day of the week across all diets.
 * @param {string} req.body.dayOfWeek - Day of week (Monday-Sunday)
 * @returns {Promise<Array>} Array of schedule objects with diet information, ordered by feed time
 * @throws {Error} If dayOfWeek is missing
 */
async function getScheduleByDayOfWeek(req, _res) {
	const { dayOfWeek } = req.body;

	if (!dayOfWeek) throw new Error('Missing dayOfWeek');

	// using query to get all schedules for a specific day
	const rows = await query(
		`
		SELECT ds.*, d.specialNotes
		FROM DietScheduleDay ds
		JOIN Diet d ON ds.dietId = d.dietId
		WHERE ds.dayOfWeek = ? AND d.deletedAt IS NULL
		ORDER BY ds.feedTime ASC
		`,
		[dayOfWeek]
	);

	return rows;
}

export default {
	createOne,
	getOneById,
	getOneWithSchedule,
	updateOne,
	deleteOne,
	addScheduleDay,
	getScheduleDaysByDiet,
	updateScheduleDay,
	deleteScheduleDay,
	getScheduleByDayOfWeek,
};

