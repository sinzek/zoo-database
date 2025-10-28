import crypto from 'crypto';
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
 * @param {string} [req.body.uiImage] - Image URL for UI
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
		uiImage: newItem.uiImage, // ! CHANGE UIPHOTOURL TO UIIMAGE BLOB TYPE
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

	const items = await getNByKeyQuery('Item', 'businessId', businessId);

	return items;
}

async function getNAndBusinesses(_req, _res) {
	const items = await getNByKeyQuery('Item', '1', '1'); // get all items

	const businessIds = [...new Set(items.map((item) => item.businessId))];

	const businesses = {};
	for (const businessId of businessIds) {
		const [business] = await getNByKeyQuery(
			'Business',
			'businessId',
			businessId
		);
		businesses[businessId] = business;
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
