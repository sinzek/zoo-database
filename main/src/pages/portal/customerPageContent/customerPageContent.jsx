import { useUserData } from '../../../context/userDataContext';
import './customerPageContent.css';

export function PortalCustomerPageContent() {
	const { userEntityData } = useUserData();

	return (
		<div className='portal-customer-main-content'>
			<h1>Welcome to the Zoo, {userEntityData.firstName}!</h1>
		</div>
	);
}
