import notificationController from '../controllers/notificationController.js';
import { withAuth } from '../utils/auth-utils.js';

export function registerNotificationRoutes(app) {
	app.get(
		'/api/notifications/get-n-by-user',
		withAuth(notificationController.getNByUser)
	);
}
