/**
 * Utility to match a URL path against a pattern and extract parameters
 * (for dynamic routes like /animals/:id)
 * @param {string} pattern The path pattern to match against, e.g. /api/users/:id
 * @param {string} path The actual path to match against the pattern
 * @returns {object|null} returns an object of params if matched, null if not
 */
export function matchPath(pattern, path) {
	const patternParts = pattern.split('/').filter(Boolean);
	const pathParts = path.split('/').filter(Boolean);

	if (patternParts.length !== pathParts.length) {
		return null;
	}

	const params = {};

	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];

		if (patternPart.startsWith(':')) {
			const paramName = patternPart.slice(1);
			params[paramName] = decodeURIComponent(pathPart);
		} else if (patternPart !== pathPart) {
			return null;
		}
	}

	return params;
}
