import { api } from '../../utils/client-api-utils';
import { Link } from '../link';
import './navbar.css';

export function Navbar() {
	const links = [
		{ href: '/animals', label: 'Animals' },
		{ href: '/habitats', label: 'Habitats' },
		{ href: '/attractions', label: 'Attractions' },
		{ href: '/memberships', label: 'Memberships' },
	];

	const testApi = async () => {
		const res = await api('/api/dummy-data/gen-customers', 'POST');

		if (!res.success) {
			alert('API Test Error: ' + res.error);
			return;
		}

		alert('API Test Success: ' + JSON.stringify(res.data));
	};

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
					<li
						className='navbar-item-special'
						onClick={testApi}
					>
						Test the API
					</li>
				</ul>
			</div>
			<div className='buttons'>
				<Link
					to='/login'
					className='btn btn-lgreen'
					href='/login'
				>
					Login
				</Link>
				<Link
					to='/signup'
					className='btn btn-brown'
					href='/signup'
				>
					Sign Up
				</Link>
			</div>
		</nav>
	);
}
