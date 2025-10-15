import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function signup(_req, res) {
	try {
		const [results] = await db.query('SELECT 1 + 1 AS solution');

		const solution = results[0].solution;

		// Now send the response *after* the query is complete
		return sendJSON(res, 201, { solution });
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
