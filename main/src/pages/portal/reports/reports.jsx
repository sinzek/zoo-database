import { useUserData } from '../../../context/userDataContext';
import { hasMinAccessLvl } from '../../../utils/access';
import { Link } from '../../../components/link';
import '../portal.css';
import { BarChart2, Calendar, DollarSign, Apple } from 'lucide-react';

export function PortalReportsPage() {
	const { userEntityData } = useUserData();

	if (!hasMinAccessLvl('manager', userEntityData)) {
		return (
			<div className='portal-page-container'>
				<p className='error-message'>
					This page is only available for managers.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-page-container'>
			<h1
				className='portal-main-content'
				style={{ display: 'flex', alignItems: 'center', gap: 12 }}
			>
				<BarChart2 size={28} />
				Reports
			</h1>
			<p
				style={{
					marginTop: -8,
					marginBottom: 20,
					color: 'var(--color-lbrown)',
				}}
			>
				Choose a report to view details and export data.
			</p>

			<div className='options-grid'>
				<Link
					to='/portal/reports/shifts'
					href='/portal/reports/shifts'
					className='option-card'
				>
					<Calendar size={32} />
					Labor (Shifts)
				</Link>

				<Link
					to='/portal/reports/revenue'
					href='/portal/reports/revenue'
					className='option-card'
				>
					<DollarSign size={32} />
					Revenue
				</Link>

				<Link
					to='/portal/reports/animal'
					href='/portal/reports/animal'
					className='option-card'
				>
					<Apple size={32} />
					Diet Report
				</Link>
			</div>
		</div>
	);
}
