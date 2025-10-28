import crypto from 'crypto';
import { createOneQuery, getNByKeyQuery } from './query-utils.js';

export async function sendNotificationToUser(userId, message) {
	const notificationId = crypto.randomUUID();

	const [existingNotification] = await getNByKeyQuery(
		'Notification',
		'userId',
		userId,
		false
	);

	// naive check to avoid sending duplicate notifications, could def be improved lol BUT THERE'S NO TIME !!!!!!!!!!!!!!
	if (existingNotification && existingNotification.content === message) {
		return null; // Avoid sending duplicate notifications
	}

	await createOneQuery('Notification', {
		notificationId,
		userId,
		content: message,
		sentAt: new Date(),
	});

	return notificationId;
}

export async function checkIfUserHasExpiredMembership(userId) {
	try {
		const [customer] = await getNByKeyQuery('Customer', 'userId', userId);

		if (!customer) {
			return;
		}

		const currentDate = new Date();
		const customerId = customer.customerId;

		const [membership] = await getNByKeyQuery(
			'Membership',
			'customerId',
			customerId,
			false
		);

		if (!membership) {
			return;
		}

		const expirationDate = new Date(membership.expiresDate);

		if (currentDate > expirationDate) {
			// ! TRIGGER: SEND NOTIFICATION
			await sendNotificationToUser(
				userId,
				`Your ${membership.level} membership has expired. Please renew to continue enjoying member benefits.`
			);
		}
	} catch (error) {
		if (error.message.includes('No records found')) {
			return;
		}
		throw error;
	}
}
