import { query } from '../db/mysql.js';
import { getNByKeyQuery, updateOneQuery } from '../utils/query-utils.js';

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

async function markAsRead(req, _res) {
	const { notificationId } = req.body;

	if (!notificationId) {
		throw new Error('Missing notificationId');
	}

	await updateOneQuery(
		'Notification',
		{ notificationId, seen: true },
		'notificationId',
		false
	);

	return [{ message: 'Notification marked as read' }];
}

async function deleteOne(req, _res) {
	const { notificationId } = req.body;

	if (!notificationId) {
		throw new Error('Missing notificationId');
	}

	const result = await query(
		'DELETE FROM Notification WHERE notificationId = ?',
		[notificationId]
	);

	if (result.affectedRows === 0) {
		throw new Error('Notification not found or already deleted');
	}

	return [{ message: 'Notification successfully deleted' }];
}

export default { getNByUser, markAsRead, deleteOne };
