import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new membership record.
 * @param {string} req.body.purchaser - UUID of the customer purchasing the membership
 * @param {string} req.body.membershipType - Type of membership
 * @param {number} req.body.price - Membership price/amount
 * @param {string} req.body.startDate - Membership start date
 * @param {string} req.body.expireDate - Membership expiration date
 * @param {boolean} req.body.autoRenew - Whether membership auto-renews
 * @returns {Promise<Array>} Array containing the created membership object with generated membershipId
 * @throws {Error} If membership data is missing
 */
async function createOne(req, _res){
	const newMembership = req.body;

	if (!newMembership) throw new Error('Missing membership data');

	const {purchaser, membershipType, price, startDate, expireDate, autoRenew} = newMembership;
	const newMembershipID = crypto.randomUUID();

	await createOneQuery('Membership', {
		membershipId: newMembershipID,
		purchaser,
		membershipType,
		amount: price,
		startDate,
		expireDate,
		autoRenew
	});

	return [{ membershipId: newMembershipID, ...newMembership }];
}

/**
 * Updates an existing membership record.
 * @param {string} req.body.membershipId - UUID of the membership to update
 * @param {string} [req.body.purchaser] - Updated purchaser UUID
 * @param {string} [req.body.membershipType] - Updated membership type
 * @param {number} [req.body.price] - Updated price/amount
 * @param {string} [req.body.startDate] - Updated start date
 * @param {string} [req.body.expireDate] - Updated expiration date
 * @param {boolean} [req.body.autoRenew] - Updated auto-renew status
 * @returns {Promise<Array>} Array containing the updated membership object
 * @throws {Error} If membership data or membershipId is missing
 */
async function updateOne(req, _res){
	const updatedMembership = req.body;

	if (!updatedMembership || !updatedMembership.membershipId) {
		throw new Error('Missing membership data or membershipId');
	}

	const {membershipId, purchaser, membershipType, price, startDate, expireDate, autoRenew} = updatedMembership; 
	
	await updateOneQuery('Membership', {
		membershipId,
		purchaser,
		membershipType,
		amount: price,
		startDate,
		expireDate,
		autoRenew
	}, 'membershipId');

	return [updatedMembership];
}

/**
 * Retrieves a single membership by its ID.
 * @param {string} req.body.membershipID - UUID of the membership to retrieve
 * @returns {Promise<Array>} Array containing the membership object
 * @throws {Error} If membershipID is missing or no membership is found
 */
async function getOneByID(req, _res){
	const getMembership = req.body; 
	const getMembershipID = getMembership.membershipID;

	if (!getMembershipID) throw new Error('Missing membershipID');

	const rows = await getNByKeyQuery('Membership', 'membershipId', getMembershipID);

	return [rows[0]];
}

/**
 * Retrieves all memberships for a specific purchaser/customer.
 * @param {string} req.body.purchaserID - UUID of the customer/purchaser
 * @returns {Promise<Array>} Array of membership objects
 * @throws {Error} If purchaserID is missing or no memberships are found
 */
async function getManyByPurchaser(req, _res){
	const getMemberships = req.body; 
	const getPurchaserID = getMemberships.purchaserID;

	if (!getPurchaserID) throw new Error('Missing purchaserID');

	const rows = await getNByKeyQuery('Membership', 'purchaser', getPurchaserID);

	return rows;
}

export default {createOne, updateOne, getOneByID, getManyByPurchaser};
