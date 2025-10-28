import { useState, useMemo, useEffect } from 'react';
import { useShoppingCart } from '../../../context/shoppingCartContext';
import { Button } from '../../../components/button';
import { Link } from '../../../components/link';
import { showToast } from '../../../components/toast/showToast';
import { api } from '../../../utils/client-api-utils';
import { Loader } from '../../../components/loader/loader';

export function ShopPage() {
	const { addItemToCart, cartItemCount } = useShoppingCart();
	const [businesses, setBusinesses] = useState([]);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	const [quantities, setQuantities] = useState(() =>
		items.reduce((acc, item) => {
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

	useEffect(() => {
		async function fetchData() {
			const result = await api('/api/item/get-n-and-businesses', 'POST');

			if (!result.success) {
				console.error('Error fetching shop data:', result.error);
				showToast(
					`Error: ${result.error || 'Failed to fetch shop data.'}`
				);
				setLoading(false);
				return;
			}

			console.log('Fetched shop data:', result.data);

			setBusinesses(Object.values(result.data.businesses || {}));
			setItems(result.data.items);
			setLoading(false);
		}

		fetchData();
	}, []);

	if (loading) {
		return (
			<div
				className='centered-page'
				style={{
					width: '100%',
					padding: '96px 24px 48px',
					boxSizing: 'border-box',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					color: 'var(--color-lbrown)',
				}}
			>
				<Loader />
				<p>Loading shop...</p>
			</div>
		);
	}

	if (businesses.length === 0 || items.length === 0) {
		return (
			<div
				className='centered-page'
				style={{
					width: '100%',
					padding: '96px 24px 48px',
					boxSizing: 'border-box',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					color: 'var(--color-lbrown)',
				}}
			>
				<p>No items available in the shop at this time.</p>
			</div>
		);
	}

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

				{businesses.map((business) => (
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
							{items
								.filter(
									(item) =>
										item.businessId === business.businessId
								)
								.map((item) => {
									const quantity =
										quantities[item.itemId] ?? 1;
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
															alignItems:
																'center',
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
																textAlign:
																	'center',
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
