export function sendJSON(res, statusCode, payload, ...cookies) {
	console.log('Sending response:', { statusCode, payload, cookies });

	res.statusCode = statusCode;
	res.setHeader('Content-Type', 'application/json');

	if (cookies.length > 0) {
		const cookieStrings = cookies.map(
			({ name, value }) =>
				`${name}=${value}; HttpOnly; SameSite=Lax; ${
					process.env.NODE_ENV === 'production' ? 'Secure;' : ''
				} Path=/`
		);
		res.setHeader('Set-Cookie', cookieStrings);
	}

	let body = null;

	if (!payload) {
		body = { success: true, data: null };
	} else {
		body = payload.error
			? { success: false, error: payload.error }
			: { success: true, data: payload };
	}

	res.end(JSON.stringify(body));
}

// https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
export const DBErrMap = {
	ER_BAD_FIELD_ERROR: {
		status: 400,
		message: 'Invalid field in request (violates constraint)',
	},
	ER_NO_REFERENCED_ROW_2: {
		status: 400,
		message: 'Foreign key constraint fails',
	},
	ER_DUP_KEY: { status: 409, message: 'Duplicate key error' },
	ER_DUP_ENTRY: { status: 409, message: 'Duplicate entry' },
	ER_PARSE_ERROR: { status: 400, message: 'SQL syntax error' },
	ER_TRUNCATED_WRONG_VALUE: { status: 400, message: 'Invalid value' },
	ER_DATA_TOO_LONG: { status: 400, message: 'Data too long for column' },
	ER_BAD_NULL_ERROR: { status: 400, message: 'Column cannot be null' },
	ER_NO_DEFAULT_FOR_FIELD: { status: 400, message: 'Missing required field' },
	ER_ROW_IS_REFERENCED_2: {
		status: 400,
		message: 'Cannot delete or update a parent row',
	},
	ER_LOCK_DEADLOCK: { status: 503, message: 'Database deadlock, try again' },
	ER_LOCK_WAIT_TIMEOUT: {
		status: 503,
		message: 'Database timeout, try again',
	},
};

export async function handlerWrapper(handler, req, res, options = {}) {
	const { logError = true } = options;

	try {
		const result = await handler(req, res);
		if (!result) {
			return sendJSON(res, 200, null);
		}

		const [payload, cookies, status = 200] = result;
		return sendJSON(res, status, payload, ...(cookies || []));
	} catch (err) {
		const path = req.url.split('?')[0];
		if (logError) console.error(`From endpoint ${path} -`, err);

		const dbErr = DBErrMap[err.code];
		const status = dbErr?.status || 500;
		const message =
			dbErr?.message || // check for known db error
			err.message || // use error message from thrown error
			'Internal Server Error'; // fallback message

		return sendJSON(res, status, { error: message });
	}
}
