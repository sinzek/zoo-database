import { useMemo, useState } from 'react';
import { useShoppingCart } from '../../../context/shoppingCartContext';
import { FormBuilder } from '../../../components/formBuilder/formBuilder';
import { useUserData } from '../../../context/userDataContext';
import { Button } from '../../../components/button';
import { Link } from '../../../components/link';
import { Check } from 'lucide-react';

const zooBusinessId = '9d924bce-2e2a-4a9a-8de0-1f4458a2d8a4'; 

const EXAMPLE_TICKET = {
	itemId: 'c3af22f3-0f23-4fef-82c3-6e729a0a0f01',
	name: 'General Admission',
	description: 'Full-day access to all habitats, vendors, and attractions.',
	price: 24.95,
	uiPhotoUrl:
		'https://media.istockphoto.com/id/1013497326/vector/zoo-park-tickets-with-african-and-forest-animals.jpg?s=612x612&w=0&k=20&c=N0l2c_QViTOst5L2a25E6nmQj6BVCnxSj7nuTup83D4=',
	businessId: zooBusinessId,
};

export function BuyTicketsPage() {
	const { addItemToCart, cartItemCount } = useShoppingCart();
	const { userEntityData, userInfo } = useUserData();

	const [formData, setFormData] = useState({
		visitorName: `${userEntityData?.firstName || ''} ${
			userEntityData?.lastName || ''
		}`.trim(),
		email: userInfo?.email || '',
		visitDate: new Date().toISOString().split('T')[0],
	});
	const [quantity, setQuantity] = useState(0);
	const [feedback, setFeedback] = useState('');

	const contactFields = useMemo(
		() => [
			{
				name: 'visitorName',
				label: 'Name',
				type: 'text',
				placeholder: 'Jane Doe',
				autoComplete: 'name',
			},
			{
				name: 'email',
				label: 'Confirmation Email',
				type: 'email',
				placeholder: 'you@example.com',
				autoComplete: 'email',
			},
			{
				name: 'visitDate',
				label: 'Visit Date',
				type: 'date',
				placeholder: '',
				autoComplete: 'off',
			},
		],
		[]
	);

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		[]
	);

	const estimatedTotal = useMemo(
		() => EXAMPLE_TICKET.price * (Number(quantity) || 0),
		[quantity]
	);

	const handleQuantityChange = (itemId, value) => {
		const parsed = Math.floor(Number(value));
		setQuantity(parsed > 0 ? parsed : 0);
	};

	const handleAddToCart = (ticket) => {
		const { visitorName, email, visitDate } = formData;
		if (!visitorName || !email || !visitDate) {
			setFeedback(
				'Please complete visitor details before adding tickets.'
			);
			return;
		}

		const qty = Math.max(0, Number(quantity) || 0);

		if (qty === 0) {
			setFeedback('Please select a quantity before adding tickets.');
			return;
		}

		const cartItem = {
			...ticket,
			quantity: qty,
			purchaserName: visitorName,
			purchaserEmail: email,
			visitDate,
			addedAt: new Date().toISOString(),
		};

		addItemToCart(cartItem, qty);
		setFeedback(`${EXAMPLE_TICKET.name} x${quantity} added to cart.`);
		setQuantity(0);
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
					maxWidth: '1040px',
					margin: '0 auto',
					display: 'flex',
					flexDirection: 'column',
					gap: '32px',
					color: 'var(--color-green)',
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
						Buy Zoo Tickets
					</h1>
					<p
						style={{
							maxWidth: '640px',
							margin: 0,
							color: 'var(--color-lgreen)',
						}}
					>
						Choose tickets for your perfect day at the zoo, then add
						them to your cart for a quick checkout.
					</p>
				</header>

				<div
					style={{
						borderRadius: '28px',
						padding: '24px',
						backgroundColor: 'var(--color-brown)',
						backdropFilter: 'blur(6px)',
						display: 'grid',
						gridTemplateColumns: '1fr 2fr',
						gap: '16px',
					}}
				>
					<div>
						<h2
							style={{
								marginTop: 0,
								marginBottom: '12px',
								fontSize: '1.45rem',
							}}
						>
							Visitor details
						</h2>
						<FormBuilder
							fields={contactFields}
							formData={formData}
							setFormData={setFormData}
						/>
						<small
							style={{
								color: 'var(--color-lbrown)',
								display: 'block',
								marginTop: '8px',
							}}
						>
							Note: You won&apos;t actually receive an email with
							your tickets. This whole thing is a scam :)
						</small>
					</div>
					<div>
						<article
							key={EXAMPLE_TICKET.itemId}
							style={{
								borderRadius: '28px',
								backgroundColor: 'var(--color-dbrown)',
								boxShadow: '0 18px 36px rgba(0, 0, 0, 0.35)',
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							{EXAMPLE_TICKET.uiPhotoUrl && (
								<div
									style={{
										position: 'relative',
										paddingBottom: '56%',
										overflow: 'hidden',
									}}
								>
									<img
										src={EXAMPLE_TICKET.uiPhotoUrl}
										alt={EXAMPLE_TICKET.name}
										style={{
											position: 'absolute',
											inset: 0,
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											filter: 'brightness(0.9)',
										}}
									/>
								</div>
							)}
							<div
								style={{
									padding: '24px',
									display: 'flex',
									flexDirection: 'column',
									gap: '16px',
								}}
							>
								<div style={{ display: 'grid', gap: '8px' }}>
									<h3
										style={{
											margin: 0,
											fontSize: '1.45rem',
											color: 'var(--color-lgreen)',
										}}
									>
										{EXAMPLE_TICKET.name}
									</h3>
									<p
										style={{
											margin: 0,
											color: 'var(--color-foreground)',
											opacity: 0.85,
										}}
									>
										{EXAMPLE_TICKET.description}
									</p>
								</div>

								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										gap: '12px',
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
											EXAMPLE_TICKET.price
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
													EXAMPLE_TICKET.itemId,
													event.target.value
												)
											}
											style={{
												width: '82px',
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

								<button
									type='button'
									className='btn btn-green btn-lg'
									onClick={() =>
										handleAddToCart(EXAMPLE_TICKET)
									}
									style={{
										width: '100%',
										marginTop: '8px',
									}}
								>
									Add to cart
								</button>
							</div>
						</article>
					</div>
				</div>

				<section
					style={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						gap: '24px',
					}}
				>
					<div>
						{cartItemCount > 0 && (
							<Link to='/portal/cart'>
								<Button
									variant='outline'
									size='lg'
									disabled={cartItemCount === 0}
									style={{
										flexGrow: 0,
										flexShrink: 0,
										width: 'min-content',
										height: 'max-content',
										padding: '16px 24px',
									}}
								>
									<Check style={{ marginBottom: -3 }} />
									Proceed to Checkout ({cartItemCount} item
									{cartItemCount !== 1 ? 's' : ''} in cart)
								</Button>
							</Link>
						)}
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '8px',
							alignItems: 'flex-end',
							borderTop: '1px solid rgba(196, 163, 129, 0.4)',
							paddingTop: '16px',
						}}
					>
						<span
							style={{
								fontSize: '0.95rem',
								color: 'var(--color-lbrown)',
							}}
						>
							Estimated total
						</span>
						<strong
							style={{
								fontSize: '1.75rem',
								color: 'var(--color-green)',
							}}
						>
							{currencyFormatter.format(estimatedTotal)}
						</strong>
					</div>
				</section>

				{feedback && (
					<div
						role='status'
						style={{
							borderRadius: '999px',
							padding: '14px 22px',
							fontWeight: 600,
							alignSelf: 'flex-start',
							background: 'rgba(187, 214, 134, 0.15)',
							border: '1px solid var(--color-green)',
							color: 'var(--color-lgreen)',
						}}
					>
						{feedback}
					</div>
				)}
			</div>
		</div>
	);
}
