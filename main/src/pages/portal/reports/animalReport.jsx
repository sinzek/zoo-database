import { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { api } from '../../../utils/client-api-utils';
import { Loader } from '../../../components/loader/loader';
import { Button } from '../../../components/button';
import { showToast } from '../../../components/toast/showToast';
import './animalReport.css';

export function PortalAnimalReportPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [error, setError] = useState('');
	const [habitats, setHabitats] = useState([]);
	const [selectedHabitatId, setSelectedHabitatId] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	const isAuthorized = userEntityData && 
		userEntityType === 'employee' && 
		['zookeeper', 'manager', 'db_admin'].includes(userEntityData.accessLevel);

	// Load habitats on mount
	useEffect(() => {
		if (!isAuthorized) return;
		
		const loadHabitats = async () => {
			try {
				const res = await api('/api/habitats/get-all', 'POST');
				if (res.success && Array.isArray(res.data)) {
					setHabitats(res.data);
				}
			} catch (e) {
				console.error('Failed to load habitats:', e);
			}
		};
		
		loadHabitats();
	}, [isAuthorized]);

	const loadReport = useCallback(async () => {
		if (!isAuthorized) return;
		setLoading(true);
		setError('');
		
		try {
			const body = {};
			if (selectedHabitatId) {
				body.habitatId = selectedHabitatId;
			}
			
			const res = await api('/api/diet-report/get', 'POST', body);
			
			if (res.success) {
				const data = Array.isArray(res.data) ? res.data : [];
				setReportData(data);
				if (data.length === 0) {
					showToast('No diet schedule entries found', 'info');
				}
			} else {
				setError(res.error || 'Failed to load diet report');
			}
		} catch (e) {
			setError(e?.message || 'Failed to load diet report');
		} finally {
			setLoading(false);
		}
	}, [isAuthorized, selectedHabitatId]);

	// Load report on mount and when filters change
	useEffect(() => {
		if (isAuthorized) {
			loadReport();
		}
	}, [isAuthorized, loadReport]);

	// Filter by date range (habitat filtering is done on backend)
	useEffect(() => {
		// If no date filters, show all data
		if (!startDate && !endDate) {
			setFilteredData(reportData);
			return;
		}

		const filtered = reportData.filter((entry) => {
			// Filter by date range
			if (startDate || endDate) {
				const dayOfWeekMap = {
					'Monday': 1,
					'Tuesday': 2,
					'Wednesday': 3,
					'Thursday': 4,
					'Friday': 5,
					'Saturday': 6,
					'Sunday': 0
				};

				const entryDayOfWeek = dayOfWeekMap[entry.dayOfWeek];
				const start = startDate ? new Date(startDate) : null;
				const end = endDate ? new Date(endDate) : null;

				// Check if any date in the range matches the day of week
				if (start && end) {
					const currentDate = new Date(start);
					let foundMatch = false;
					
					while (currentDate <= end) {
						if (currentDate.getDay() === entryDayOfWeek) {
							foundMatch = true;
							break;
						}
						currentDate.setDate(currentDate.getDate() + 1);
					}
					
					return foundMatch;
				} else if (start) {
					// Check if start date or any date after matches
					const currentDate = new Date(start);
					const maxDate = new Date(start);
					maxDate.setDate(maxDate.getDate() + 365); // Check up to a year ahead
					
					while (currentDate <= maxDate) {
						if (currentDate.getDay() === entryDayOfWeek) {
							return true;
						}
						currentDate.setDate(currentDate.getDate() + 1);
					}
					return false;
				} else if (end) {
					// Check if end date or any date before matches
					const currentDate = new Date(end);
					const minDate = new Date(end);
					minDate.setDate(minDate.getDate() - 365); // Check up to a year back
					
					while (currentDate >= minDate) {
						if (currentDate.getDay() === entryDayOfWeek) {
							return true;
						}
						currentDate.setDate(currentDate.getDate() - 1);
					}
					return false;
				}
			}

			return true;
		});

		setFilteredData(filtered);
	}, [reportData, startDate, endDate]);

	const formatTime = (timeString) => {
		if (!timeString) return 'N/A';
		// Convert HH:mm:ss to HH:mm format
		return timeString.substring(0, 5);
	};

	const formatHandlers = (handlers) => {
		if (!handlers || handlers.length === 0) return 'N/A';
		return handlers.map(h => `${h.firstName} ${h.lastName}`).join(', ');
	};

	if (!isAuthorized) {
		return (
			<div className='animal-report-page'>
				<p className='error-message'>Reports are available to zookeepers and above.</p>
			</div>
		);
	}

	return (
		<div className='animal-report-page'>
			<div className='report-header'>
				<h1>Diet Report</h1>
				<Button
					onClick={loadReport}
					variant='green'
					loading={loading}
					className='load-button'
				>
					Refresh Report
				</Button>
			</div>

			<div className='report-filter-container'>
				<h2>Filter Options</h2>
				<div className='report-filter-form'>
					<div className='form-group'>
						<label htmlFor='habitatFilter'>Filter by Habitat</label>
						<select
							id='habitatFilter'
							value={selectedHabitatId}
							onChange={(e) => setSelectedHabitatId(e.target.value)}
						>
							<option value=''>All Habitats</option>
							{habitats.map((habitat) => (
								<option key={habitat.habitatId} value={habitat.habitatId}>
									{habitat.name}
								</option>
							))}
						</select>
					</div>

					<div className='form-group'>
						<label htmlFor='startDate'>Start Date (Optional)</label>
						<input
							type='date'
							id='startDate'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='endDate'>End Date (Optional)</label>
						<input
							type='date'
							id='endDate'
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							min={startDate || undefined}
						/>
					</div>
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			{loading ? (
				<div className='centered-loader'><Loader /></div>
			) : filteredData.length > 0 ? (
				<div className='report-results'>
					<h2>Diet Schedule ({filteredData.length} entries)</h2>
					<div className='diet-report-table-container'>
						<table className='diet-report-table'>
							<thead>
								<tr>
									<th>Day</th>
									<th>Time</th>
									<th>Animal</th>
									<th>Common Name</th>
									<th>Food</th>
									<th>Habitat</th>
									<th>Handler(s)</th>
								</tr>
							</thead>
							<tbody>
								{filteredData.map((entry, idx) => (
									<tr key={`${entry.animalId}-${entry.dayOfWeek}-${entry.feedTime}-${idx}`}>
										<td>{entry.dayOfWeek}</td>
										<td>{formatTime(entry.feedTime)}</td>
										<td>{entry.animalName}</td>
										<td>{entry.commonName}</td>
										<td>{entry.food}</td>
										<td>{entry.habitatName}</td>
										<td>{formatHandlers(entry.handlers)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className='report-results'>
					<p className='no-data-message'>No diet schedule entries found matching your filters.</p>
				</div>
			)}
		</div>
	);
}
