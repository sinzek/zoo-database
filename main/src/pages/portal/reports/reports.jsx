import { useUserData } from '../../../context/userDataContext';
import { Link } from '../../../components/link';

export function PortalReportsPage() {
  const { userEntityData, userEntityType } = useUserData();

  if (!userEntityData || userEntityType !== 'employee') {
    return (
      <div className='portal-attractions-page'>
        <p className='error-message'>This page is only available for employees.</p>
      </div>
    );
  }

  return (
    <div className='portal-attractions-page' style={{ paddingTop: '80px' }}>
      <div className='attractions-header'>
        <h1>Reports</h1>
      </div>

      <div className='attractions-list'>
        <h2>Select a report to view</h2>
        <div className='attractions-grid'>
          <div className='attraction-card'>
            <div className='attraction-info'>
              <h3>Revenue Reports</h3>
              <p>View revenue over time, by attraction, and more.</p>
            </div>
            <div className='attraction-actions'>
              <Link to='/portal/reports/revenue' href='/portal/reports/revenue' className='edit-button'>
                Open
              </Link>
            </div>
          </div>

          <div className='attraction-card'>
            <div className='attraction-info'>
              <h3>Shift Reports</h3>
              <p>Analyze staffing, hours worked, and schedule coverage.</p>
            </div>
            <div className='attraction-actions'>
              <Link to='/portal/reports/shifts' href='/portal/reports/shifts' className='edit-button'>
                Open
              </Link>
            </div>
          </div>

          <div className='attraction-card'>
            <div className='attraction-info'>
              <h3>Attendance Reports</h3>
              <p>Track visitor counts and trends.</p>
            </div>
            <div className='attraction-actions'>
              <Link to='/portal/reports/attendance' href='/portal/reports/attendance' className='edit-button'>
                Open
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


