import { getNByKeyQuery, updateOneQuery } from './query-utils.js';
import { sendNotificationToUser } from './notif-utils.js';
import { query } from '../db/mysql.js';

export async function getZooBusinessId() {
	const [business] = await getNByKeyQuery('Business', 'type', 'zoo');

	return business?.businessId || null;
}

export async function getMembershipByCustomerId(customerId) {
	try {
		const [membership] = await getNByKeyQuery(
			'Membership',
			'customerId',
			customerId,
			true
		);
		if (
			membership &&
			membership.expiresAt &&
			new Date(membership.expiresAt) < new Date()
		) {
			return null;
		}

		return membership || null;
	} catch (err) {
		if (err.message.includes('No records found')) {
			return null;
		}
		throw err;
	}
}

export async function incrementNumEmployees(businessId) {
	const [business] = await getNByKeyQuery(
		'Business',
		'businessId',
		businessId
	);
	if (!business) {
		throw new Error('Business not found');
	}

	const newNumEmployees = (business.numEmployees || 0) + 1;

	await updateOneQuery(
		'Business',
		{
			businessId,
			numEmployees: newNumEmployees,
		},
		'businessId'
	);

	return newNumEmployees;
}

export async function notifyAndUpdateAssignedZookeepersOfAnimalDeletion(
	animalId
) {
	let takesCareOfRecords;

	try {
		takesCareOfRecords = await getNByKeyQuery(
			'TakesCareOf',
			'animalId',
			animalId,
			false
		);
	} catch (err) {
		if (err.message.includes('No records found')) {
			// do nothing if no zookeepers assigned
			return;
		}
		throw err;
	}

	if (!takesCareOfRecords) return;
	if (takesCareOfRecords.length === 0) return;

	const employeeIds = takesCareOfRecords.map((record) => record.employeeId);

	if (employeeIds.length === 0) return;

	for (const empId of employeeIds) {
		try {
			const [employee] = await getNByKeyQuery(
				'Employee',
				'employeeId',
				empId
			);
			if (employee) {
				// Send notification to the zookeeper
				await sendNotificationToUser(
					employee.userId,
					`The animal with ID ${animalId} you were assigned to has been deleted from the system. You may update your personal records accordingly.`
				);

				// remove takesCareOf record

				const [result] = await query(
					`DELETE FROM TakesCareOf WHERE animalId = ? AND employeeId = ?`,
					[animalId, empId]
				);

				if (result.affectedRows === 0) {
					console.warn(
						`No TakesCareOf record found for animalId ${animalId} and employeeId ${empId}`
					);
				}
			}
		} catch (err) {
			if (err.message.includes('No records found')) {
				// skip if no employee found for this id
				continue;
			}
			throw err;
		}
	}
}

export async function getGenAdmissionItemId() {
	const [item] = await getNByKeyQuery(
		'Item',
		'name',
		'General Admission',
		false
	);

	return item ? item.itemId : null;
}
