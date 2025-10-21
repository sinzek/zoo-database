import { createContext, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from './routerContext';

const UserDataContext = createContext({
	userInfo: null, // { userId, email } | null
	userEntityData: null, // customerData | employeeData | null
	userEntityType: null, // 'customer' | 'employee' | null
	login: async (_email, _password) => {},
	logout: async () => {},
});

export function UserDataProvider({ children }) {
	const { navigate } = useRouter();
	const userDataFetched = useRef(false);

	const [userInfo, setUserInfo] = useState(null);
	const [userEntityData, setUserEntityData] = useState(null);
	const [userEntityType, setUserEntityType] = useState(null);

	// consume some hooks to perform login/logout and set the above states accordingly
	const { login, logout, getUserData } = useAuth();

	useEffect(() => {
		async function fetchUserData() {
			const result = await getUserData(
				setUserInfo,
				setUserEntityData,
				setUserEntityType
			);

			if (!result.success) {
				console.error('Error fetching user data:', result.error);
				return;
			}
		}

		if (userInfo === null && !userDataFetched.current) {
			userDataFetched.current = true;
			fetchUserData();
		}
	}, [userInfo, getUserData, logout, navigate]);

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
						navigate
					),
				logout: async () =>
					await logout(
						setUserInfo,
						setUserEntityData,
						setUserEntityType,
						navigate
					),
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
