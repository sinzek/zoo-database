import crypto from 'crypto';
import {
	createOneQuery,
	deleteOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';
import { query } from '../db/mysql.js';

/**
 * Creates a new shift record.
 * @param {string} req.body.start - Shift start datetime
 * @param {string} req.body.end - Shift end datetime
 * @param {string} [req.body.attractionId] - UUID of associated attraction (optional)
 * @returns {Promise<Array>} Array containing the created shift object with generated shiftId
 * @throws {Error} If shift data is missing
 */
async function createOne(req, _res) {
	const newShift = req.body;

	if (!newShift) throw new Error('Missing shift data');

	const shiftId = crypto.randomUUID();

	const shiftData = {
		shiftId,
		start: new Date(newShift.start),
		end: new Date(newShift.end),
		attractionId: newShift.attractionId || null,
		deletedAt: null,
	};

	await createOneQuery('Shift', shiftData);

	return [{ shift: shiftData }];
}

/**
 * Retrieves a single shift by its ID.
 * @param {string} req.body.shiftId - UUID of the shift to retrieve
 * @returns {Promise<Array>} Array containing the shift object
 * @throws {Error} If shiftId is missing or no shift is found
 */
async function getOneById(req, _res) {
	const { shiftId } = req.body;

	if (!shiftId) throw new Error('Missing shiftId');

	const rows = await getNByKeyQuery('Shift', 'shiftId', shiftId);

	return [rows[0]];
}

/**
 * Retrieves all shifts associated with a specific attraction.
 * @param {string} req.body.attractionId - UUID of the attraction
 * @returns {Promise<Array>} Array of shift objects
 * @throws {Error} If attractionId is missing or no shifts are found
 */
async function getNByAttraction(req, _res) {
	const { attractionId } = req.body;

	if (!attractionId) throw new Error('Missing attractionId');

	const rows = await getNByKeyQuery('Shift', 'attractionId', attractionId);

	return [rows];
}

/**
 * Retrieves all shifts within a specified date range.
 * @param {string} req.body.startDate - Start datetime for range
 * @param {string} req.body.endDate - End datetime for range
 * @returns {Promise<Array>} Array of shift objects ordered by start time
 * @throws {Error} If startDate or endDate is missing
 */
async function getNByDateRange(req, _res) {
	const { startDate, endDate } = req.body;

	if (!startDate || !endDate) throw new Error('Missing startDate or endDate');

	// using db.query for date range query
	const rows = await query(
		`
		SELECT *
		FROM Shift
		WHERE start >= ? AND end <= ? AND deletedAt IS NULL
		ORDER BY start ASC
		`,
		[startDate, endDate]
	);

	for (const row of rows) {
		const shiftId = row.shiftId;

		const assignedEmployees = await query(
			`
			SELECT e.*, ets.totalHours, ets.shiftTakenId
			FROM Employee e
			JOIN EmployeeTakesShift ets ON e.employeeId = ets.employeeId
			WHERE ets.shiftId = ? AND e.deletedAt IS NULL
			`,
			[shiftId]
		);

		row.assignedEmployees = assignedEmployees || [];
	}

	return [rows];
}

/**
 * Updates an existing shift record.
 * @param {string} req.body.shiftId - UUID of the shift to update
 * @param {string} [req.body.start] - Updated start datetime
 * @param {string} [req.body.end] - Updated end datetime
 * @param {string} [req.body.attractionId] - Updated attraction ID
 * @returns {Promise<Array>} Array containing the updated shift object
 * @throws {Error} If shift data or shiftId is missing
 */
async function updateOne(req, _res) {
	const updatedShift = req.body;

	if (!updatedShift || !updatedShift.shiftId) {
		throw new Error('Missing shift data or shiftId');
	}

	const newShiftData = { ...updatedShift };

	await updateOneQuery('Shift', newShiftData, 'shiftId');

	return [updatedShift];
}

/**
 * Soft deletes a shift by setting its deletedAt timestamp.
 * @param {string} req.body.shiftId - UUID of the shift to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If shiftId is missing
 */
async function deleteOne(req, _res) {
	const { shiftId } = req.body;

	if (!shiftId) throw new Error('Missing shiftId');

	await deleteOneQuery('Shift', 'shiftId', shiftId);

	return [{ message: 'Shift successfully deleted' }];
}

/**
 * Assigns an employee to a shift.
 * @param {string} req.body.shiftId - UUID of the shift
 * @param {string} req.body.employeeId - UUID of the employee
 * @param {number} req.body.totalHours - Total hours for this shift assignment
 * @returns {Promise<Array>} Array containing the created assignment with generated shiftTakenId
 * @throws {Error} If shiftId, employeeId, or totalHours is missing
 */
async function assignOneEmployeeToShift(req, _res) {
	const { shiftId, employeeId, totalHours } = req.body;

	if (!shiftId || !employeeId || !totalHours) {
		throw new Error('Missing shiftId, employeeId, or totalHours');
	}

	const shiftTakenId = crypto.randomUUID();

	await createOneQuery('EmployeeTakesShift', {
		shiftTakenId,
		shiftId,
		employeeId,
		totalHours,
	});

	return [{ shiftTakenId, shiftId, employeeId, totalHours }];
}

/**
 * Retrieves all employees assigned to a specific shift.
 * @param {string} req.body.shiftId - UUID of the shift
 * @returns {Promise<Array>} Array of employee objects with shift assignment details
 * @throws {Error} If shiftId is missing
 */
async function getNEmployeesByShift(req, _res) {
	const { shiftId } = req.body;

	if (!shiftId) throw new Error('Missing shiftId');

	const employees = query(
		`
		SELECT e.*, ets.totalHours, ets.shiftTakenId
		FROM Employee e
		JOIN EmployeeTakesShift ets ON e.employeeId = ets.employeeId
		WHERE ets.shiftId = ? AND e.deletedAt IS NULL
		`,
		[shiftId]
	);

	return [employees];
}

/**
 * Retrieves all shifts assigned to a specific employee.
 * @param {string} req.body.employeeId - UUID of the employee
 * @returns {Promise<Array>} Array of shift objects with assignment details, ordered by start time (descending)
 * @throws {Error} If employeeId is missing
 */
async function getNByEmployee(req, _res) {
	const { employeeId } = req.body;

	if (!employeeId) throw new Error('Missing employeeId');

	// using db.query for join query
	const shifts = await query(
		`
		SELECT s.*, ets.totalHours, ets.shiftTakenId
		FROM Shift s, EmployeeTakesShift ets
		WHERE s.shiftId = ets.shiftId AND ets.employeeId = ? AND s.deletedAt IS NULL
		ORDER BY s.start DESC
		`,
		[employeeId]
	);

	if (!shifts || shifts.length === 0) {
		return [[]];
	}

	const shiftsWithClockTimes = await Promise.all(
		shifts.map(async (shift) => {
			// we do not want to throw an error if no clock times are found for a shift
			try {
				const clockTimes = await getNByKeyQuery(
					'EmployeeClockTime',
					'shiftId',
					shift.shiftId,
					false
				);

				return {
					...shift,
					clockTimes,
				};
			} catch (err) {
				if (err.message.includes('No records found')) {
					return {
						...shift,
						clockTimes: [],
					};
				}
			}

			return shift;
		})
	);

	return [shiftsWithClockTimes];
}

/**
 * Removes an employee from a shift (hard delete).
 * @param {string} req.body.shiftTakenId - UUID of the shift assignment to remove
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If shiftTakenId is missing
 */
async function removeOneEmployeeFromShift(req, _res) {
	const { shiftTakenId } = req.body;

	if (!shiftTakenId) throw new Error('Missing shiftTakenId');

	deleteOneQuery('EmployeeTakesShift', 'shiftTakenId', shiftTakenId);

	return [{ message: 'Employee removed from shift successfully' }];
}

export default {
	createOne,
	getOneById,
	getNByAttraction,
	getNByDateRange,
	updateOne,
	deleteOne,
	assignOneEmployeeToShift,
	getNEmployeesByShift,
	getNByEmployee,
	removeOneEmployeeFromShift,
};
