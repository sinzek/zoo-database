import authController from '../../../controllers/authController.js';

// adds all of these routes to our app instance
export function registerAuthRoutes(app) {
	app.post('/api/auth/login', authController.login);
	app.post('/api/auth/signup', authController.signup);
	app.post('/api/auth/logout', authController.logout);
}
