import { db } from '../db/mysql.js';
import crypto from 'crypto';
import {
	createOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new item record.
 * @param {string} req.body.name - Item name
 * @param {string} [req.body.description] - Item description
 * @param {number} req.body.price - Item price
 * @param {string} [req.body.uiImage] - Image URL for UI
 * @param {string} req.body.businessId - UUID of the associated business
 * @returns {Promise<Array>} Array containing the created item object with generated itemId
 * @throws {Error} If item data is missing
 */
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

/**
 * Soft deletes an item by setting its deletedAt timestamp.
 * @param {string} req.body.itemID - UUID of the item to delete
 * @returns {Promise<Array>} Array containing success message
 * @throws {Error} If itemID is missing
 */
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

/**
 * Updates an existing item record.
 * @param {string} req.body.itemId - UUID of the item to update
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.description] - Updated description
 * @param {number} [req.body.price] - Updated price
 * @param {string} [req.body.uiImage] - Updated image URL
 * @returns {Promise<Array>} Array containing the updated item object
 * @throws {Error} If item data or itemId is missing
 */
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

/**
 * Retrieves a single item by its ID.
 * @param {string} req.body.itemID - UUID of the item to retrieve
 * @returns {Promise<Array>} Array containing the item object
 * @throws {Error} If itemID is missing or no item is found
 */
async function getOneByID(req, _res){
	const findItem = req.body; 
	const findItemID = findItem.itemID;

	if (!findItemID) throw new Error('Missing itemID');

	const rows = await getNByKeyQuery('Item', 'itemId', findItemID);
	
	return [rows[0]];
}

export default {createOne, deleteOne, updateOne , getOneByID};
