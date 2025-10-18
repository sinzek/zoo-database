import { App } from './src/app.js';
import { registerAuthRoutes } from './src/routes/index.js';

/**
 * Main entry point for the API
 *
 *
 * This function creates a new App instance, registers all routes,
 * and delegates the request handling to the App instance
 */
export default async function handler(req, res) {
	const requestApp = new App();

	// !--- start route registration ---!
	registerAuthRoutes(requestApp);
	// !--- end route registration ---!

	return await requestApp.handleVercel(req, res);
}
