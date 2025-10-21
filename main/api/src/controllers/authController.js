import { query } from '../db/mysql.js';
import { sha256Hash, signJWT } from '../utils/auth-utils.js';
import { getCustomerOrEmployeeById } from '../utils/auth-utils.js';

// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function login(req, _res) {
	const { email, password } = req.body;

	if (!email || !password) throw new Error('Missing email or password');

	const hashedPwd = sha256Hash(password);

	const [user] = await query(
		`SELECT * FROM User WHERE email = ? AND passwordHash = ?`,
		[email, hashedPwd]
	);

	if (!user) throw new Error('Invalid email or password');

	// now find either the customer or employee record with userId = user.userId
	const relatedInfo = await getCustomerOrEmployeeById(user.userId);

	if (!relatedInfo) throw new Error('No user found for given credentials'); // should not happen

	const token = signJWT({ id: user.userId });

	const cookie = {
		name: 'session',
		value: token,
		options: {
			HttpOnly: true,
			Path: '/',
			MaxAge: 30 * 24 * 60 * 60, // 30 days
			SameSite: 'Strict',
			Secure: true,
		},
	};

	return [
		{ user: { userId: user.userId, email: user.email }, relatedInfo },
		[cookie],
	]; // omit passwordHash
}

async function logout(_req, _res) {
	console.log('LOGOUT CALLED');

	const expiredCookie = {
		name: 'session',
		value: '',
		options: {
			HttpOnly: true,
			Path: '/',
			MaxAge: 0,
			SameSite: 'Strict',
			Secure: true,
		},
	};

	return [null, [expiredCookie], 204]; // no content status
}

async function getUserData(req, _res) {
	const userId = req.session.data.id;
	console.log('GET USER DATA CALLED FOR USER ID:', userId);

	const [user] = await query(
		`SELECT userId, email FROM User WHERE userId = ?`,
		[userId]
	);

	if (!user) throw new Error('User not found!');

	const relatedInfo = await getCustomerOrEmployeeById(user.userId);

	if (!relatedInfo) throw new Error('No related user info found'); // should not happen

	return [{ user, relatedInfo }]; // omit passwordHash
}

export default { login, logout, getUserData };
