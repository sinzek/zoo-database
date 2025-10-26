import { useUserData } from '../../../context/userDataContext';
import './customerPageContent.css';
import { Link } from '../../../components/link.jsx';
import { useEffect, useState } from 'react';

export function PortalCustomerPageContent() {
	const { userEntityData } = useUserData();
	const [curBg, setCurBg] = useState(0);

	const backgrounds = [
		'/images/habitats/coralreef.webp',
		'/images/habitats/rainforest.webp',
		'/images/habitats/savanna.webp',
		'/images/habitats/wetlands.webp',
		'/images/habitats/tundra.webp',
		'/images/habitats/mountains.webp',
		'/images/habitats/forest.webp',
		'/images/habitats/grasslands.webp',
	];

	const options = [
		{ name: 'Buy Tickets', link: '/portal/buy-tickets' },
		{ name: 'Memberships', link: '/portal/memberships' },
		{ name: 'Event Calendar', link: '/portal/events' },
	];


	useEffect(() => {
		const interval = setInterval(() => {
			setCurBg((prevBg) => (prevBg + 1) % backgrounds.length);
		}, 10000);

		return () => clearInterval(interval);
	}, [backgrounds.length]);

	return (
		<div className='portal-customer-main-content'>
			<img src={backgrounds[curBg]} alt="Coral Reef Habitat" className="bg-img" />
			<h1>Welcome to the Zoo, {userEntityData.firstName}!</h1>
			<div className="options-grid">
				{options.map((option) => (
					<Link key={option.name} to={option.link} href={option.link} className="option-card">
						{option.name}
					</Link>
				))}
			</div>
		</div>
	);
}
