import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

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

async function getOneByID(req, _res){
	const getMembership = req.body; 
	const getMembershipID = getMembership.membershipID;

	if (!getMembershipID) throw new Error('Missing membershipID');

	const rows = await getNByKeyQuery('Membership', 'membershipId', getMembershipID);

	return [rows[0]];
}

async function getManyByPurchaser(req, _res){
	const getMemberships = req.body; 
	const getPurchaserID = getMemberships.purchaserID;

	if (!getPurchaserID) throw new Error('Missing purchaserID');

	const rows = await getNByKeyQuery('Membership', 'purchaser', getPurchaserID);

	return rows;
}

export default {createOne, updateOne, getOneByID, getManyByPurchaser};