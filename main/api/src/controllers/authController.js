import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import {
	sha256Hash,
	validatePasswordRules,
	validateStrings,
} from '../utils/auth-utils.js';
// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function signup(req, res) {
	const { newUser } = req.body;
	const { email, password, firstName, lastName, middleInitial } = newUser;

	if (
		!validateStrings(email, firstName, lastName) ||
		!password ||
		password.trim() === ''
	) {
		return sendJSON(res, 400, {
			error: 'Missing required fields',
			fields: { email, password, firstName, lastName },
		});
	}

	const { valid, error: errMsg } = validatePasswordRules(password);
	if (!valid) {
		return sendJSON(res, 400, { error: errMsg });
	}

	const hashedPassword = sha256Hash(password);
	const MI = middleInitial || null;

	try {
		// will throw ER_DUP_ENTRY, code 1062 if email already exists
		await db.query(
			`
		INSERT INTO Customer (customerId, firstName, lastName, middleInitial, email, password, deletedAt)
		VALUES (UUID(), ?, ?, ?, ?, ?, NULL);
		`,
			[firstName, lastName, MI, email, hashedPassword]
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

		return sendJSON(res, 201, { user: newUserData });
	} catch (err) {
		console.error('Error executing query:', err);
		return sendJSON(res, 500, { error: 'Database query error' });
	}
	// signup logic here!
	// just a test response for now
}

async function login(_req, _res) {
	// login logic here!
}

async function logout(_req, _res) {
	// logout logic here!
}

export default { signup, login, logout };
