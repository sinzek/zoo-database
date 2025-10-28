import { handlerWrapper } from './utils/endpoint-utils.js';

/**
 * a simple express-like framework for handling HTTP requests.
 * supports GET, POST, PUT, DELETE methods.
 * usage:
 * const app = new App();
 *
 * *ROUTE DEFINITION EXAMPLE:*
 * ```js
 * app.post('/api/some-path', controller.handlerFunction);
 * ```
 *
 *
 * this is intended to work with serverless platforms like vercel
 * (which is what we're using as our web hosting provider)
 */
export class App {
	constructor() {
		this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
	}

	/**
	 * Register a route handler for a GET request at the specified path.
	 * @example
	 * app.get('/api/some-path', (req, res) => { ... });
	 * @example
	 * app.get('/api/some-path', controller.handlerFunction);
	 * @param {string} path The URL path for the GET request.
	 * @param {function} handler The function to handle the GET request.
	 */
	get(path, handler) {
		this.routes.GET[path] = handler;
	}

	/**
	 * Register a route handler for a POST request at the specified path.
	 * @example
	 * app.post('/api/some-path', (req, res) => { ... });
	 * @example
	 * app.post('/api/some-path', controller.handlerFunction);
	 * @param {string} path The URL path for the POST request.
	 * @param {function} handler The function to handle the POST request.
	 */
	post(path, handler) {
		this.routes.POST[path] = handler;
	}

	/**
	 * Register a route handler for a PUT request at the specified path.
	 * @example
	 * app.put('/api/some-path', (req, res) => { ... });
	 * @example
	 * app.put('/api/some-path', controller.handlerFunction);
	 * @param {string} path The URL path for the PUT request.
	 * @param {function} handler The function to handle the PUT request.
	 */
	put(path, handler) {
		this.routes.PUT[path] = handler;
	}

	/**
	 * Register a route handler for a DELETE request at the specified path.
	 * @example
	 * app.delete('/api/some-path', (req, res) => { ... });
	 * @example
	 * app.delete('/api/some-path', controller.handlerFunction);
	 * @param {string} path The URL path for the DELETE request.
	 * @param {function} handler The function to handle the DELETE request.
	 */
	delete(path, handler) {
		this.routes.DELETE[path] = handler;
	}

	/**
	 * This is the function that vercel will call when a request comes in
	 * @param {any} req The incoming request object
	 * @param {any} res The response object to send data back
	 * @returns {any} Returns a response object that vercel understands
	 */
	async handleVercel(req, res) {
		const method = req.method;
		const url = new URL(req.url, `http://${req.headers.host}`);
		const pathname = url.pathname || '/';

		console.log(`Incoming request: ${method} ${pathname}`);

		// find the appropriate handler based on method and pathname
		const handler = this.routes[method]?.[pathname];
		if (!handler) {
			console.log(`No handler found for ${method} ${pathname}`);

			res.statusCode = 404;
			return res.end(JSON.stringify({ error: 'Not Found' }));
		}

		console.log(`Handler found for ${method} ${pathname}. Invoking...`);

		req.query = Object.fromEntries(url.searchParams.entries());

		// in Vercel, the body might already be parsed.
		// if not, we parse it from the stream
		if (!req.body) {
			let body = '';
			for await (const chunk of req) body += chunk;
			try {
				req.body = body ? JSON.parse(body) : {};
			} catch (err) {
				console.error('Error parsing JSON body:', err);
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: 'Invalid JSON in request body' })
				);
			}
		}

		await handlerWrapper(handler, req, res, {
			logError: true,
		});

		console.log('Handler function completed.');
	}
}
