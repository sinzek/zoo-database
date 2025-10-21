import { sendJSON } from '../utils/endpoint-utils.js';
import { db } from '../db/mysql.js';
import crypto from 'crypto';

async function createOne(req, res){
	const newItem = req.body;
	const newItemID = crypto.randomUUID();
	const {name, description, price, uiImage, businessId} = newItem;

	await db.query(
		`
		INSERT INTO Item (itemId, name, description, price, uiImage, businessId)
		VALUES(?, ?, ?, ?, ?, ?);
		`,
		[newItemID, name, description, price, uiImage, businessId]
	);
	return sendJSON(res,
		201,
		{message: 'Item successfully created'}
	);
}

async function deleteOne(req, res){
	const deleteItem = req.body;
	const deleteItemID = deleteItem.itemID;
	
	await db.query(`
		UPDATE Item
		SET deletedAt = CURRENT_DATE()
		WHERE itemId = ? AND deletedAt IS NULL
		`,
	[
		deleteItemID
	]);
	
	return sendJSON(res,
		201,
		{message: 'Item successfully deleted'}
	);
}

async function updateOne(req, res){
	const updatedItem = req.body;
	const {name, description, price, uiImage} = updatedItem; 
	
	await db.query(`
		UPDATE Item
		SET name = ?, description = ?, price = ?, uiImage = ?
		WHERE itemId = ? AND deletedAt IS NULL
		`,
	[
		name, description, price, uiImage, updatedItem.itemId
	]);

	return sendJSON(res,
		201,
		{message: 'Item successfully updated'}
	);
}

async function getOneByID(req, res){
	const findItem = req.body; 
	const findItemID = findItem.itemID;
	const [result] = await db.query(`
		SELECT *
		FROM Item
		WHERE itemId = ? AND deletedAt IS NULL
		`,
	[
		findItemID
	]);
	
	const findItems = result[0];
	return sendJSON(res,
		201,
		{findItems}
	);
}

export default {createOne, deleteOne, updateOne , getOneByID};