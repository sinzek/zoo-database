import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { api } from '../../../utils/client-api-utils';
import { Loader } from '../../../components/loader/loader';

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

  const isAuthorized = userEntityData && userEntityType === 'employee' && ['manager','executive','db_admin'].includes(userEntityData.accessLevel);

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
      if (startDate) body.startDate = startDate;
      if (endDate) body.endDate = endDate;
      
      // If specific businesses are selected, filter by type within those businesses
      if (selectedBusinessIds.length > 0 && businessType) {
        // Filter selected businesses by type
        const filtered = businesses
          .filter(b => selectedBusinessIds.includes(b.businessId) && b.type === businessType)
          .map(b => b.businessId);
        body.businessIds = filtered;
      } else if (selectedBusinessIds.length > 0) {
        body.businessIds = selectedBusinessIds;
      } else if (businessType) {
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
      <div className='portal-attractions-page' style={{ paddingTop: '80px' }}>
        <p className='error-message'>Reports are available to managers and above.</p>
      </div>
    );
  }

  return (
    <div className='portal-attractions-page' style={{ paddingTop: '80px' }}>
      <div className='attractions-header'>
        <h1>Revenue Report</h1>
      </div>

      <div className='attraction-form' style={{ marginBottom: '1rem' }}>
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
          <div style={{ 
            maxHeight: '150px', 
            overflowY: 'auto', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '8px', 
            padding: '0.5rem',
            backgroundColor: 'var(--color-dbrown)'
          }}>
            {businesses.map(b => (
              <label key={b.businessId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type='checkbox' checked={useSummary} onChange={(e) => setUseSummary(e.target.checked)} />
            <span>Show Summary Only</span>
          </label>
        </div>
        <div className='form-actions'>
          <button type='button' className='save-button' onClick={loadReport}>Load Report</button>
        </div>
      </div>

      {loading ? (
        <div className='centered-loader'><Loader /></div>
      ) : error ? (
        <div className='error-message'>{error}</div>
      ) : (
        <div className='attractions-list'>
          <h2>Per Business</h2>
          {reports.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <div className='attractions-grid'>
              {reports.map((r) => (
                <div key={r.businessId} className='attraction-card'>
                  <div className='attraction-info'>
                    <h3>{r.businessName}</h3>
                    <p><strong>Type:</strong> {r.businessType}</p>
                    <p><strong>Total Revenue:</strong> ${r.totalRevenue?.toFixed(2)}</p>
                    <p><strong>Total Expenses:</strong> ${r.totalExpenses?.toFixed(2)}</p>
                    <p><strong>Net Profit:</strong> ${r.netProfit?.toFixed(2)}</p>
                    
                    {!useSummary && r.transactions && r.transactions.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4>Transactions ({r.transactions.length})</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {r.transactions.map((t, idx) => (
                            <div key={idx} style={{ borderBottom: '1px solid #555', padding: '0.25rem 0' }}>
                              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                <strong>{t.customerName}</strong> - {t.description || 'No description'}: ${parseFloat(t.amount || 0).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!useSummary && r.expenses && r.expenses.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4>Expenses ({r.expenses.length})</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {r.expenses.map((e, idx) => (
                            <div key={idx} style={{ borderBottom: '1px solid #555', padding: '0.25rem 0' }}>
                              <p style={{ margin: 0 }}>{e.expenseDescription}: ${parseFloat(e.cost || 0).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: '1rem' }}>Grand Totals</h2>
          <div className='attraction-card'>
            <div className='attraction-info'>
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


