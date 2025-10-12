import { App } from './src/app.js';
import { registerAuthRoutes } from './src/routes/index.js';

const PORT = 3000;

if (process.env.NODE_ENV === 'development') {
	const devApp = new App();
	registerAuthRoutes(devApp);
	// start dev server (begin listening for requests)
	devApp.startDevServer(PORT, () => {
		console.log(
			`Development server running on port ${PORT} (http://localhost:${PORT})`
		);
	});
}

const app = new App();

registerAuthRoutes(app);

export default async function handler(req, res) {
	await app.handleVercel(req, res);
}
