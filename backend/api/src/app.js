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
 * this is intended to work with serverless platforms like vercel
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

	// this is the function that vercel will call when a request comes in
	// event: object, contains details about the incoming request
	// returns a response object that vercel understands
	async handleVercel(req, res) {
		const method = req.method;
		const url = new URL(req.url, `http://${req.headers.host}`);
		const pathname = url.pathname.replace(/^\/api/, '') || '/';

		// find the appropriate handler based on method and pathname
		const handler = this.routes[method]?.[pathname];
		if (!handler) {
			res.statusCode = 404;
			return res.end(JSON.stringify({ error: 'Not Found' }));
		}

		// parse query parameters and body (if any)
		req.query = Object.fromEntries(url.searchParams.entries());
		let body = '';
		for await (const chunk of req) body += chunk;
		req.body = body ? JSON.parse(body) : {};

		// mock express's res.writeHead function
		// so that our route handlers can set status code and headers
		// in a familiar way
		res.writeHead = (code, headers) => {
			res.statusCode = code;
			if (headers) {
				for (const [k, v] of Object.entries(headers)) {
					res.setHeader(k, v);
				}
			}
		};

		// call the handler
		await handler(req, res);
	}
}
