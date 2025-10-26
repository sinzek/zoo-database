import { useUserData } from '../../context/userDataContext';
import { Sidebar } from './sidebar/sidebar';
import { PortalCustomerPageContent } from './customerPageContent/customerPageContent';
import { UserMenu } from '../../components/userMenu/userMenu';
import './portal.css';

export function PortalPage() {
	const { userEntityData, userEntityType } = useUserData();

	const isCustomer = userEntityType === 'customer';

	if (isCustomer) {
		return (
			<div className='portal-page-container'>
				<UserMenu />
				<PortalCustomerPageContent />
			</div>
		)
	}

	return (
		<div className='portal-page-container'>
			<Sidebar
				ueType={userEntityType}
				uedata={userEntityData}
			/>
			<UserMenu />
			<div className='portal-main-content'>
				Welcome to the Portal Page,{' '}
				{userEntityData?.firstName || 'User'}! You are a{' '}
				{userEntityType || 'Unknown Type'}
			</div>
		</div>
	);
}
