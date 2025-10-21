import { useUserData } from '../../context/userDataContext';

export function PortalPage() {
	const { userEntityData, userEntityType } = useUserData();
	return (
		<div>
			Welcome to the Portal Page, {userEntityData?.firstName || 'User'}!
			You are a {userEntityType || 'Unknown Type'}
		</div>
	);
}
