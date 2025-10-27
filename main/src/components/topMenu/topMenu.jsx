import { useState } from 'react';
import { useUserData } from '../../context/userDataContext';
import './topMenu.css';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { Link } from '../link';
import { useShoppingCart } from '../../context/shoppingCartContext';
import { Button } from '../button';
import { useRouter } from '../../context/routerContext';

export function TopMenu() {
	const { userEntityData, logout, userEntityType, businessEmployeeWorksFor } =
		useUserData();
	const { path } = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState(null);

	const { cartItemCount } = useShoppingCart();

	const mouseLeaveDebounceTime = 500; // milliseconds

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
				{userEntityType === 'employee' && businessEmployeeWorksFor && (
					<p
						style={{
							color: 'var(--color-lbrown)',
							marginRight: '1rem',
						}}
					>
						<strong>{userEntityData.jobTitle}</strong> at{' '}
						<strong>{businessEmployeeWorksFor.name}</strong>
					</p>
				)}
				{userEntityType === 'customer' && (
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
								style={{ marginRight: '0.2rem' }}
							/>
							Shopping Cart ({cartItemCount})
						</Button>
					</Link>
				)}
				<div className='user-menu'>
					<button
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						className='user-menu-button'
					>
						<div className='avatar'>
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
						>
							<Link
								to='/portal'
								className='user-menu-link'
							>
								<li>Portal Home</li>
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
