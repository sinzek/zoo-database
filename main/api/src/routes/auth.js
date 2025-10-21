import authController from '../controllers/authController.js';
import { withAuth } from '../utils/endpoint-utils.js';

// adds all of these routes to our app instance
export function registerAuthRoutes(app) {
	app.post('/api/auth/login', authController.login);
	app.post('/api/auth/logout', withAuth(authController.logout));
	app.get('/api/auth/me', withAuth(authController.getUserData));
}
