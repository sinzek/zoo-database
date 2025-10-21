import { query } from '../db/mysql.js';
import { sha256Hash, signJWT } from '../utils/auth-utils.js';

// im using underscore-prefixed variables to avoid linting errors
// about unused variables since these are just placeholders

async function login(req, res) {
	const { email, password } = req.body;

	if (!email || !password) throw new Error('Missing email or password');

	const hashedPwd = sha256Hash(password);

	const [user] = await query(
		`SELECT * FROM Credentials WHERE email = ? AND passwordHash = ?`,
		[email, hashedPwd]
	);

	if (!user) throw new Error('Invalid email or password');

	const token = signJWT({ id: user.userId });

	res.setHeader('Set-Cookie', [
		`session=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict; Secure`,
	]); // 30 days

	return [user];
}

async function logout(_req, res) {
	res.setHeader('Set-Cookie', [
		`session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
	]);

	return [null, [], 204]; // no content status
}

export default { login, logout };
