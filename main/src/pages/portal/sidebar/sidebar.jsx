import { hasMinAccessLvl } from '../../../utils/access';
import { Link } from '../../../components/link';
import PropTypes from 'prop-types';

export function Sidebar({ ueType, uedata }) {
	if (ueType !== 'employee' || !hasMinAccessLvl('zookeeper', uedata)) {
		return null;
	}

	return (
		<div className='portal-sidebar'>
			<h2>The Zoo^TM</h2>
			<nav>
				<ul>
					{hasMinAccessLvl('zookeeper', uedata) && (
						<>
							<li>
								<Link
									to='/portal/shift-schedule'
									href='/portal/shift-schedule'
								>
									My Schedule
								</Link>
							</li>
							<li>
								<Link
									to='/portal/animals'
									href='/portal/animals'
								>
									Animals
								</Link>
							</li>
							<li>
								<Link
									to='/portal/habitats'
									href='/portal/habitats'
								>
									Habitats
								</Link>
							</li>
							<li>
								<Link
									to='/portal/medical-records'
									href='/portal/medical-records'
								>
									Medical Records
								</Link>
							</li>
							<li>
								<Link
									to='/portal/feeding-times'
									href='/portal/feeding-times'
								>
									Feeding Times
								</Link>
							</li>
							<li>
								<Link
									to='#'
									href='#'
								>
									File Complaints {/* troll face moment */}
								</Link>
							</li>
						</>
					)}
					{hasMinAccessLvl('manager', uedata) && (
						<>
							<li>
								<Link
									to='/portal/schedule-management'
									href='/portal/schedule-management'
								>
									Schedule Management
								</Link>
							</li>
							<li>
								<Link
									to='/portal/business-management'
									href='/portal/business-management'
								>
									Business Management
								</Link>
							</li>
							<li>
								<Link
									to='/portal/employee-management'
									href='/portal/employee-management'
								>
									Employees
								</Link>
							</li>
							<li>
								<Link
									to='/portal/reports'
									href='/portal/reports'
								>
									Reports
								</Link>
							</li>
						</>
					)}
				</ul>
			</nav>
		</div>
	);
}

Sidebar.propTypes = {
	ueType: PropTypes.string.isRequired,
	uedata: PropTypes.object.isRequired,
};
