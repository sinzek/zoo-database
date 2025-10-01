import { App } from './app';
import { registerAuthRoutes } from './routes';

const PORT = 3000;

// create app instance
const app = new App();

// register routes
registerAuthRoutes(app);

// start server (begin listening for requests)
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
});
