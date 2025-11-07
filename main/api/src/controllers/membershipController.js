import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
	getAllQuery,
	deleteOneQuery,
} from '../utils/query-utils.js';
import { MEMBERSHIP_LEVELS } from '../constants/membershipLevels.js';

async function createOne(req, _res) {
	const newMembership = req.body;

	if (!newMembership) throw new Error('Missing membership data');

	if (!newMembership.customerId)
		throw new Error('Missing purchaser (customerId)');
	if (!newMembership.transactionId) throw new Error('Missing transactionId');

	if (!MEMBERSHIP_LEVELS[newMembership.level]) {
		throw new Error('Invalid membership level');
	}

	const newMembershipData = {
		membershipId: crypto.randomUUID(),
		customerId: newMembership.customerId,
		level: newMembership.level,
		startDate: new Date(),
		expireDate: newMembership.expireDate,
		autoRenew: newMembership.autoRenew,
		transactionId: newMembership.transactionId,
	};

	await createOneQuery('Membership', newMembershipData);

	return [newMembershipData];
}

async function updateOne(req, _res) {
	const updatedMembership = req.body;

	if (!updatedMembership || !updatedMembership.membershipId) {
		throw new Error('Missing membership data or membershipId');
	}

	const updatedMembershipData = { ...updatedMembership };
	delete updatedMembershipData.customerId; // prevent updating customerId
	delete updatedMembershipData.transactionId; // prevent updating transactionId

	await updateOneQuery('Membership', updatedMembershipData, 'membershipId');

	return [updatedMembership];
}

/**
 * Retrieves a single membership by its ID.
 * @param {string} req.body.membershipID - UUID of the membership to retrieve
 * @returns {Promise<Array>} Array containing the membership object
 * @throws {Error} If membershipID is missing or no membership is found
 */
async function getOneByID(req, _res) {
	const { membershipId } = req.body;

	if (!membershipId) throw new Error('Missing membershipId');

	const [membership] = await getNByKeyQuery(
		'Membership',
		'membershipId',
		membershipId
	);

	return [membership];
}

async function getN(_req, _res) {
	const memberships = await getAllQuery('Membership');
	return [memberships];
}

async function deleteOne(req, _res) {
	const { membershipId } = req.body;

	if (!membershipId) throw new Error('Missing membershipId');

	await deleteOneQuery('Membership', 'membershipId', membershipId);

	return [];
}

// no need to fetch memberships by customerId here, customerId is unique in Membership table

export default { createOne, updateOne, getOneByID, getN, deleteOne };
