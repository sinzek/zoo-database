import { sendJSON } from '../utils/endpoint-utils.js';
// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function signup(req, res) {
	return sendJSON(res, 201, { message: 'Hello from the API!' });
}

async function login(_req, _res) {
	// login logic here!
}

async function logout(_req, _res) {
	// logout logic here!
}

export default { signup, login, logout };
