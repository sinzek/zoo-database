import { App } from './src/app.js';
import { registerAuthRoutes } from './src/routes/index.js';

export default async function handler(req, res) {
	const requestApp = new App();
	registerAuthRoutes(requestApp);
	return await requestApp.handleVercel(req, res);
}
