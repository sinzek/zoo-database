import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../db/mysql.js';
import { getNByKeyQuery } from './query-utils.js';
import { ACCESS_LEVELS } from '../constants/accessLevels.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * For hashing passwords using SHA-256 (this is pretty insecure, but it's good enough for this project lol)
 * @param {string} password
 * @returns {string} Hashed password
 */
export function sha256Hash(password) {
	if (typeof password !== 'string') {
		throw new Error('Password must be a string');
	}

	return crypto.createHash('sha256').update(password).digest('hex');
}

export function signJWT(data) {
	return jwt.sign(
		{
			expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
			data,
		},
		JWT_SECRET
	);
}

export function verifyJWT(token) {
	return jwt.verify(token, JWT_SECRET);
}

export async function getCustomerOrEmployeeById(userId) {
	// first try to find a customer with this userId
	const [customer] = await query(`SELECT * FROM Customer WHERE userId = ?`, [
		userId,
	]);

	if (customer) {
		return { type: 'customer', data: customer };
	}

	const [employee] = await query(`SELECT * FROM Employee WHERE userId = ?`, [
		userId,
	]);

	if (employee) {
		return { type: 'employee', data: employee };
	}

	return null;
}

export async function createUser(email, password) {
	const userId = crypto.randomUUID();

	const passwordHash = sha256Hash(password);

	await query(
		`INSERT INTO User (userId, email, passwordHash) VALUES (?, ?, ?)`,
		[userId, email, passwordHash]
	);

	return { userId, email };
}

/**
 * Middleware to protect routes that require authentication (user must be logged in).
 * Provides `req.user` with decoded JWT data if valid. This means the `userId` is available at `req.user.data.id` from a controller function wrapped by this.
 * @param {Function} handler 
 * @returns {Function}
 */
export const withAuth = (handler) => async (req, res) => {
	try {
		const cookie = req.headers.cookie || '';
		const token = cookie
			.split('; ')
			.find((c) => c.startsWith('session='))
			?.split('=')[1];
		const decoded = verifyJWT(token);
		req.user = decoded; // userId now available in req object
		return handler(req, res);
	} catch {
		return ['Unauthorized', [], 401];
	}
};

/**
 * Middleware to protect routes that require a specific access level (on employee-only routes). Provides `req.user.employeeData` for use within controller functions wrapped by this.
 * @param {'worker' | 'zookeeper' | 'veterinarian' | 'manager' | 'executive' | 'db_admin'} requiredLevel 
 * @param {Function} handler 
 * @returns {Function}
 */
export async function withAccessLevel(requiredLevel, handler) {
	return withAuth(async (req, res) => {
		const userId = req.user.data.id;

		const [employee] = await getNByKeyQuery('Employee', 'userId', userId);

		if(!employee || ACCESS_LEVELS[employee.accessLevel] < ACCESS_LEVELS[requiredLevel]) {
			return ['Forbidden', [], 403];
		}

		req.user.employeeData = employee;
		return handler(req, res);
	});
}