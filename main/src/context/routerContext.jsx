import { createContext, useContext } from 'react';
import { useRouterHook } from '../hooks/useRouter';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const RouterContext = createContext({
	path: '/',
	navigate: (_to, _options) => {},
	match: (_pattern) => null,
});

export function RouterProvider({ children }) {
	const { path, navigate, match } = useRouterHook();

	useEffect(() => {
		console.log('RouterProvider rendered with path:', path);
	}, [path]);

	return (
		<RouterContext.Provider value={{ path, navigate, match }}>
			{children}
		</RouterContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter() {
	return useContext(RouterContext);
}

RouterProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
