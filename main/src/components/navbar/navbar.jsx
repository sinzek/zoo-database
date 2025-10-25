import { useUserData } from '../../context/userDataContext';
import { Button } from '../button';

import { Link } from '../link';
import './navbar.css';

export function Navbar() {
	const { userInfo, logout, authLoading } = useUserData();

	const links = [
		{ href: '/animals', label: 'Animals' },
		{ href: '/habitats', label: 'Habitats' },
		{ href: '/attractions', label: 'Attractions' },
		{ href: '/memberships', label: 'Memberships' },
	];

	return (
		<nav className='navbar'>
			<div className='navbar-content'>
				<Link
					to='/'
					className='navbar-logo'
					href='/'
				>
					<img
						src='/images/logo.webp'
						alt='Zoo Logo'
						className='logo-image'
						width={50}
						height={50}
					/>
					The Zoo™
				</Link>
				<ul className='navbar-links'>
					{links.map((link) => (
						<li
							key={link.href}
							className='navbar-item'
						>
							<Link
								to={link.href}
								href={link.href}
								className='navbar-link'
							>
								{link.label}
							</Link>
							<div className='navbar-underline' />
						</li>
					))}
				</ul>
			</div>
			<div className='buttons'>
				{userInfo ? (
					<>
						<Button
							variant='lgreen'
							size='lg'
							onClick={logout}
							loading={authLoading}
						>
							Log out
						</Button>
						<Link
							to='/portal'
							className='btn btn-brown btn-lg'
							href='/portal'
						>
							My Portal
						</Link>
					</>
				) : (
					<Link
						to='/login'
						href='/login'
					>
						<Button
							variant='lgreen'
							size='lg'
							loading={authLoading}
						>
							Login
						</Button>
					</Link>
				)}
			</div>
		</nav>
	);
}
