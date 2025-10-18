import { useEffect, useState } from 'react';
import { matchPath } from '../utils/matchPath';

export function useRouterHook() {
	const [path, setPath] = useState(window.location.pathname);

	useEffect(() => {
		const onLocationChange = () => {
			setPath(window.location.pathname);
		};

		window.addEventListener('popstate', onLocationChange);

		return () => {
			window.removeEventListener('popstate', onLocationChange);
		};
	}, []);

	/**
	 * Programmatically navigate to a different path in the app
	 * (we need this because we can't use a routing library like react-router)
	 * @param {string} to the path to navigate to
	 * @param {object} options options for navigation
	 * @param {boolean} options.replace whether to replace the current history entry (default: false)
	 * @param {boolean} options.scrollTop whether to scroll to the top of the page after navigation (default: true)
	 */
	function navigate(to, options = { replace: false, scrollTop: true }) {
		if (options.replace) {
			window.history.replaceState({}, '', to);
		} else {
			window.history.pushState({}, '', to);
		}

		if (options.scrollTop) window.scrollTo(0, 0);
		setPath(to);
	}

	/**
	 * Utility to match a URL path against a pattern and extract parameters
	 * (for dynamic routes like /animals/:id)
	 * @param {string} pattern
	 * @returns {object|null} returns an object of params if matched, null if not
	 */
	function match(pattern) {
		return matchPath(pattern, path);
	}

	return { path, navigate, match };
}
