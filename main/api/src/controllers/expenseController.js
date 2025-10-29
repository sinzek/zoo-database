import crypto from 'crypto';
import { db } from '../db/mysql.js';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new expense record.
 * Managers can only add expenses to their own business.
 * Executives and above can add expenses to any business.
 * @param {string} req.body.expenseDescription - Description of the expense
 * @param {number} req.body.cost - Cost of the expense
 * @param {string} req.body.purchaseDate - Date/time of purchase
 * @param {string} req.body.businessId - UUID of the associated business
 * @returns {Promise<Array>} Array containing the created expense object with generated expenseId
 * @throws {Error} If expense data is missing or user doesn't have permission
 */
async function createOne(req, _res) {
	const newExpense = req.body;

	if (!newExpense) throw new Error('Missing expense data');

	// Get current employee data from req.user (set by withAccessLevel middleware)
	const employee = req.user.employeeData;
	const accessLevel = employee.accessLevel;

	// Managers can only add expenses to their own business
	if (accessLevel === 'manager') {
		if (!newExpense.businessId || newExpense.businessId !== employee.businessId) {
			throw new Error('Managers can only add expenses to their own business');
		}
	}
	// Executive and db_admin can add to any business

	const expenseId = crypto.randomUUID();

	const expenseData = {
		expenseId,
		expenseDescription: newExpense.expenseDescription,
		cost: newExpense.cost,
		purchaseDate: newExpense.purchaseDate,
		businessId: newExpense.businessId,
		deletedAt: null,
	};

	await createOneQuery('Expense', expenseData);

	return [{ expenseId, ...newExpense }];
}

/**
 * Retrieves a single expense by its ID.
 * @param {string} req.body.expenseId - UUID of the expense to retrieve
 * @returns {Promise<Array>} Array containing the expense object
 * @throws {Error} If expenseId is missing or no expense is found
 */
async function getOneById(req, _res) {
	const { expenseId } = req.body;

	if (!expenseId) throw new Error('Missing expenseId');

	const rows = await getNByKeyQuery('Expense', 'expenseId', expenseId);

	return [rows[0]];
}

/**
 * Retrieves all expenses for a specific business.
 * Managers can only view expenses for their own business.
 * Executives and above can view expenses for any business.
 * @param {string} req.body.businessId - UUID of the business
 * @returns {Promise<Array>} Array of expense objects
 * @throws {Error} If businessId is missing or no expenses are found
 */
async function getManyByBusiness(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	// Get current employee data
	const employee = req.user.employeeData;
	const accessLevel = employee.accessLevel;

	// For managers, verify they can only view expenses for their own business
	if (accessLevel === 'manager' && businessId !== employee.businessId) {
		throw new Error('Managers can only view expenses for their own business');
	}

	const rows = await getNByKeyQuery('Expense', 'businessId', businessId);

	return [rows];
}

/**
 * Retrieves expenses within a specified date range, optionally filtered by business.
 * @param {string} req.body.startDate - Start datetime for range
 * @param {string} req.body.endDate - End datetime for range
 * @param {string} [req.body.businessId] - UUID of the business (optional filter)
 * @returns {Promise<Array>} Array of expense objects ordered by purchase date (descending)
 * @throws {Error} If startDate or endDate is missing
 */
async function getManyByDateRange(req, _res) {
	const { startDate, endDate, businessId } = req.body;

	if (!startDate || !endDate) throw new Error('Missing startDate or endDate');

	// using db.query for date range query
	let query = `
		SELECT *
		FROM Expense
		WHERE purchaseDate >= ? AND purchaseDate <= ? AND deletedAt IS NULL
	`;
	const params = [startDate, endDate];

	// Optional filter by business
	if (businessId) {
		query += ` AND businessId = ?`;
		params.push(businessId);
	}

	query += ` ORDER BY purchaseDate DESC`;

	const rows = await db.query(query, params);

	return [rows];
}

/**
 * Calculates the total expenses for a specific business.
 * @param {string} req.body.businessId - UUID of the business
 * @returns {Promise<Array>} Array containing object with totalExpenses property
 * @throws {Error} If businessId is missing
 */
async function getTotalByBusiness(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	// using db.query for aggregation
	const rows = await db.query(
		`
		SELECT SUM(cost) as totalExpenses
		FROM Expense
		WHERE businessId = ? AND deletedAt IS NULL
		`,
		[businessId]
	);

	return [{ totalExpenses: rows[0]?.totalExpenses || 0 }];
}

/**
 * Updates an existing expense record.
 * Managers can only update expenses for their own business.
 * Executives and above can update expenses for any business.
 * @param {string} req.body.expenseId - UUID of the expense to update
 * @param {string} [req.body.expenseDescription] - Updated description
 * @param {number} [req.body.cost] - Updated cost
 * @param {string} [req.body.purchaseDate] - Updated purchase date
 * @returns {Promise<Array>} Array containing the updated expense object
 * @throws {Error} If expense data or expenseId is missing or user doesn't have permission
 */
async function updateOne(req, _res) {
	const updatedExpense = req.body;

	if (!updatedExpense || !updatedExpense.expenseId) {
		throw new Error('Missing expense data or expenseId');
	}

	// Get current employee data
	const employee = req.user.employeeData;
	const accessLevel = employee.accessLevel;

	// For managers, verify they can only update expenses for their own business
	if (accessLevel === 'manager') {
		const [existingExpense] = await getNByKeyQuery('Expense', 'expenseId', updatedExpense.expenseId);
		if (!existingExpense || existingExpense.businessId !== employee.businessId) {
			throw new Error('Managers can only update expenses for their own business');
		}
	}

	const newExpenseData = { ...updatedExpense };

	await updateOneQuery('Expense', newExpenseData, 'expenseId');

	return [updatedExpense];
}

/**
 * Soft deletes an expense by setting its deletedAt timestamp.
 * Managers can only delete expenses for their own business.
 * Executives and above can delete expenses for any business.
 * @param {string} req.body.expenseId - UUID of the expense to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If expenseId is missing or user doesn't have permission
 */
async function deleteOne(req, _res) {
	const { expenseId } = req.body;

	if (!expenseId) throw new Error('Missing expenseId');

	// Get current employee data
	const employee = req.user.employeeData;
	const accessLevel = employee.accessLevel;

	// For managers, verify they can only delete expenses for their own business
	if (accessLevel === 'manager') {
		const [existingExpense] = await getNByKeyQuery('Expense', 'expenseId', expenseId);
		if (!existingExpense || existingExpense.businessId !== employee.businessId) {
			throw new Error('Managers can only delete expenses for their own business');
		}
	}

	// using db.query for soft delete
	await db.query(
		`
		UPDATE Expense
		SET deletedAt = CURRENT_TIMESTAMP()
		WHERE expenseId = ? AND deletedAt IS NULL
		`,
		[expenseId]
	);

	return [{ message: 'Expense successfully deleted' }];
}

export default {
	createOne,
	getOneById,
	getManyByBusiness,
	getManyByDateRange,
	getTotalByBusiness,
	updateOne,
	deleteOne,
};
