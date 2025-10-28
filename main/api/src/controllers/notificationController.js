import { getNByKeyQuery } from '../utils/query-utils.js';

async function getNByUser(req, _res) {
	const userId = req.user.data.id;

	if (!userId) {
		throw new Error('Missing userId');
	}

	try {
		const notifications = await getNByKeyQuery(
			'Notification',
			'userId',
			userId,
			false
		);

		return [notifications];
	} catch (error) {
		if (error.message.includes('No records found')) {
			return [[]];
		}
	}
}

export default { getNByUser };
