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
 * this is intended to work with serverless platforms like netlify
 * (which is what we're using as our web hosting provider)
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

	// use this for development only!
	// (in production, serverless platforms remove the need for an always-on server)
	startDevServer(port, callback) {
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

	async serverlessHandler(event) {
		console.log('Event path:', event.path);
		console.log('Event httpMethod:', event.httpMethod);

		let path = event.path;

		// strip the /api prefix
		if (path.startsWith('/api')) {
			path = path.replace('/api', '');
		}

		// ensures path starts with /
		if (!path.startsWith('/')) {
			path = '/' + path;
		}

		console.log('Processed path:', path);
		console.log('Processed path length:', path.length);
		console.log('Processed path as JSON:', JSON.stringify(path));
		console.log(
			'Available routes for',
			event.httpMethod,
			':',
			Object.keys(this.routes[event.httpMethod] || {})
		);

		const methodRoutes = this.routes[event.httpMethod] || {};
		console.log(
			'Available routes for',
			event.httpMethod,
			':',
			Object.keys(methodRoutes)
		);

		// More detailed debugging
		console.log('Method routes object type:', typeof methodRoutes);
		console.log(
			'Method routes object constructor:',
			methodRoutes.constructor.name
		);
		console.log('Method routes is array:', Array.isArray(methodRoutes));
		console.log(
			'Method routes own properties:',
			Object.getOwnPropertyNames(methodRoutes)
		);

		// Check each route individually
		for (const routePath of Object.keys(methodRoutes)) {
			console.log(`Route ${routePath}:`, typeof methodRoutes[routePath]);
			console.log(
				`Route ${routePath} === processed path:`,
				routePath === path
			);
			console.log(
				`Route ${routePath} strict equality:`,
				Object.is(routePath, path)
			);
		}

		// Try direct property access
		console.log(
			'Direct property access:',
			methodRoutes[path] ? 'EXISTS' : 'DOES NOT EXIST'
		);
		console.log('hasOwnProperty check:', methodRoutes.hasOwnProperty(path));

		// Check if it's a prototype issue
		console.log(
			'Property descriptor:',
			Object.getOwnPropertyDescriptor(methodRoutes, path)
		);

		const controller = methodRoutes[path];
		console.log('Controller found:', controller ? 'YES' : 'NO');
		console.log('Controller type:', typeof controller);

		if (!controller) {
			console.log('No controller found for this path and method');
			return {
				statusCode: 404,
				body: JSON.stringify({
					error: 'Not Found',
					requestedPath: path,
					receivedPath: event.path,
					httpMethod: event.httpMethod,
					availableRoutes: Object.keys(
						this.routes[event.httpMethod] || {}
					),
				}),
			};
		}

		// creating compatibility layer for controllers (fake req and res)
		const req = {
			headers: event.headers,
			body: event.body, // netlify provides the body directly
			query: event.queryStringParameters || {},
		};

		// this promise-based "res" object will capture what a
		// controller tries to send and format it for netlify
		const res = {
			_headers: {},
			_statusCode: 200,
			_body: '',
			writeHead: function (statusCode, headers) {
				this._statusCode = statusCode;
				this._headers = { ...this._headers, ...headers };
			},
			end: function (body) {
				this._body = body;
			},
		};

		// execute the controller with the fake req and res objects
		await controller(req, res);

		// returns the final response object that netlify expects
		return {
			statusCode: res._statusCode,
			headers: res._headers,
			body: res._body,
		};
	}
}
