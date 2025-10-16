/**
 * sends a JSON response with the given status code and data
 * back to whatever made the request (in our case, the frontend client).
 *
 * this is typically called inside a controller function (see controllers/*.js)
 *
 * @param {Response} res response object
 * @param {number} statusCode HTTP status code
 * @param {any} payload data to send as JSON
 * @param  {...any} cookies optional cookies to set in the response (as strings)
 * @returns {string} JSON string of the payload to be returned by the controller/handler function
 */
export function sendJSON(res, statusCode, payload, ...cookies) {
	res.statusCode = statusCode;
	res.setHeader('Content-Type', 'application/json');

	if (cookies && cookies.length > 0) {
		for (const cookie of cookies) {
			res.setHeader('Set-Cookie', cookie);
		}
	}

	return JSON.stringify(payload);
}
