import { useState, useEffect, useRef } from 'react';
import { useUserData } from '../../context/userDataContext';
import './topMenu.css';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { Link } from '../link';
import { useShoppingCart } from '../../context/shoppingCartContext';
import { Button } from '../button';
import { useRouter } from '../../context/routerContext';
import { api } from '../../utils/client-api-utils';

function formatDuration(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const pad = (num) => num.toString().padStart(2, '0');

	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function TopMenu() {
	const {
		userEntityData,
		logout,
		userEntityType,
		businessEmployeeWorksFor,
		clockedInSince,
		clock,
		membership,
	} = useUserData();
	const { path } = useRouter();

	const [elapsedTime, setElapsedTime] = useState(
		new Date() - new Date(clockedInSince)
	);

	const [isOpen, setIsOpen] = useState(false);
	const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState(null);
	const [numUnreadNotis, setNumUnreadNotis] = useState(0);

	const { cartItemCount } = useShoppingCart();
	const hasFetchedUnreadNotis = useRef(false);

	const mouseLeaveDebounceTime = 1000; // milliseconds

	const handleFade = (direction) => {
		const userMenu = document.querySelector('.user-menu');
		if (direction === 'in') {
			userMenu.classList.add('open');
			userMenu.classList.remove('closed');
		} else {
			userMenu.classList.add('closed');
			userMenu.classList.remove('open');
		}

		setTimeout(() => {
			setIsOpen(direction === 'in');
		}, 100); // wait for animation to complete
	};

	const handleMouseEnter = async () => {
		clearTimeout(mouseLeaveTimeout);
		handleFade('in');
	};

	const handleMouseLeave = async () => {
		setMouseLeaveTimeout(
			setTimeout(() => {
				handleFade('out');
			}, mouseLeaveDebounceTime)
		);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsedTime(new Date() - new Date(clockedInSince));
		}, 1000);

		return () => clearInterval(interval);
	}, [clockedInSince]);

	useEffect(() => {
		async function fetchUnreadCount() {
			if (!userEntityData || !userEntityData.userId) return;

			const result = await api(
				'/api/notifications/get-num-unread',
				'POST'
			);

			if (!result.success) {
				console.error(
					'Failed to fetch unread notifications count:',
					result.message
				);
				return;
			}

			hasFetchedUnreadNotis.current = true;

			setNumUnreadNotis(result.data.numUnread || 0);
		}

		if (!hasFetchedUnreadNotis.current) {
			fetchUnreadCount();
		}
	}, [userEntityData]);

	if (!userEntityData || !path.startsWith('/portal')) {
		return null;
	}

	return (
		<>
			<div className='logo-container'>
				<Link
					to='/'
					className='topmenu-logo'
				>
					<h2 className='topmenu-logo-text'>The Zoo™</h2>
				</Link>
			</div>
			<div className='user-menu-container'>
				{userEntityType === 'employee' && (
					<>
						{clockedInSince && (
							<p className='topmenu-clock-text'>
								Clocked in for{' '}
								{` ${formatDuration(elapsedTime)}`}
							</p>
						)}
						{!clockedInSince && (
							<p className='topmenu-clock-text'>
								<Button
									variant='green'
									size='sm'
									onClick={() => clock('in')}
								>
									Clock In
								</Button>
							</p>
						)}
						{clockedInSince && (
							<p className='topmenu-clock-text'>
								<Button
									variant='green'
									size='sm'
									onClick={() => clock('out')}
								>
									Clock out
								</Button>
							</p>
						)}
					</>
				)}
				{userEntityType === 'employee' && businessEmployeeWorksFor && (
					<p
						style={{
							color: 'var(--color-lbrown)',
							marginRight: '1rem',
							marginLeft: '1rem',
						}}
					>
						<strong>{userEntityData.jobTitle}</strong> at{' '}
						<strong>{businessEmployeeWorksFor.name}</strong>
					</p>
				)}

				{userEntityType === 'customer' && (
					<>
						{membership && (
							<p style={{ color: 'var(--color-lgreen)' }}>
								Membership:{' '}
								<strong>
									{membership.level[0].toUpperCase() +
										membership.level.slice(1)}
								</strong>{' '}
								• Expires{' '}
								<strong>
									{new Date(
										membership.expireDate
									).toLocaleDateString()}
								</strong>
							</p>
						)}
						<Link
							to='/portal/cart'
							className='user-menu-link shopping-cart-btn'
						>
							<Button
								variant='outline'
								size='sm'
							>
								<ShoppingCart
									size={16}
									style={{
										marginRight: '0.2rem',
										marginLeft: '0.2rem',
									}}
								/>
								Shopping Cart ({cartItemCount})
							</Button>
						</Link>
					</>
				)}
				<div className='user-menu'>
					<button
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						className='user-menu-button'
					>
						<div
							className='avatar'
							style={{ position: 'relative' }}
						>
							<div
								style={{
									position: 'absolute',
									top: '-6px',
									right: '-6px',
								}}
							>
								{numUnreadNotis > 0 && (
									<div
										style={{
											backgroundColor:
												'var(--color-green)',
											color: 'var(--color-dbrown)',
											borderRadius: '50%',
											width: '20px',
											height: '20px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '0.75rem',
											fontWeight: 'bold',
										}}
									>
										{numUnreadNotis}
									</div>
								)}
							</div>
							{userEntityData.firstName.charAt(0)}
							{userEntityData.lastName.charAt(0)}
						</div>
						{userEntityData.firstName} {userEntityData.lastName}{' '}
						<ChevronDown
							size={20}
							style={{
								rotate: isOpen ? '180deg' : '0deg',
								transition: 'all 0.2s ease',
							}}
						/>
					</button>
					{isOpen && (
						<ul
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							className='user-menu-dropdown'
						>
							<Link
								to='/portal'
								className='user-menu-link'
							>
								<li>Portal Home</li>
							</Link>
							<Link
								to='/portal/notifications'
								className='user-menu-link'
							>
								<li style={{ position: 'relative' }}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '6px',
										}}
									>
										Notifications
										{numUnreadNotis > 0 && (
											<div
												style={{
													backgroundColor:
														'var(--color-green)',
													color: 'var(--color-dbrown)',
													borderRadius: '50%',
													width: '12px',
													height: '12px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '0.7rem',
													fontWeight: 'bold',
												}}
											/>
										)}
									</div>
								</li>
							</Link>
							<Link
								to='/portal/account'
								className='user-menu-link'
							>
								<li>My Account</li>
							</Link>
							<Link
								onClick={logout}
								className='user-menu-link'
							>
								<li>Logout</li>
							</Link>
						</ul>
					)}
				</div>
			</div>
		</>
	);
}
