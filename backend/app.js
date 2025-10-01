import http from 'http';

/**
 * a simple express-like framework for handling HTTP requests.
 * supports GET, POST, PUT, DELETE methods.
 * usage:
 * const app = new App();
 *
 * REGISTERING ROUTES:
 * app.{get/post/put/delete}('/path', (req, res) => { ... });
 *
 * STARTING THE SERVER:
 * app.listen(3000, () => { console.log('Server running on port 3000'); });
 */
export class App {
	constructor() {
		this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
	}

	// requests with method GET
	// path: string, path of the endpoint
	// handler: function, handles the request
	get(path, handler) {
		this.routes.GET[path] = handler;
	}

	post(path, handler) {
		this.routes.POST[path] = handler;
	}

	put(path, handler) {
		this.routes.PUT[path] = handler;
	}

	delete(path, handler) {
		this.routes.DELETE[path] = handler;
	}

	listen(port, callback) {
		// create server object
		const server = http.createServer((req, res) => {
			const { method, url } = req;
			const parsedUrl = new URL(url, `http://${req.headers.host}`);
			const pathname = parsedUrl.pathname;

			// find the appropriate handler based on method and pathname
			const handler = this.routes[method]?.[pathname];

			if (handler) {
				handler(req, res);
			} else {
				res.writeHead(404, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Not Found' }));
			}
		});

		// starts server, keeps node process running to listen for incoming HTTP requests on the specified port
		server.listen(port, callback);
	}
}
