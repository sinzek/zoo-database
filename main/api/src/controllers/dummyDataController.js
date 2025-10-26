// import crypto from 'crypto';
// import { ACCESS_LEVELS } from '../constants/accessLevels.js';
// import { sha256Hash } from '../utils/auth-utils.js';
// import { createOneQuery } from '../utils/query-utils.js';

// const zooBusinessId = '760ab027-b230-11f0-ad5e-0a36fd72b752';

// async function generateDummyCustomers(_req, _res) {
// 	for (const cred of DUMMY_CREDENTIALS) {
// 		const userId = crypto.randomUUID();

// 		await query(
// 			`INSERT INTO User (userId, email, passwordHash) VALUES (?, ?, ?)`,
// 			[userId, cred.email, cred.passwordHash]
// 		);

// 		await query(
// 			`INSERT INTO Customer (customerId, firstName, lastName, middleInitial, userId) VALUES (?, ?, ?, ?, ?)`,
// 			[
// 				crypto.randomUUID(),
// 				cred.customer.firstName,
// 				cred.customer.lastName,
// 				cred.customer.middleInitial,
// 				userId,
// 			]
// 		);
// 	}

// 	return [];
// }

// async function generateDummyEmployees(_req, _res) {
// 	const levels = Object.keys(ACCESS_LEVELS);

// 	for (let i = 0; i < levels.length; i++) {
// 		const accessLevel = levels[i];
// 		const password = DUMMY_PASSWORDS[i];

// 		const newUserData = {
// 			userId: crypto.randomUUID(),
// 			email: `${accessLevel.toLowerCase()}@thezoo.com`,
// 			passwordHash: sha256Hash(password),
// 		};

// 		await createOneQuery('User', newUserData);

// 		const newEmployeeData = {
// 			employeeId: crypto.randomUUID(),
// 			accessLevel,
// 			jobTitle: DUMMY_JOB_TITLES[i],
// 			firstName: DUMMY_NAMES[i].firstName,
// 			lastName: DUMMY_NAMES[i].lastName,
// 			middleInitial: null,
// 			sex: i % 2 === 0 ? 'male' : 'female',
// 			ssn: `1234567${10 + i}`,
// 			hourlyWage: 15 + i * 5,
// 			jobDescription: `${DUMMY_JOB_TITLES[i]} at The Zoo`,
// 			addressPostalCode: '12345',
// 			addressStreet: '123 Zoo St',
// 			addressCity: 'Zouston',
// 			addressState: 'Zoohio',
// 			payInfoAccountNum: '000123456789',
// 			payInfoRoutingNum: '110000000',
// 			payInfoPaymentMethod: 'direct_deposit',
// 			businessId: zooBusinessId,
// 			hireDate: new Date(),
// 			terminationDate: null,
// 			birthDate: new Date(1990 + i, 0, 1),
// 			phone: `555-000-00${10 + i}`,
// 			deletedAt: null,
// 			supervisorId: null,
// 			userId: newUserData.userId,
// 		};

// 		await createOneQuery('Employee', newEmployeeData);
// 		console.log(
// 			`Created employee: ${accessLevel} with email ${newUserData.email} and password ${password}`
// 		);
// 	}
// }

// export default {};
