/**
 * Simple utility function to make API calls to the server.
 * @param {string} path API endpoint path, e.g. `'/api/login'` or `'/api/animals'`
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method HTTP method, default is 'GET'
 * @param {any} data Data to send in the request body (for POST/PUT requests only)
 * @returns {Promise<{success: true, data: any} | {success: false, error: string}>} Response from the server
 */
export async function api(path, method = 'GET', data) {
	const options = {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	};

	if (data) {
		options.body = JSON.stringify(data);
	}

	try {
		const res = await fetch(path, options);

		if (res.status === 204) {
			return { success: true, data: null };
		}

		const resData = await res.json();

		if (!res.ok) {
			const message =
				resData?.error || res.statusText || 'Request failed';
			throw new Error(message);
		}

		return resData; // { success: true, data: ...  }
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err),
		};
	}
}
