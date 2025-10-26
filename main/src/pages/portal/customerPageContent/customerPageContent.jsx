import { useUserData } from '../../../context/userDataContext';
import './customerPageContent.css';
import { Link } from '../../../components/link.jsx';
import { useEffect, useState } from 'react';
import { Calendar, FerrisWheel, PawPrint, ShoppingBasket, Ticket, TreePalm, UserCheck } from 'lucide-react';

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
		{ name: 'Buy Tickets', link: '/portal/buy-tickets', icon: Ticket },
		{ name: 'Memberships', link: '/memberships', icon: UserCheck },
		{ name: 'Shop', link: '/shop', icon: ShoppingBasket },
		{ name: 'Attractions', link: '/attractions', icon: FerrisWheel },
		{ name: 'Habitats', link: '/habitats', icon: TreePalm },
		{ name: 'Animals', link: '/animals', icon: PawPrint },
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
			<h1>The Zoo awaits, {userEntityData.firstName}!</h1>
			<div className="options-grid">
				{options.map((option) => (
					<Link key={option.name} to={option.link} href={option.link} className="option-card">
						<option.icon size={32} />
						{option.name}
					</Link>
				))}
			</div>
		</div>
	);
}
