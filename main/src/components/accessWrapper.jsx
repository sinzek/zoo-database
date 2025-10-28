import PropTypes from 'prop-types';
import { useRouter } from '../context/routerContext';
import { useUserData } from '../context/userDataContext';
import { useEffect } from 'react';
import { Loader } from './loader/loader';
import { hasMinAccessLvl } from '../utils/access';

// i know this is repeated from /api/src/constants/accessLevels.js but for whatever reason
// importing that file here causes issues with vercel, so whatever

export function AccessWrapper({ children }) {
	const { path, navigate } = useRouter();
	const { userInfo, userEntityType, authLoading } = useUserData();

	const isLoggedIn = userInfo !== null;
	const isEmployee = userEntityType === 'employee';
	const isCustomer = userEntityType === 'customer';

	// defined access rules based on path
	const accessRules = {
		'/portal': isLoggedIn && (isCustomer || isEmployee),
		'/login': !isLoggedIn,
	};

	const hasAccess = accessRules[path] ?? true;

	useEffect(() => {
		if (!hasAccess && !authLoading) {
			navigate('/');
		}
	}, [hasAccess, path, navigate, authLoading]);

	if (authLoading && path.startsWith('/portal')) {
		return (
			<div
				style={{
					width: '100vw',
					height: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'row',
					gap: '10px',
					color: 'var(--color-lgreen)',
					fontSize: '16px',
				}}
			>
				<Loader style={{ width: '40px', height: '40px' }} />
				<h1>Loading...</h1>
			</div>
		);
	}

	return hasAccess ? children : null;
}

AccessWrapper.propTypes = {
	children: PropTypes.node.isRequired,
};
