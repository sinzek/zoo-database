import crypto from 'crypto';
import { query } from '../db/mysql.js';
import {
	createOneQuery,
	deleteOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

/**
 * Creates a new item record.
 * @param {string} req.body.name - Item name
 * @param {string} [req.body.description] - Item description
 * @param {number} req.body.price - Item price
 * @param {string} [req.body.uiPhotoUrl] - Image URL for UI
 * @param {string} req.body.businessId - UUID of the associated business
 * @returns {Promise<Array>} Array containing the created item object with generated itemId
 * @throws {Error} If item data is missing
 */
async function createOne(req, _res) {
	const newItem = req.body;

	if (!newItem) throw new Error('Missing item data');

	const newItemData = {
		itemId: crypto.randomUUID(),
		name: newItem.name,
		description: newItem.description || null,
		price: newItem.price,
		uiPhotoUrl: newItem.uiPhotoUrl || null,
		businessId: newItem.businessId,
	};

	await createOneQuery('Item', newItemData);

	return [newItemData];
}

async function deleteOne(req, _res) {
	const { itemId } = req.body;

	if (!itemId) throw new Error('Missing itemId');

	await deleteOneQuery('Item', 'itemId', itemId);

	return [{ message: `Successfully deleted item with ID: ${itemId}` }];
}

async function updateOne(req, _res) {
	const updatedItem = req.body;

	if (!updatedItem || !updatedItem.itemId) {
		throw new Error('Missing item data or itemId');
	}

	await updateOneQuery('Item', updatedItem, 'itemId');

	return [updatedItem];
}

async function getOneById(req, _res) {
	const { itemId } = req.body;

	if (!itemId) throw new Error('Missing itemId');

	const [item] = await getNByKeyQuery('Item', 'itemId', itemId);

	return [item];
}

async function getNByBusiness(req, _res) {
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	// Get items - it's valid to have zero items, so use direct query instead of getNByKeyQuery
	// which throws an error when no records are found
	const items = await query(
		`SELECT * FROM Item WHERE businessId = ? AND deletedAt IS NULL`,
		[businessId]
	) || [];

	const [business] = await getNByKeyQuery(
		'Business',
		'businessId',
		businessId
	);

	return [{ items, business }];
}

async function getNAndBusinesses(_req, _res) {
	const items = await getNByKeyQuery('Item', '1', '1'); // get all items

	const businessIds = [...new Set(items.map((item) => item.businessId))];

	const businesses = {};
	for (const businessId of businessIds) {
		try {
			const [business] = await getNByKeyQuery(
				'Business',
				'businessId',
				businessId
			);
			if (business) {
				businesses[businessId] = business;
			}
		} catch (error) {
			// Skip businesses that don't exist or are soft-deleted
			// This can happen if a business was deleted but items still reference it
			console.warn(`Business ${businessId} not found or deleted, skipping...`);
			continue;
		}
	}

	return [{ items, businesses }];
}

export default {
	createOne,
	deleteOne,
	updateOne,
	getOneById,
	getNByBusiness,
	getNAndBusinesses,
};
