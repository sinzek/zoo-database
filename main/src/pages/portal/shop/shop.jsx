import { useState, useMemo } from 'react';
import { useShoppingCart } from '../../../context/shoppingCartContext';
import { Button } from '../../../components/button';
import { Link } from '../../../components/link';
import { showToast } from '../../../components/toast/showToast';

const DUMMY_BUSINESSES = [
	{
		businessId: 'b1a9b3a7-3b1e-4b4b-8c1a-0a9b3a7b1e4b',
		name: 'Safari Souvenirs',
		uiDescription:
			'Take a piece of the wild home with you! Find exclusive apparel, plush toys, and memorable keepsakes.',
		type: 'retail',
	},
	{
		businessId: 'f2o0d4e5-4c5a-4d6e-8f9a-0b1c2d3e4f5a',
		name: 'The Watering Hole',
		uiDescription:
			'Refuel your expedition with classic American fare, from juicy burgers to crispy fries and refreshing sodas.',
		type: 'food',
	},
];

const DUMMY_ITEMS = [
	{
		itemId: 'i1a1b1c1-1a1b-1c1d-1e1f-1a1b1c1d1e1f',
		name: 'Zoo Explorer T-Shirt',
		description:
			'A comfortable cotton t-shirt featuring our iconic zoo logo.',
		price: 29.99,
		uiPhotoUrl:
			'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=60',
		businessId: 'b1a9b3a7-3b1e-4b4b-8c1a-0a9b3a7b1e4b',
	},
	{
		itemId: 'i2a2b2c2-2a2b-2c2d-2e2f-2a2b2c2d2e2f',
		name: 'Plush Lion Toy',
		description:
			'A soft and cuddly lion, the perfect friend for any young adventurer.',
		price: 19.95,
		uiPhotoUrl:
			'https://images.unsplash.com/photo-1598153345529-b3a473c8c2b2?auto=format&fit=crop&w=800&q=60',
		businessId: 'b1a9b3a7-3b1e-4b4b-8c1a-0a9b3a7b1e4b',
	},
	{
		itemId: 'i3a3b3c3-3a3b-3c3d-3e3f-3a3b3c3d3e3f',
		name: 'Savanna Burger',
		description:
			'A flame-grilled quarter-pound beef patty with lettuce, tomato, and our special sauce.',
		price: 14.5,
		uiPhotoUrl:
			'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60',
		businessId: 'f2o0d4e5-4c5a-4d6e-8f9a-0b1c2d3e4f5a',
	},
	{
		itemId: 'i4a4b4c4-4a4b-4c4d-4e4f-4a4b4c4d4e4f',
		name: 'Jungle Fries',
		description: 'A large portion of golden, crispy fries, lightly salted.',
		price: 6.5,
		uiPhotoUrl:
			'https://images.unsplash.com/photo-1576107232684-827a33c242a5?auto=format&fit=crop&w=800&q=60',
		businessId: 'f2o0d4e5-4c5a-4d6e-8f9a-0b1c2d3e4f5a',
	},
];

export function ShopPage() {
	const { addItemToCart, cartItemCount } = useShoppingCart();
	const [quantities, setQuantities] = useState(() =>
		DUMMY_ITEMS.reduce((acc, item) => {
			acc[item.itemId] = 1;
			return acc;
		}, {})
	);

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		[]
	);

	const handleQuantityChange = (itemId, value) => {
		const parsed = Math.floor(Number(value));
		setQuantities((prev) => ({
			...prev,
			[itemId]: parsed > 0 ? parsed : 1,
		}));
	};

	const handleAddToCart = (item) => {
		const quantity = Math.max(1, Number(quantities[item.itemId]) || 1);
		addItemToCart(item, quantity);
		showToast(`Added ${quantity} x ${item.name} to cart.`);
		setQuantities((prev) => ({ ...prev, [item.itemId]: 1 }));
	};

	return (
		<div
			className='page'
			style={{
				width: '100%',
				padding: '96px 24px 48px',

				boxSizing: 'border-box',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: '1200px',
					margin: '0 auto',
					display: 'flex',
					flexDirection: 'column',
					gap: '48px',
					color: 'var(--color-foreground)',
				}}
			>
				<header style={{ display: 'grid', gap: '12px' }}>
					<h1
						style={{
							fontSize: '2.75rem',
							lineHeight: 1.1,
							letterSpacing: '-0.02em',
						}}
					>
						Zoo Shops & Eateries
					</h1>
					<p
						style={{
							margin: 0,
							color: 'var(--color-lgreen)',
						}}
					>
						We do NOT put any of our animals in the food. There is
						no gorilla in the Gordita Gorilla Cheese Fries.
					</p>
					<div
						style={{
							display: 'flex',
							gap: '16px',
							alignItems: 'center',
							marginTop: '12px',
						}}
					>
						<Link to='/portal/cart'>
							<Button variant='green'>
								View Cart ({cartItemCount} items)
							</Button>
						</Link>
					</div>
				</header>

				{DUMMY_BUSINESSES.map((business) => (
					<section key={business.businessId}>
						<div
							style={{
								marginBottom: '24px',
								borderLeft: '4px solid var(--color-green)',
								paddingLeft: '16px',
							}}
						>
							<h2
								style={{
									margin: 0,
									fontSize: '2rem',
									color: 'var(--color-lgreen)',
								}}
							>
								{business.name}
							</h2>
							<p
								style={{
									margin: '4px 0 0',
									color: 'var(--color-lbrown)',
									maxWidth: '700px',
								}}
							>
								{business.uiDescription}
							</p>
						</div>
						<div
							style={{
								display: 'grid',
								gap: '24px',
								gridTemplateColumns:
									'repeat(auto-fill, minmax(280px, 1fr))',
							}}
						>
							{DUMMY_ITEMS.filter(
								(item) =>
									item.businessId === business.businessId
							).map((item) => {
								const quantity = quantities[item.itemId] ?? 1;
								return (
									<article
										key={item.itemId}
										style={{
											borderRadius: '28px',

											background:
												'rgba(100, 69, 54, 0.35)',
											boxShadow:
												'0 18px 36px rgba(0, 0, 0, 0.35)',
											overflow: 'hidden',
											display: 'flex',
											flexDirection: 'column',
										}}
									>
										{item.uiPhotoUrl && (
											<img
												src={item.uiPhotoUrl}
												alt={item.name}
												style={{
													width: '100%',
													height: '200px',
													objectFit: 'cover',
												}}
											/>
										)}
										<div
											style={{
												padding: '24px',
												display: 'flex',
												flexDirection: 'column',
												gap: '16px',
												flex: 1,
											}}
										>
											<div
												style={{
													display: 'grid',
													gap: '8px',
												}}
											>
												<h3
													style={{
														margin: 0,
														fontSize: '1.45rem',
														color: 'var(--color-lgreen)',
													}}
												>
													{item.name}
												</h3>
												<p
													style={{
														margin: 0,
														color: 'var(--color-foreground)',
														opacity: 0.85,
														flex: 1,
													}}
												>
													{item.description}
												</p>
											</div>

											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent:
														'space-between',
													gap: '12px',
													marginTop: 'auto',
												}}
											>
												<span
													style={{
														fontSize: '1.25rem',
														fontWeight: 700,
														color: 'var(--color-green)',
													}}
												>
													{currencyFormatter.format(
														item.price
													)}
												</span>
												<label
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
														color: 'var(--color-lbrown)',
														fontWeight: 600,
														fontSize: '0.95rem',
													}}
												>
													Qty
													<input
														type='number'
														min={1}
														step={1}
														value={quantity}
														onChange={(event) =>
															handleQuantityChange(
																item.itemId,
																event.target
																	.value
															)
														}
														style={{
															width: '70px',
															textAlign: 'center',
															fontWeight: 700,
															background:
																'var(--color-dbrown)',
															borderColor:
																'var(--color-green)',
														}}
													/>
												</label>
											</div>

											<Button
												variant='outline'
												size='lg'
												onClick={() =>
													handleAddToCart(item)
												}
												style={{
													width: '100%',
													marginTop: '8px',
												}}
											>
												Add to cart
											</Button>
										</div>
									</article>
								);
							})}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
