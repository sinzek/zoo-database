import authController from '../controllers/authController.js';
import { withAuth } from '../utils/auth-utils.js';


// adds all of these routes to our app instance
export function registerAuthRoutes(app) {
	app.post('/api/auth/login', authController.login);
	app.post('/api/auth/logout', authController.logout);
	app.get('/api/auth/me', withAuth(authController.getUserData));
}
	