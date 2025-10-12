import { sendJSON } from '../utils/endpoint-utils.js';
// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

function signup(req, res) {
	sendJSON(res, 201, { message: 'Hello from the API!' });
}

function login(_req, _res) {
	// login logic here!
}

function logout(_req, _res) {
	// logout logic here!
}

export default { signup, login, logout };
