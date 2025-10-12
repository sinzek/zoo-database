/**
 * sends a JSON response with the given status code and data
 * back to whatever made the request (in our case, the frontend client).
 *
 * this is typically called inside a controller function (see controllers/*.js)
 *
 * @param {*} res response object
 * @param {*} statusCode HTTP status code
 * @param {*} payload data to send as JSON
 */
export function sendJSON(res, statusCode, payload) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	return JSON.stringify(payload);
}
