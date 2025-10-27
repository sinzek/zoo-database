import { hasMinAccessLvl } from '../../../utils/access';
import { Link } from '../../../components/link';
import PropTypes from 'prop-types';
import { useRouter } from '../../../context/routerContext';
import { availableLinksForAccessLevel } from './utils';
import './sidebar.css';

export function Sidebar({ ueType, uedata }) {
	const { path } = useRouter();

	if (
		ueType !== 'employee' ||
		!hasMinAccessLvl('zookeeper', uedata) ||
		!path.startsWith('/portal')
	) {
		return null;
	}

	const links = availableLinksForAccessLevel(uedata);

	return (
		<div className='portal-sidebar'>
			<nav>
				<ul className='portal-sidebar-links'>
					{links.map((link) => (
						<li key={link.label}>
							<Link
								to={link.to}
								className={path === link.to ? 'active' : ''}
							>
								<link.icon className='portal-sidebar-link-icon' />
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}

Sidebar.propTypes = {
	ueType: PropTypes.string.isRequired,
	uedata: PropTypes.object.isRequired,
};
