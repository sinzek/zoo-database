import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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
