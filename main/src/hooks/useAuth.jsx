import { api } from '../utils/client-api-utils';
import { showToast } from '../components/toast/showToast';

export function useAuth() {
	const login = async (
		email,
		password,
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		navigate
	) => {
		console.log('Attempting login for email:', email);

		const result = await api('/api/auth/login', 'POST', {
			email,
			password,
		});

		if (!result.success) {
			console.error('Login error:', result.error);
			showToast(`ERROR: ${result.error || 'Failed to log in'}`);
			return result; // { success: false, error: '...'}
		}

		const { user, relatedInfo } = result.data;

		console.log('Login data received:', result.data);

		setUserInfo(user);
		setUserEntityData(relatedInfo.data);
		setUserEntityType(relatedInfo.type);

		console.log('Login successful:', result.data);
		navigate('/portal', { replace: true });
		showToast(`Welcome back, ${user.firstName || 'User'}!`);
		return { success: true };
	};

	const logout = async (
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		navigate
	) => {
		const result = await api('/api/auth/logout', 'POST');

		if (!result.success) {
			console.error('Logout error:', result.error);
			showToast(`ERROR: ${result.error || 'Failed to log out'}`);
			return result; // { success: false, error: '...'}
		}

		setUserInfo(null);
		setUserEntityData(null);
		setUserEntityType(null);

		console.log('Logout successful');
		navigate('/login', { replace: true });
		showToast('You have been logged out.');
		return { success: true };
	};

	const getUserData = async (
		setUserInfo,
		setUserEntityData,
		setUserEntityType
	) => {
		const result = await api('/api/auth/me', 'GET');

		if (!result.success) {
			console.error('Get user data error:', result.error);
			showToast(`ERROR: ${result.error || 'Failed to get user data'}`);
			return result; // { success: false, error: '...'}
		}

		const { user, relatedInfo } = result.data;

		setUserInfo(user);
		setUserEntityData(relatedInfo.data);
		setUserEntityType(relatedInfo.type);

		return { success: true, data: result.data };
	};

	return { login, logout, getUserData };
}
