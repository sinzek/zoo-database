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


export default async function handler(req, res) {
	const requestApp = new App();
	registerAuthRoutes(requestApp);
	try {
		return await requestApp.handleVercel(req, res);
	} catch(error) {
		console.error('Error handling request:', error);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: 'Oopsie: Internal Server Error' }));
	}
	
}
