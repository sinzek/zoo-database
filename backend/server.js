import { App } from './app.js';
import { registerAuthRoutes } from './routes/index.js';

const PORT = 3000;

// create app instance
const app = new App();

// register routes
registerAuthRoutes(app);

if (process.env.NODE_ENV !== 'production') {
	// start dev server (begin listening for requests)
	app.startDevServer(PORT, () => {
		console.log(
			`Development server running on port ${PORT} (http://localhost:${PORT})`
		);
	});
}

// export handler for netlify to use in production
export const handler = (event) => {
	return app.serverlessHandler(event);
};
