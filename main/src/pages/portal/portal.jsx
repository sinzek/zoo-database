import { useUserData } from '../../context/userDataContext';
import { hasMinAccessLvl } from '../../utils/access';
import { Sidebar } from './sidebar/sidebar';
import { PortalCustomerPageContent } from './customerPageContent/customerPageContent';

export function PortalPage() {
	const { userEntityData, userEntityType } = useUserData();

	const isCustomer = userEntityType === 'customer';

	if (isCustomer) {
		return <PortalCustomerPageContent />;
	}

	return (
		<div>
			<Sidebar
				ueType={userEntityType}
				uedata={userEntityData}
			/>
			<div className='portal-main-content'>
				Welcome to the Portal Page,{' '}
				{userEntityData?.firstName || 'User'}! You are a{' '}
				{userEntityType || 'Unknown Type'}
			</div>
		</div>
	);
}
