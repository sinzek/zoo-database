import crypto from 'crypto';
import { db } from '../db/mysql';

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

/**
 * Attempts to validate that all provided strings are non-empty and do not contain potentially dangerous characters.
 * @param  {...string} strings Array of strings to validate
 * @returns {boolean} false if one is not valid, true if all valid
 */
export function validateStrings(...strings) {
	for (const str of strings) {
		if (typeof str !== 'string' || str.trim() === '') {
			return false;
		}

		if (
			str.includes("'") ||
			str.includes('"') ||
			str.includes('<') ||
			str.includes('>') ||
			str.includes(';') ||
			str.includes('--')
		) {
			return false; // basic check to prevent SQL injection
		}
	}

	return true;
}

export function determineEmptyFields(obj) {
	const affected = [];
	for (const [key, value] of Object.entries(obj)) {
		if (!value || (typeof value === 'string' && value.trim() === '')) {
			affected.push(key);
		}
	}

	return affected;
}

/**
 * Creates a new authentication session for either a customer or an employee. Only one of customerId or employeeId should be provided.
 * @param {string} customerId Optional ID of customer
 * @param {string} employeeId Optional ID of employee
 * @returns {Promise<string>} ID of newly created session
 */
export async function createSession(customerId, employeeId) {
	if (!customerId && !employeeId) {
		throw new Error(
			'Must provide either customerId or employeeId to create a session'
		);
	}

	if (customerId && employeeId) {
		throw new Error(
			'Cannot provide both customerId and employeeId to create a session'
		);
	}

	const uuid = crypto.randomUUID();

	// add session to db, return session id to be stored in cookie
	await db.query(
		`INSERT INTO AuthSession (id, customerId, employeeId) VALUES (?, ?, ?)`,
		[uuid, customerId || null, employeeId || null]
	);

	// successful, return session id
	return uuid;
}
