import crypto from 'crypto';
//import { sha256Hash } from '../utils/auth-utils.js';
import { query } from '../db/mysql.js';

const DUMMY_CREDENTIALS = [];

async function generateDummyCustomers(_req, _res) {
	for (const cred of DUMMY_CREDENTIALS) {
		const userId = crypto.randomUUID();

		await query(
			`INSERT INTO User (userId, email, passwordHash) VALUES (?, ?, ?)`,
			[userId, cred.email, cred.passwordHash]
		);

		await query(
			`INSERT INTO Customer (customerId, firstName, lastName, middleInitial, userId) VALUES (?, ?, ?, ?, ?)`,
			[
				crypto.randomUUID(),
				cred.customer.firstName,
				cred.customer.lastName,
				cred.customer.middleInitial,
				userId,
			]
		);
	}

	return [];
}

export default { generateDummyCustomers };
