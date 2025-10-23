
import crypto from 'crypto';
import {
	createOneQuery,
	deleteOneQuery,
	getNByKeyQuery,
	updateOneQuery,
} from '../utils/query-utils.js';

async function createOne(req, _res){
	const newItem = req.body;

	if (!newItem) throw new Error('Missing item data');

	const newItemData = {
		itemId: crypto.randomUUID(),
		name: newItem.name,
		description: newItem.description || null,
		price: newItem.price,
		uiImage: newItem.uiImage, // ! CHANGE UIPHOTOURL TO UIIMAGE BLOB TYPE
		businessId: newItem.businessId
	}

	await createOneQuery('Item', newItemData);

	return [newItemData];
}

async function deleteOne(req, _res){
	const { itemId } = req.body;

	if (!itemId) throw new Error('Missing itemId');

	await deleteOneQuery('Item', 'itemId', itemId);

	return [{ message: `Successfully deleted item with ID: ${itemId}` }];
}

async function updateOne(req, _res){
	const updatedItem = req.body;

	if (!updatedItem || !updatedItem.itemId) {
		throw new Error('Missing item data or itemId');
	}

	await updateOneQuery('Item', updatedItem, 'itemId');

	return [updatedItem];
}

async function getOneById(req, _res){
	const { itemId } = req.body;

	if (!itemId) throw new Error('Missing itemId');

	const [item] = await getNByKeyQuery('Item', 'itemId', itemId);

	return [item];
}

async function getNByBusiness(req, _res){
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const items = await getNByKeyQuery('Item', 'businessId', businessId);

	return items;
}

export default {createOne, deleteOne, updateOne , getOneById, getNByBusiness};