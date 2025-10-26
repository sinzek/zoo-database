import { useUserData } from '../../context/userDataContext';
import { PortalCustomerPageContent } from './components/customerPageContent/customerPageContent';
import './portal.css';
import { availableLinksForAccessLevel } from './sidebar/utils';
import { Link } from '../../components/link';

export function PortalPage() {
	const { userEntityData, userEntityType } = useUserData();

	const isCustomer = userEntityType === 'customer';

	if (isCustomer) {
		return (
			<div className='portal-page-container'>
				<PortalCustomerPageContent />
			</div>
		);
	}

	const links = availableLinksForAccessLevel(userEntityData);

	return (
		<div className='portal-page-container'>
			<h1 className='portal-main-content'>
				Welcome to work, {userEntityData?.firstName || 'User'}!
			</h1>
			<p>
				You have been a wagie since{' '}
				{userEntityData.hireDate.split('T')[0]}.
			</p>
			<div className='options-grid'>
				{links.map((link) => (
					<Link
						key={link.label}
						to={link.to}
						className='option-card'
					>
						<link.icon size={32} />
						{link.label}
					</Link>
				))}
			</div>
		</div>
	);
}
