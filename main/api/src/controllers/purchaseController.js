import { createOneQuery } from '../utils/query-utils.js';
import { MEMBERSHIP_LEVELS } from '../constants/membershipLevels.js';
import crypto from 'crypto';
import { getZooBusinessId } from '../utils/other-utils.js';
import { sendNotificationToUser } from '../utils/notif-utils.js';

// takes in customerId and array of items to purchase
async function purchaseItems(req, _res) {
	const { customerId, items } = req.body;

	if (!customerId) throw new Error('Missing customerId');
	if (!items || !Array.isArray(items) || items.length === 0) {
		throw new Error('Missing items to purchase');
	}
	const businessId = items[0].businessId;
	if (!businessId) throw new Error('Missing businessId in items');

	const total = items.reduce((sum, item) => sum + item.price, 0);

	const transactions = [];
	const purchasedItems = [];
	console.log('Purchasing items:', items);

	for (const item of items) {
		const newTransaction = {
			transactionId: crypto.randomUUID(),
			description: `Purchase by customer ${customerId}`,
			businessId: item.businessId,
			amount: item.price,
			deletedAt: null,
			purchaseDate: new Date(),
		};

		await createOneQuery('Transaction', newTransaction);
		transactions.push(newTransaction);

		const purchasedItemData = {
			purchasedItemId: crypto.randomUUID(),
			customerId,
			transactionId: newTransaction.transactionId,
			itemId: item.itemId,
		};

		await createOneQuery('PurchasedItem', purchasedItemData);
		purchasedItems.push(purchasedItemData);
	}

	await sendNotificationToUser(
		req.user.data.id,
		`Thank you for your purchase totalling $${total.toFixed(
			2
		)}! Your items have been thrown into the void.`
	);

	return [{ transactions, purchasedItems }];
}

async function purchaseMembership(req, _res) {
	const { newMembership } = req.body;
	const userId = req.user.data.id;

	if (!newMembership) throw new Error('Missing membership data');
	if (!newMembership.customerId)
		throw new Error('Missing purchaser (customerId)');

	if (!MEMBERSHIP_LEVELS[newMembership.level]) {
		throw new Error('Invalid membership level');
	}

	const zooBusinessId = await getZooBusinessId();
	if (!zooBusinessId) {
		throw new Error('Zoo business not found');
	}

	// create transaction for membership purchase
	const newTransaction = {
		transactionId: crypto.randomUUID(),
		description: `Membership purchase by customer ${newMembership.customerId}`,
		businessId: zooBusinessId,
		amount: MEMBERSHIP_LEVELS[newMembership.level].price,
		deletedAt: null,
		purchaseDate: new Date(),
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

	try {
		await createOneQuery('Membership', newMembershipData);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			throw new Error(
				'You already have an active membership. Head to /portal to view it.'
			);
		}
		throw err;
	}

	await sendNotificationToUser(
		userId,
		`Thank you for purchasing the ${newMembershipData.level} membership! Your membership is valid until ${newMembershipData.expireDate}. Enjoy your benefits at The Zoo™! No refunds. Lol.`
	);

	return [{ transaction: newTransaction, membership: newMembershipData }];
}

export default { purchaseItems, purchaseMembership };
