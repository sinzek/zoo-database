import { createOneQuery } from '../utils/query-utils';
import { MEMBERSHIP_LEVELS } from '../constants/membershipLevels';
import crypto from 'crypto';

// takes in customerId and array of items to purchase
async function purchaseItems(req, _res) {
	const { customerId, items } = req.body;

	if (!customerId) throw new Error('Missing customerId');
	if (!items || !Array.isArray(items) || items.length === 0) {
		throw new Error('Missing items to purchase');
	}
	const businessId = items[0].businessId;
	if (!businessId) throw new Error('Missing businessId in items');

	const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
	if (totalAmount <= 0) {
		throw new Error('Total amount must be greater than zero');
	}

	const newTransaction = {
		transactionId: crypto.randomUUID(),
		description: `Purchase by customer ${customerId}`,
		businessId,
		amount: totalAmount,
		deletedAt: null,
		purchaseDate: new Date(), // ! ADD PURCHASE DATE TO TRANSACTION TABLE
	};

	await createOneQuery('Transaction', newTransaction);

	const purchasedItems = [];
	for (const item of items) {
		const purchasedItemData = {
			purchasedItemId: crypto.randomUUID(),
			customerId,
			transactionId: newTransaction.transactionId,
			itemId: item.itemId,
		};

		await createOneQuery('PurchasedItem', purchasedItemData);
		purchasedItems.push(purchasedItemData);
	}

	return [{ transaction: newTransaction, purchasedItems }];
}

async function purchaseMembership(req, _res) {
	const { newMembership, businessId } = req.body;

	if (!newMembership) throw new Error('Missing membership data');
	if (!businessId) throw new Error('Missing businessId');
	if (!newMembership.customerId)
		throw new Error('Missing purchaser (customerId)');

	if (!MEMBERSHIP_LEVELS[newMembership.level]) {
		throw new Error('Invalid membership level');
	}

	// create transaction for membership purchase
	const newTransaction = {
		transactionId: crypto.randomUUID(),
		description: `Membership purchase by customer ${newMembership.customerId}`,
		businessId,
		amount: MEMBERSHIP_LEVELS[newMembership.level].price,
		deletedAt: null,
		purchaseDate: new Date(), // ! ADD PURCHASE DATE TO TRANSACTION TABLE
	};

	await createOneQuery('Transaction', newTransaction);

	// create membership record

	const newMembershipData = {
		membershipId: crypto.randomUUID(),
		customerId: newMembership.customerId,
		level: newMembership.level,
		startDate: new Date(),
		expireDate: newMembership.expireDate,
		autoRenew: newMembership.autoRenew,
		transactionId: newTransaction.transactionId,
	};

	await createOneQuery('Membership', newMembershipData);

	return [{ transaction: newTransaction, membership: newMembershipData }];
}

export default { purchaseItems, purchaseMembership };
