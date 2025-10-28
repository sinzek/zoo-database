import { useUserData } from '../../context/userDataContext';
import { useRouter } from '../../context/routerContext';
import { api } from '../../utils/client-api-utils';
import { showToast } from '../../components/toast/showToast';
import { Button } from '../../components/button';
import './memberships.css';
import { useState } from 'react';

const membershipTiers = [
	{
		level: 'individual',
		name: 'Individual',
		price: 25,
		description: 'Basic membership for one person.',
		features: ['Free admission for one', '10% off at gift shops'],
	},
	{
		level: 'family',
		name: 'Family',
		price: 50,
		description: 'Membership for the whole family.',
		features: [
			'Free admission for two adults and up to four children',
			'15% off at gift shops',
			'Early access to special events',
		],
	},
	{
		level: 'senior',
		name: 'Senior',
		price: 15,
		description: 'Discounted membership for seniors (65+).',
		features: ['Free admission for one senior', '15% off at gift shops'],
	},
	{
		level: 'donor',
		name: 'Donor',
		price: 1000,
		description: 'Support the zoo with a generous donation.',
		features: [
			'All Family benefits',
			'Behind-the-scenes tour',
			'Recognition on our donor wall',
		],
	},
];

export function MembershipsPage() {
	const { userInfo, userEntityData, userEntityType } = useUserData();
	const { navigate } = useRouter();
	const [loading, setLoading] = useState(false);

	const handlePurchase = async (tier) => {
		if (!userInfo || userEntityType !== 'customer') {
			navigate('/login');
			return;
		}

		setLoading(true);

		const expireDate = new Date();
		expireDate.setFullYear(expireDate.getFullYear() + 1);

		const newMembership = {
			customerId: userEntityData.customerId,
			level: tier.level,
			expireDate: expireDate.toISOString().split('T')[0],
			autoRenew: false,
		};

		const result = await api('/api/purchase/membership', 'POST', {
			newMembership,
		});

		if (result.success) {
			console.log(result.data);
			showToast(
				`Congratulations! You are now a(n) ${tier.name} member for 1 year.`
			);
			navigate(
				'/portal/membership-transaction/' +
					result.data.transaction.transactionId
			);
		} else {
			showToast(result.error || 'Failed to purchase membership.');
		}

		setLoading(false);
	};

	return (
		<div className='page memberships-page'>
			<div className='hero-container'>
				<img
					src='/images/attractions/birds-show.webp'
					alt='Zoo Memberships'
					className='wide-image'
				/>
				<h1>Join The Zoo™ Family</h1>
				<p
					style={{
						maxWidth: '600px',
						textAlign: 'center',
						marginLeft: 'auto',
						marginRight: 'auto',
					}}
				>
					Choose a membership tier and we may or may not follow
					through on our promises. Thank you for your attention to
					this matter!
				</p>
			</div>
			<div className='tiers-container'>
				{membershipTiers.map((tier) => (
					<div
						key={tier.level}
						className='tier-card'
					>
						<h2>{tier.name}</h2>
						<p className='price'>
							{tier.price}{' '}
							<span className='zoobucks'>Zoobucks</span> / year
						</p>
						<p className='description'>{tier.description}</p>
						<ul className='features'>
							{tier.features.map((feature, index) => (
								<li key={index}>{feature}</li>
							))}
						</ul>
						<Button
							variant='green'
							size='lg'
							onClick={() => handlePurchase(tier)}
							loading={loading}
							className='purchase-btn'
						>
							{userInfo ? 'Purchase' : 'Login to Purchase'}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
