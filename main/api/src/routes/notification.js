import notificationController from '../controllers/notificationController.js';
import { withAuth } from '../utils/auth-utils.js';

export function registerNotificationRoutes(app) {
	app.get(
		'/api/notifications/get-n-by-user',
		withAuth(notificationController.getNByUser)
	);
	app.post(
		'/api/notifications/mark-as-read',
		withAuth(notificationController.markAsRead)
	);
	app.post(
		'/api/notifications/delete-one',
		withAuth(notificationController.deleteOne)
	);
}
