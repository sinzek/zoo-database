import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { api } from '../../../utils/client-api-utils';
import { Loader } from '../../../components/loader/loader';
import { Button } from '../../../components/button';
import './revenue.css';

export function PortalRevenueReportPage() {
  const { userEntityData, userEntityType } = useUserData();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [selectedBusinessIds, setSelectedBusinessIds] = useState([]);
  const [useSummary, setUseSummary] = useState(false);
  const [reports, setReports] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState('');

  const isAuthorized = userEntityData && userEntityType === 'employee' && ['manager', 'db_admin'].includes(userEntityData.accessLevel);

  // Load businesses on mount for filtering
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const res = await api('/api/business/get-all', 'POST');
        if (res.success && Array.isArray(res.data)) {
          setBusinesses(res.data);
        }
      } catch (e) {
        console.error('Failed to load businesses:', e);
      }
    };
    if (isAuthorized) {
      loadBusinesses();
    }
  }, [isAuthorized]);

  const loadReport = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const body = {};
      
      // Always send dates if provided
      if (startDate) {
        // Ensure startDate includes time to capture full day
        body.startDate = startDate + ' 00:00:00';
      }
      if (endDate) {
        // Ensure endDate includes time to capture full day
        body.endDate = endDate + ' 23:59:59';
      }
      
      // Send business IDs if any are selected
      if (selectedBusinessIds.length > 0) {
        body.businessIds = selectedBusinessIds;
      }
      
      // Send business type if selected (applies in addition to business IDs)
      if (businessType) {
        body.businessType = businessType;
      }
      
      const endpoint = useSummary ? '/api/revenue-report/summary' : '/api/revenue-report/full';
      const res = await api(endpoint, 'POST', body);
      
      if (res.success) {
        const raw = res.data;
        console.log('Raw response:', raw);
        console.log('First item structure:', raw[0]);
        // Handle nested array structure from backend
        let normalized;
        if (Array.isArray(raw)) {
          if (raw.length > 0 && Array.isArray(raw[0])) {
            normalized = raw[0];
          } else {
            normalized = raw;
          }
        } else {
          normalized = [];
        }
        console.log('Normalized reports:', normalized);
        console.log('Sample report object keys:', normalized[0] ? Object.keys(normalized[0]) : 'no items');
        setReports(Array.isArray(normalized) ? normalized : []);
      } else {
        setError(res.error || 'Failed to load revenue report');
      }
    } catch (e) {
      setError(e?.message || 'Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  };

  const totals = reports.reduce(
    (acc, r) => ({
      revenue: acc.revenue + (r.totalRevenue || 0),
      expenses: acc.expenses + (r.totalExpenses || 0),
      profit: acc.profit + (r.netProfit || 0),
    }),
    { revenue: 0, expenses: 0, profit: 0 }
  );

  if (!isAuthorized) {
    return (
      <div className='portal-revenue-page'>
        <p className='error-message'>Reports are available to managers and above.</p>
      </div>
    );
  }

  return (
    <div className='portal-revenue-page'>
      <div className='revenue-header'>
        <h1>Revenue Report</h1>
      </div>

      <div className='revenue-form-container'>
        <h2>Filter Options</h2>
        <div className='revenue-form'>
        <div className='form-group'>
          <label>Start Date</label>
          <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className='form-group'>
          <label>End Date</label>
          <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className='form-group'>
          <label>Business Type</label>
          <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
            <option value=''>All Types</option>
            <option value='zoo'>Zoo</option>
            <option value='retail'>Retail</option>
            <option value='food'>Food</option>
            <option value='vet_clinic'>Vet Clinic</option>
          </select>
        </div>
        <div className='form-group'>
          <label>Specific Businesses</label>
          <div className='business-checkbox-container'>
            {businesses.map(b => (
              <label key={b.businessId} className='business-checkbox-item'>
                <input 
                  type='checkbox' 
                  value={b.businessId}
                  checked={selectedBusinessIds.includes(b.businessId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBusinessIds([...selectedBusinessIds, b.businessId]);
                    } else {
                      setSelectedBusinessIds(selectedBusinessIds.filter(id => id !== b.businessId));
                    }
                  }}
                />
                <span>{b.name} ({b.type})</span>
              </label>
            ))}
          </div>
        </div>
        <div className='form-group'>
          <label className='checkbox-group'>
            <input type='checkbox' checked={useSummary} onChange={(e) => setUseSummary(e.target.checked)} />
            <span>Show Summary Only</span>
          </label>
        </div>
        <div className='revenue-form-actions'>
          <Button onClick={loadReport} loading={loading} variant='green' className='save-button'>
            Load Report
          </Button>
        </div>
        </div>
      </div>

      {loading ? (
        <div className='centered-loader'><Loader /></div>
      ) : error ? (
        <div className='error-message'>{error}</div>
      ) : (
        <div className='revenue-list'>
          <h2>Per Business</h2>
          {reports.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((r) => (
                <div key={r.businessId} className='revenue-card' style={{ width: '100%' }}>
                  <div className='revenue-info'>
                    <h3>{r.businessName}</h3>
                    <p><strong>Type:</strong> {r.businessType}</p>
                    <p><strong>Total Revenue:</strong> ${r.totalRevenue?.toFixed(2)}</p>
                    <p><strong>Total Expenses:</strong> ${r.totalExpenses?.toFixed(2)}</p>
                    <p><strong>Net Profit:</strong> ${r.netProfit?.toFixed(2)}</p>
                    
                    {!useSummary && r.transactions && r.transactions.length > 0 && (
                      <div className='table-section'>
                        <h4>Transactions ({r.transactions.length})</h4>
                        <div className='table-container'>
                          <table className='transactions-table'>
                            <thead>
                              <tr>
                                <th style={{ minWidth: '150px' }}>Customer</th>
                                <th style={{ minWidth: '200px' }}>Description</th>
                                <th style={{ minWidth: '150px' }}>Item/Membership</th>
                                <th style={{ minWidth: '150px' }}>Date</th>
                                <th style={{ minWidth: '100px' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.transactions.map((t, idx) => (
                                <tr key={idx}>
                                  <td>{t.customerName}</td>
                                  <td style={{ wordBreak: 'break-word' }}>{t.description || 'No description'}</td>
                                  <td>
                                    {t.itemName && <span>Item: {t.itemName}</span>}
                                    {t.membershipId && <span>Membership: {t.membershipId}</span>}
                                    {!t.itemName && !t.membershipId && <span>-</span>}
                                  </td>
                                  <td>{t.purchaseDate ? new Date(t.purchaseDate).toLocaleDateString() : '-'}</td>
                                  <td>${parseFloat(t.amount || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {!useSummary && r.expenses && r.expenses.length > 0 && (
                      <div className='table-section'>
                        <h4>Expenses ({r.expenses.length})</h4>
                        <div className='table-container'>
                          <table className='expenses-table'>
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th style={{ minWidth: '100px' }}>Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.expenses.map((e, idx) => (
                                <tr key={idx}>
                                  <td style={{ wordBreak: 'break-word' }}>{e.expenseDescription}</td>
                                  <td>${parseFloat(e.cost || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: '1rem' }}>Grand Totals</h2>
          <div className='revenue-card'>
            <div className='revenue-info'>
              <p>Total Revenue: ${totals.revenue.toFixed(2)}</p>
              <p>Total Expenses: ${totals.expenses.toFixed(2)}</p>
              <p>Net Profit: ${totals.profit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


