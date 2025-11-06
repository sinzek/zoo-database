import { api } from '../utils/client-api-utils';
import { showToast } from '../components/toast/showToast';

export function useAuth() {
	const signup = async (
		email,
		password,
		firstName,
		lastName,
		middleInitial,
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		navigate
	) => {
		console.log('Attempting signup for email:', email);

		const result = await api('/api/auth/signup', 'POST', {
			email,
			password,
			firstName,
			lastName,
			middleInitial,
		});

		if (!result.success) {
			console.error('Signup error:', result.error);
			showToast(`ERROR: ${result.error || 'Failed to sign up'}`);
			return result; // { success: false, error: '...'}
		}

		const { user, relatedInfo } = result.data;

		console.log('Signup data received:', result.data);

		setUserInfo(user);
		setUserEntityData(relatedInfo.data);
		setUserEntityType(relatedInfo.type);

		console.log('Signup successful:', result.data);
		navigate('/portal', { replace: true });
		showToast(
			`Welcome to The Zoo™, ${relatedInfo.data.firstName || 'User'}!`
		);
		return { success: true };
	};

	const login = async (
		email,
		password,
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		setMembership,
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

		const { user, relatedInfo, membership } = result.data;

		console.log('Login data received:', result.data);

		setUserInfo(user);
		setUserEntityData(relatedInfo.data);
		setUserEntityType(relatedInfo.type);
		setMembership(membership);

		console.log('Login successful:', result.data);
		navigate('/portal', { replace: true });
		showToast(`Welcome back, ${relatedInfo.data.firstName || 'User'}!`);
		return { success: true };
	};

	const logout = async (
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		navigate,
		setAuthLoading,
		isClockedIn
	) => {
		if (isClockedIn) {
			showToast(
				'Warning: You are currently clocked in. Please clock out before logging out.'
			);
			return { success: false, error: 'User is clocked in' };
		}

		setAuthLoading(true);
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
		setAuthLoading(false);
		return { success: true };
	};

	const getUserData = async (
		setUserInfo,
		setUserEntityData,
		setUserEntityType,
		setMembership,
		setAuthLoading
	) => {
		setAuthLoading(true);
		const result = await api('/api/auth/me', 'GET');

		if (!result.success) {
			setAuthLoading(false);
			return; // not logged in, no action needed
		}

		if (!result.data.user)
			return { success: false, error: 'No user data returned' };

		const { user, relatedInfo, membership } = result.data;

		setUserInfo(user);
		setUserEntityData(relatedInfo.data);
		setUserEntityType(relatedInfo.type);
		setMembership(membership);
		setAuthLoading(false);
		return { success: true, data: result.data };
	};

	const getBusinessEmployeeWorksFor = async (
		businessId,
		setBusiness,
		setLoading
	) => {
		setLoading(true);
		const result = await api('/api/business/get-one-by-id', 'POST', {
			businessId,
		});

		if (!result.success) {
			console.error(
				'Error fetching business for employee:',
				result.error
			);
			showToast(
				`ERROR: ${result.error || 'Failed to fetch business info'}`
			);
			setLoading(false);
			return;
		}

		setBusiness(result.data);
		setLoading(false);
	};

	return { signup, login, logout, getUserData, getBusinessEmployeeWorksFor };
}
