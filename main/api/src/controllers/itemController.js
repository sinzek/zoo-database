import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	const newItem = req.body;

	if (!newItem) throw new Error('Missing item data');

	const newItemID = crypto.randomUUID();
	const {name, description, price, uiImage, businessId} = newItem;

	await createOneQuery('Item', { //NOTE ITEM SHOULD HAVE UI IMAGE
		itemId: newItemID,
		name,
		description,
		price,
		uiImage,
		businessId
	});

	return [{ itemId: newItemID, ...newItem }];
}

async function deleteOne(req, _res){
	const deleteItem = req.body;
	const deleteItemID = deleteItem.itemID;

	if (!deleteItemID) throw new Error('Missing itemID');
	
	// using db.query for soft delete
	await db.query(
		`
		UPDATE Item
		SET deletedAt = CURRENT_DATE()
		WHERE itemId = ? AND deletedAt IS NULL
		`,
		[deleteItemID]
	);
	
	return [{ message: 'Item successfully deleted' }];
}

async function updateOne(req, _res){
	const updatedItem = req.body;

	if (!updatedItem || !updatedItem.itemId) {
		throw new Error('Missing item data or itemId');
	}

	const {itemId, name, description, price, uiImage} = updatedItem; 
	
	await updateOneQuery('Item', {
		itemId,
		name,
		description,
		price,
		uiImage
	}, 'itemId');

	return [updatedItem];
}

async function getOneByID(req, _res){
	const findItem = req.body; 
	const findItemID = findItem.itemID;

	if (!findItemID) throw new Error('Missing itemID');

	const rows = await getNByKeyQuery('Item', 'itemId', findItemID);
	
	return [rows[0]];
}

export default {createOne, deleteOne, updateOne , getOneByID};