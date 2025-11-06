import { query } from '../db/mysql.js';
import { sha256Hash, signJWT } from '../utils/auth-utils.js';
import { getCustomerOrEmployeeById } from '../utils/auth-utils.js';
import { checkIfUserHasExpiredMembership } from '../utils/notif-utils.js';
import { getMembershipByCustomerId } from '../utils/other-utils.js';
import { createOneQuery } from '../utils/query-utils.js';
import crypto from 'crypto';

async function signup(req, _res) {
	const { email, password, firstName, lastName, middleInitial } = req.body;

	if (!email || !password || !firstName || !lastName) {
		throw new Error('Missing required signup fields');
	}

	// check if email already exists
	const [existingUser] = await query(
		`SELECT userId FROM User WHERE email = ?`,
		[email]
	);

	if (existingUser) {
		throw new Error('Email already in use');
	}

	const hashedPwd = sha256Hash(password);
	const newUserId = crypto.randomUUID();

	const newUser = {
		userId: newUserId,
		email,
		passwordHash: hashedPwd,
	};

	// create new user
	await createOneQuery('User', newUser);

	// create customer record
	const newCustomerId = crypto.randomUUID();
	const newCustomer = {
		customerId: newCustomerId,
		firstName,
		lastName,
		middleInitial: middleInitial || null,
		joinDate: new Date(),
		deletedAt: null,
		userId: newUserId,
	};

	await createOneQuery('Customer', newCustomer);

	const token = signJWT({ id: newUserId });

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
		{
			user: { userId: newUserId, email: email },
			relatedInfo: { type: 'customer', data: newCustomer },
		},
		[cookie],
	]; // omit passwordHash
}

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

	let membership = null;

	if (relatedInfo.type === 'customer') {
		membership = await getMembershipByCustomerId(user.userId);
	}

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
		{
			user: { userId: user.userId, email: user.email },
			relatedInfo,
			membership,
		},
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

	return [undefined, [expiredCookie], 204]; // no content status
}

async function getUserData(req, _res) {
	const userId = req.user.data.id;
	console.log('GET USER DATA CALLED FOR USER ID:', userId);

	const [user] = await query(
		`SELECT userId, email FROM User WHERE userId = ?`,
		[userId]
	);

	if (!user) throw new Error('User not found!');

	const relatedInfo = await getCustomerOrEmployeeById(user.userId);

	if (!relatedInfo) throw new Error('No related user info found'); // should not happen

	let membership = null;

	if (relatedInfo.type === 'customer') {
		await checkIfUserHasExpiredMembership(userId);
		membership = await getMembershipByCustomerId(
			relatedInfo.data.customerId
		);
	}

	return [{ user, relatedInfo, membership }]; // omit passwordHash
}

export default { login, logout, getUserData, signup };
