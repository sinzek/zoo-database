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
		const controller = this.routes[event.httpMethod]?.[event.path];

		if (!controller) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: 'Not Found' }),
			};
		}

		// creating compatibility layer for controllers (fake req and res)
		const req = {
			headers: event.headers,
			body: event.body, // netlify provides the body directly
			// add any other properties from `event` we might need
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
