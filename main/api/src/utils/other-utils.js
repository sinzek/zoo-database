import { getNByKeyQuery } from './query-utils.js';

export async function getZooBusinessId() {
	const [business] = await getNByKeyQuery('Business', 'type', 'zoo');

	return business?.businessId || null;
}

export async function getMembershipByCustomerId(customerId) {
	try {
		const [membership] = await getNByKeyQuery(
			'Membership',
			'customerId',
			customerId,
			false
		);
		return membership || null;
	} catch (err) {
		if (err.message.includes('No records found')) {
			return null;
		}
		throw err;
	}
}
