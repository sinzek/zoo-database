import { createContext, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from './routerContext';
import { hasMinAccessLvl } from '../utils/access';
import { showToast } from '../components/toast/showToast';
import { api } from '../utils/client-api-utils';

const UserDataContext = createContext({
	userInfo: null, // { userId, email } | null
	userEntityData: null, // customerData | employeeData | null
	userEntityType: null, // 'customer' | 'employee' | null
	login: async (_email, _password) => {},
	logout: async () => {},
	authLoading: false,
	businessEmployeeWorksFor: null, // { businessId, name, ... } | null
	clockedInSince: null,
	clock: (_inStatus) => {},
	membership: null, // membership data for customers (if any)
	setUserEntityData: (_data) => {},
});

export function UserDataProvider({ children }) {
	const { navigate, path } = useRouter();
	const userDataFetched = useRef(false);

	const [userInfo, setUserInfo] = useState(null);
	const [userEntityData, setUserEntityData] = useState(null);
	const [userEntityType, setUserEntityType] = useState(null);
	const [membership, setMembership] = useState(null);
	const [businessEmployeeWorksFor, setBusinessEmployeeWorksFor] =
		useState(null);
	const [businessLoading, setBusinessLoading] = useState(false);

	const [authLoading, setAuthLoading] = useState(true);
	const [clockedInSince, setClockedInSince] = useState(null);

	// consume some hooks to perform login/logout and set the above states accordingly
	const { login, logout, getUserData, getBusinessEmployeeWorksFor } =
		useAuth();

	async function clock(inStatus) {
		if (inStatus === 'in') {
			const now = new Date();
			setClockedInSince(now);
			localStorage.setItem('clockedInSince', now.toISOString());
			showToast('Clocked in successfully');
			return now;
		} else if (inStatus === 'out') {
			if (!clockedInSince) showToast('Error: Not clocked in');
			const since = clockedInSince;
			setClockedInSince(null);
			localStorage.removeItem('clockedInSince');

			const result = await api('/api/shifts/clockOut', 'POST', {
				startTime: since,
				endTime: new Date(),
			});

			if (!result.success) {
				showToast(`Error clocking out: ${result.message}`);
				return null;
			}

			showToast(
				'Clocked out successfully. Total time worked: ' +
					Math.round((new Date() - since) / 60000) +
					' minutes'
			);

			return since;
		}
	}

	useEffect(() => {
		async function fetchUserData() {
			const result = await getUserData(
				setUserInfo,
				setUserEntityData,
				setUserEntityType,
				setMembership,
				setAuthLoading
			);

			if (!result || !result.success) {
				// failed to get user data, not logged in
				return;
			}

			if (result.data.relatedInfo.type === 'employee') {
				await getBusinessEmployeeWorksFor(
					result.data.relatedInfo.data.businessId,
					setBusinessEmployeeWorksFor,
					setBusinessLoading
				);
			}
		}

		if (!userInfo && !userDataFetched.current) {
			userDataFetched.current = true;
			fetchUserData();
		}
	}, [userInfo, getUserData, logout, navigate, getBusinessEmployeeWorksFor]);

	useEffect(() => {
		if (typeof window === 'undefined' || authLoading || businessLoading)
			return;

		const contentContainer = document.querySelector('#main-content');
		if (contentContainer) {
			const isMinZookeeper = hasMinAccessLvl('zookeeper', userEntityData);
			if (
				userEntityType === 'employee' &&
				isMinZookeeper &&
				path.startsWith('/portal')
			) {
				contentContainer.style.marginLeft = '238px';
			} else {
				contentContainer.style.marginLeft = '0px';
			}
		}
	}, [userEntityType, userEntityData, authLoading, businessLoading, path]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const clockStart = localStorage.getItem('clockedInSince');
		if (clockStart && userEntityType === 'employee') {
			setClockedInSince(new Date(clockStart));
		} else {
			setClockedInSince(null);
		}
	}, [userEntityType]);

	return (
		<UserDataContext.Provider
			value={{
				userInfo,
				userEntityData,
				userEntityType,
				login: async (email, password) =>
					await login(
						email,
						password,
						setUserInfo,
						setUserEntityData,
						setUserEntityType,
						setMembership,
						navigate
					),
				logout: async () =>
					await logout(
						setUserInfo,
						setUserEntityData,
						setUserEntityType,
						navigate,
						setAuthLoading,
						!!clockedInSince
					),
				authLoading: authLoading || businessLoading,
				businessEmployeeWorksFor,
				clockedInSince,
				clock,
				membership,
				setUserEntityData,
			}}
		>
			{children}
		</UserDataContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserData() {
	try {
		return useContext(UserDataContext);
	} catch {
		throw new Error('useUserData must be used within a UserDataProvider');
	}
}

UserDataProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
