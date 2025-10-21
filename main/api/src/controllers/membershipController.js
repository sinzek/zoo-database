import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	const newMembership = req.body;
	const {purchaser, membershipType, price, startDate, expireDate, autoRenew} = newMembership;
	const newMembershipID = crypto.randomUUID();

	await db.query(
		`
		INSERT INTO Membership (membershipId, purchaser, membershipType, amount, startDate, expireDate, autoRenew)
		VALUES(?, ?, ?, ?, ?, ?, ?);
		`,
		[newMembershipID, purchaser, membershipType, price, startDate, expireDate, autoRenew]
	);
	return sendJSON(res,
		201,
		{message: 'Membership successfully created'}
	);
}

async function updateOne(req, res){
	const updatedMembership = req.body;
	const {purchaser, membershipType, price, startDate, expireDate, autoRenew} = updatedMembership; 
	
	await db.query(`
		UPDATE Membership
		SET purchaser = ?, membershipType = ?, amount = ?, startDate = ?, expireDate = ?, autoRenew = ?
		WHERE membershipId = ? AND deletedAt IS NULL
		`,
	[
		purchaser, membershipType, price, startDate, expireDate, autoRenew, updatedMembership.membershipId
	]);

	return sendJSON(res,
		201,
		{message: 'Membership successfully updated'}
	);
}

async function getOneByID(req, res){
	const getMembership = req.body; 
	const getMembershipID = getMembership.membershipID;
	const [result] = await db.query(`
		SELECT *
		FROM Membership
		WHERE membershipId = ? AND deletedAt IS NULL
		`,
	[
		getMembershipID
	]);

	return sendJSON(res,
		201,
		{membership: result[0]}
	);
}

async function getManyByPurchaser(req, res){
	const getMemberships = req.body; 
	const getPurchaserID = getMemberships.purchaserID;
	const [result] = await db.query(`
		SELECT *
		FROM Membership
		WHERE purchaser = ? AND deletedAt IS NULL
		`,
	[
		getPurchaserID
	]);

	return sendJSON(res,
		201,
		{memberships: result}
	);
}

export default {createOne, updateOne, getOneByID, getManyByPurchaser};