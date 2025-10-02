import { App } from './app.js';
import { registerAuthRoutes } from './routes/index.js';

const PORT = 3000;

// create app instance
const app = new App();

// register routes
registerAuthRoutes(app);

// start server (begin listening for requests)
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
});
