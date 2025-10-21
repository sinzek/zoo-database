import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../db/mysql.js';

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
