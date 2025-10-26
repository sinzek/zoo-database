import { hasMinAccessLvl } from '../../../utils/access';
import { Link } from '../../../components/link';
import PropTypes from 'prop-types';
import { useRouter } from '../../../context/routerContext';
import { availableLinksForAccessLevel } from './utils';

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
			<h2>The Zoo^TM</h2>
			<nav>
				<ul>
					{links.map((link) => (
						<li key={link.label}>
							<Link
								to={link.to}
								className={path === link.to ? 'active' : ''}
							>
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
