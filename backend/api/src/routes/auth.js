import authController from '../controllers/authController.js';

// adds all of these routes to our app instance
export function registerAuthRoutes(app) {
	app.post('/auth/login', authController.login);
	app.post('/auth/signup', authController.signup);
	app.post('/auth/logout', authController.logout);
}
