import { useShoppingCart } from '../../../context/shoppingCartContext';
import { useMemo } from 'react';
import { Button } from '../../../components/button';
import { Link } from '../../../components/link';
import { Trash2 } from 'lucide-react';
import { Frown } from 'lucide-react';

import membershipData from '../../../data/membership';

export function CartPage() {
	const {
		cart,
		removeItemFromCart,
		updateItemQuantity,
		clearCart,
		cartItemCount,
	} = useShoppingCart();

//Cap on membership quantity
const isMembership = (item) => {
        return membershipData.some(m => m.id === item.itemId);
    };

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		[]
	);

	const cartTotal = useMemo(
		() =>
			cart.reduce((total, item) => total + item.price * item.quantity, 0),
		[cart]
	);

	const handleCheckout = () => {
		// Dummy function
		console.log('Proceeding to checkout with cart:', cart);
		alert(
			`Checkout is not implemented. Total: ${currencyFormatter.format(
				cartTotal
			)}`
		);
		clearCart();
	};

	if (cart.length === 0) {
		return (
			<div
				style={{
					margin: 'auto auto',
				}}
			>
				<div
					style={{
						textAlign: 'center',
						color: 'var(--color-lgreen)',
						gap: '20px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<Frown
						size={64}
						style={{ color: 'var(--color-green)' }}
					/>
					<h1 style={{ color: 'var(--color-green)' }}>
						Your Cart is Empty
					</h1>
					<p>
						Looks like you haven&apos;t added anything yet. Hurry up
						and spend all your money!
					</p>
					<div style={{ display: 'flex', marginTop: '2rem' }}>
						<Link to='/portal/buy-tickets'>
							<Button
								variant='green'
								size='lg'
							>
								Buy Tickets
							</Button>
						</Link>
						<Link to='/portal/shop'>
							<Button
								variant='outline'
								size='lg'
								style={{ margin: '0px 0px 0px 10px' }}
							>
								Visit the Shop
							</Button>
						</Link>
					</div>
				</div>
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
					maxWidth: '960px',
					margin: '0 auto',
					display: 'flex',
					flexDirection: 'column',
					gap: '32px',
				}}
			>
				<header style={{ display: 'grid', gap: '12px' }}>
					<h1
						style={{
							fontSize: '2.75rem',
							lineHeight: 1.1,
							letterSpacing: '-0.02em',
							color: 'var(--color-green)',
						}}
					>
						Your Shopping Cart
					</h1>
					<p style={{ margin: 0, color: 'var(--color-lgreen)' }}>
						Review your items below before proceeding to checkout.
					</p>
				</header>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
					}}
				>
					{cart.map((item) => (
						<div
							key={item.itemId}
							style={{
								display: 'grid',
								gridTemplateColumns: '100px 1fr auto',
								gap: '24px',
								alignItems: 'center',
								padding: '16px',
								borderRadius: '16px',
								backgroundColor: 'var(--color-brown)',
							}}
						>
							<img
								src={item.uiPhotoUrl}
								alt={item.name}
								style={{
									width: '100px',
									height: '100px',
									objectFit: 'cover',
									borderRadius: '8px',
								}}
							/>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '8px',
								}}
							>
								<h3
									style={{
										margin: 0,
										fontSize: '1.25rem',
										color: 'var(--color-lgreen)',
									}}
								>
									{item.name}
								</h3>

								<span
									style={{
										fontWeight: 600,
										color: 'var(--color-green)',
									}}
								>
									{currencyFormatter.format(item.price)} each
								</span>
							</div>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '16px',
								}}
							>

							
							<div className="quantity-control-area"> 
								{isMembership(item) ? (
									//IF it IS a membership, show static text "Qty: 1"
									<span style={{ fontWeight: 600, color: 'var(--color-lbrown)' }}>
										Qty: 1
									</span>
								) : (
									//ELSE show the interactive input
									<label
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											color: 'var(--color-lbrown)',
											fontWeight: 600,
										}}
									>
										Qty
										<input
											type='number'
											min='0' 
											value={item.quantity}
											onChange={(e) =>
												
												updateItemQuantity(
													item.itemId,
													Math.max(1, parseInt(e.target.value, 10) || 0) 
												)
											}
											style={{
												width: '70px',
												textAlign: 'center',
											}}
										/>
									</label>
								)}
							</div>

								<Button
									variant='outline'
									size='sm'
									onClick={() =>
										removeItemFromCart(item.itemId)
									}
									aria-label={`Remove ${item.name}`}
								>
									<Trash2 size={18} />
								</Button>
							</div>
						</div>
					))}
				</div>

				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						borderTop: '2px solid var(--color-lbrown)',
						paddingTop: '24px',
						marginTop: '16px',
					}}
				>
					<div>
						<Button
							variant='outline'
							onClick={clearCart}
						>
							Clear Cart
						</Button>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-end',
							gap: '8px',
						}}
					>
						<div
							style={{
								display: 'flex',
								gap: '16px',
								alignItems: 'baseline',
							}}
						>
							<span
								style={{
									fontSize: '1.2rem',
									color: 'var(--color-lgreen)',
									fontWeight: 500,
								}}
							>
								Total ({cartItemCount} items):
							</span>
							<span
								style={{
									fontSize: '2rem',
									fontWeight: 'bold',
									color: 'var(--color-green)',
								}}
							>
								{currencyFormatter.format(cartTotal)}
							</span>
						</div>
						<Button
							variant='green'
							size='lg'
							onClick={handleCheckout}
							style={{ marginTop: '16px' }}
						>
							Proceed to Checkout
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
