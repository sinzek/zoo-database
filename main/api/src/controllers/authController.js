import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import {
	createSession,
	determineEmptyFields,
	sha256Hash,
	validateStrings,
} from '../utils/auth-utils.js';
import { validatePasswordRules } from '../../../src/pages/signup/utils.js';
import crypto from 'crypto';
// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function signup(req, res) {
	const newUser = req.body;

	console.log(req.body);

	if (!newUser || typeof newUser !== 'object') {
		return sendJSON(res, 400, { error: 'Invalid request body' });
	}

	const { email, password, firstName, lastName, middleInitial } = newUser;

	if (
		!validateStrings(email, firstName, lastName) ||
		!password ||
		password.trim() === ''
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			affectedFields: determineEmptyFields(newUser),
		});
	}

	const { valid, error: errMsg } = validatePasswordRules(password);
	if (!valid) {
		return sendJSON(res, 400, { error: errMsg });
	}

	const hashedPassword = sha256Hash(password);
	const MI = middleInitial || null;

	try {
		const newUUID = crypto.randomUUID();

		// will throw ER_DUP_ENTRY, code 1062 if email already exists
		await db.query(
			`
		INSERT INTO Customer (customerId, firstName, lastName, middleInitial, email, passwordHash, deletedAt)
		VALUES (?, ?, ?, ?, ?, ?, NULL);
		`,
			[newUUID, firstName, lastName, MI, email, hashedPassword]
		);

		// now fetch the newly created user to return to the client
		const [results] = await db.query(
			`
		SELECT customerId, firstName, lastName, middleInitial, joinDate, email
		FROM Customer
		WHERE email = ?;
		`,
			[email]
		);

		if (results.length === 0) {
			// this should never happen since we just inserted it
			throw new Error('Newly created user not found');
		}

		const newUserData = results[0];

		return sendJSON(
			res,
			201,
			{ user: newUserData },
			// cookies to send (all will be HttpOnly and Secure)
			[
				{
					name: 'session',
					value: await createSession(newUserData.customerId),
				},
			]
		);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return sendJSON(res, 409, {
				error: 'Email already in use',
				affectedFields: ['email'],
			});
		}

		console.error('Error executing query:', err);
		return sendJSON(res, 500, { error: 'Database query error' });
	}
	// signup logic here!
	// just a test response for now
}

async function login(_req, _res) {
	/**
	 * We'll need to:
	 * 1. Validate the request body (email and password)
	 * 2. Hash the provided password
	 * 3. Check if the email exists in the customer table or employee table with the hashed password
	 * 4. If found in one of those tables, create a session and return user data (excluding password hash)
	 * 5. If not found, return an error response
	 */
}

async function logout(_req, _res) {
	// logout logic here!
}

export default { signup, login, logout };
