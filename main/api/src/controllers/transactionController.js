
import {
	updateOneQuery,
	deleteOneQuery,
	getNByKeyQuery,
} from '../utils/query-utils.js';

async function deleteOneById(req, _res){
	const { transactionId } = req.body;

	if (!transactionId) throw new Error('Missing transactionId');

	await deleteOneQuery('Transaction', 'transactionId', transactionId);

	return [{ message: `Successfully deleted transaction with ID: ${transactionId}` }];
}

async function updateOneById(req, _res){
	const updatedTransaction = req.body;

	if (!updatedTransaction || !updatedTransaction.transactionId) {
		throw new Error('Missing transaction data or transactionId');
	}

	const updatedTransactionData = { ...updatedTransaction };
	delete updatedTransactionData.businessId; // prevent updating businessId

	await updateOneQuery('Transaction', updatedTransactionData, 'transactionId');

	return [updatedTransaction];
}

async function getOneById(req, _res){
	const { transactionId } = req.body;
	if (!transactionId) throw new Error('Missing transactionId');

	const [transaction] = await getNByKeyQuery('Transaction', 'transactionId', transactionId);

	return [transaction];
}

async function getNByBusiness(req, _res){
	const { businessId } = req.body;

	if (!businessId) throw new Error('Missing businessId');

	const transactions = await getNByKeyQuery('Transaction', 'businessId', businessId);

	return [transactions];
}

async function getNByCustomer(req, _res){
	const { customerId } = req.body;

	if (!customerId) throw new Error('Missing customerId');

	const purchasedItemRecords = await getNByKeyQuery('PurchasedItem', 'customerId', customerId);

	const transactionIds = purchasedItemRecords.map(record => record.transactionId);

	let transactions = [];
	for(const transactionId of transactionIds) {
		const transactionArr = await getNByKeyQuery('Transaction', 'transactionId', transactionId);
		if(transactionArr.length > 1) {
			transactions = transactions.concat(transactionArr);
		} else if(transactionArr.length === 1) {
			transactions.push(transactionArr[0]);
		}

		// otherwise skip, no transaction found
	}

	return [transactions];
}

export default { deleteOneById, updateOneById, getOneById, getNByBusiness, getNByCustomer };