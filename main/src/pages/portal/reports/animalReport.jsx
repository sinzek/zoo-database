import { useState, useEffect } from 'react';
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
	const [filterType, setFilterType] = useState('animals'); // 'animals', 'habitat', 'handler'
	
	// Filter options
	const [selectedAnimalIds, setSelectedAnimalIds] = useState([]);
	const [selectedHabitatId, setSelectedHabitatId] = useState('');
	const [selectedHandlerId, setSelectedHandlerId] = useState('');
	
	// Available options
	const [animals, setAnimals] = useState([]);
	const [habitats, setHabitats] = useState([]);
	const [handlers, setHandlers] = useState([]);
	
	const [error, setError] = useState('');

	const isAuthorized = userEntityData && 
		userEntityType === 'employee' && 
		['zookeeper', 'manager', 'executive', 'db_admin'].includes(userEntityData.accessLevel);

	// Load all filter options on mount
	useEffect(() => {
		if (!isAuthorized) return;

		const loadFilterOptions = async () => {
			try {
				// Load animals
				const animalsRes = await api('/api/animal/get-all-grouped-by-habitat', 'POST');
				if (animalsRes.success && Array.isArray(animalsRes.data)) {
					// Flatten the grouped structure
					const allAnimals = [];
					animalsRes.data.forEach(habitat => {
						if (habitat.animals && Array.isArray(habitat.animals)) {
							habitat.animals.forEach(animal => {
								allAnimals.push({
									...animal,
									displayName: `${animal.commonName} (${animal.firstName})`
								});
							});
						}
					});
					setAnimals(allAnimals);
				}

			// Load habitats
			const habitatsRes = await api('/api/habitats/get-all', 'POST');
			if (habitatsRes.success && Array.isArray(habitatsRes.data)) {
				setHabitats(habitatsRes.data);
			}

			// Load handlers (employees who take care of animals)
			// Get distinct employees from TakesCareOf table
			const handlersRes = await api('/api/employee/get-all-handlers', 'POST');
			if (handlersRes.success && Array.isArray(handlersRes.data)) {
				setHandlers(handlersRes.data);
			}
		} catch (e) {
			console.error('Failed to load filter options:', e);
		}
		};

		loadFilterOptions();
	}, [isAuthorized]);

	const loadReport = async () => {
		if (!isAuthorized) return;
		setLoading(true);
		setError('');
		
		try {
			const body = {};
			
			// Apply filters based on filter type
			if (filterType === 'animals' && selectedAnimalIds.length > 0) {
				body.animalIds = selectedAnimalIds;
			} else if (filterType === 'habitat' && selectedHabitatId) {
				body.habitatId = selectedHabitatId;
			} else if (filterType === 'handler' && selectedHandlerId) {
				body.handlerId = selectedHandlerId;
			} else {
				showToast('Please select at least one filter option', 'error');
				setLoading(false);
				return;
			}

			const res = await api('/api/animal-report/get', 'POST', body);
			
			if (res.success) {
				setReportData(Array.isArray(res.data) ? res.data : []);
				if (res.data.length === 0) {
					showToast('No animals found matching your criteria', 'info');
				}
			} else {
				setError(res.error || 'Failed to load animal report');
			}
		} catch (e) {
			setError(e?.message || 'Failed to load animal report');
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString();
	};

	const formatDateTime = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleString();
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
				<h1>Animal Report</h1>
			</div>

			<div className='report-filter-container'>
				<h2>Filter Options</h2>
				<div className='report-filter-form'>
					<div className='form-group'>
						<label>Filter By</label>
						<select 
							value={filterType} 
							onChange={(e) => {
								setFilterType(e.target.value);
								// Reset other filters
								setSelectedAnimalIds([]);
								setSelectedHabitatId('');
								setSelectedHandlerId('');
							}}
						>
							<option value='animals'>Specific Animals</option>
							<option value='habitat'>By Habitat</option>
							<option value='handler'>By Handler</option>
						</select>
					</div>

					{filterType === 'animals' && (
						<div className='form-group'>
							<label>Select Animals</label>
							<div className='checkbox-container'>
								{animals.map(animal => (
									<label key={animal.animalId} className='checkbox-item'>
										<input
											type='checkbox'
											checked={selectedAnimalIds.includes(animal.animalId)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedAnimalIds([...selectedAnimalIds, animal.animalId]);
												} else {
													setSelectedAnimalIds(selectedAnimalIds.filter(id => id !== animal.animalId));
												}
											}}
										/>
										<span>{animal.displayName}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{filterType === 'habitat' && (
						<div className='form-group'>
							<label>Select Habitat</label>
							<select
								value={selectedHabitatId}
								onChange={(e) => setSelectedHabitatId(e.target.value)}
							>
								<option value=''>Choose a habitat</option>
								{habitats.map(habitat => (
									<option key={habitat.habitatId} value={habitat.habitatId}>
										{habitat.name}
									</option>
								))}
							</select>
						</div>
					)}

					{filterType === 'handler' && (
						<div className='form-group'>
							<label>Select Handler</label>
							<select
								value={selectedHandlerId}
								onChange={(e) => setSelectedHandlerId(e.target.value)}
							>
								<option value=''>Choose a handler</option>
								{handlers.map(handler => (
									<option key={handler.employeeId} value={handler.employeeId}>
										{handler.firstName} {handler.lastName} ({handler.jobTitle})
									</option>
								))}
							</select>
						</div>
					)}

					<div className='report-filter-actions'>
						<Button
							onClick={loadReport}
							variant='green'
							loading={loading}
							className='load-button'
						>
							Generate Report
						</Button>
					</div>
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			{loading ? (
				<div className='centered-loader'><Loader /></div>
			) : reportData.length > 0 && (
				<div className='report-results'>
					<h2>Report Results ({reportData.length} animals)</h2>
					<div className='animal-report-list'>
						{reportData.map((animal) => (
							<div key={animal.animalId} className='animal-report-animal-card'>
								<div className='animal-header'>
									<h3>{animal.commonName}</h3>
									<p className='animal-names'>
										{animal.firstName} {animal.lastName || ''}
									</p>
									<p className='animal-species'>
										{animal.genus} {animal.species}
									</p>
								</div>

								<div className='animal-info'>
									<p><strong>Sex:</strong> {animal.sex}</p>
									<p><strong>Birth Date:</strong> {formatDate(animal.birthDate)}</p>
									{animal.deathDate && (
										<p><strong>Death Date:</strong> {formatDate(animal.deathDate)}</p>
									)}
									<p><strong>Habitat:</strong> {animal.habitatName || 'Unknown'}</p>
									{animal.behavior && <p><strong>Behavior:</strong> {animal.behavior}</p>}
									{animal.importedFrom && (
										<p><strong>Imported From:</strong> {animal.importedFrom}</p>
									)}
								</div>

								{animal.handlers && animal.handlers.length > 0 && (
									<div className='animal-section'>
										<h4>Handlers ({animal.handlers.length})</h4>
										<div className='handler-list'>
											{animal.handlers.map((handler, idx) => (
												<div key={idx} className='handler-item'>
													<p>{handler.firstName} {handler.lastName}</p>
													<p className='handler-role'>{handler.jobTitle}</p>
												</div>
											))}
										</div>
									</div>
								)}

								{animal.dietSchedules && animal.dietSchedules.length > 0 && (
									<div className='animal-section'>
										<h4>Diet & Feeding Schedule</h4>
										{animal.dietSchedules.map((diet, idx) => (
											<div key={idx} className='diet-info'>
												{diet.specialNotes && (
													<p className='diet-notes'><strong>Special Notes:</strong> {diet.specialNotes}</p>
												)}
												{diet.schedule && diet.schedule.length > 0 && (
													<div className='feeding-schedule'>
														<table className='schedule-table'>
															<thead>
																<tr>
																	<th>Day</th>
																	<th>Time</th>
																	<th>Food</th>
																</tr>
															</thead>
															<tbody>
																{diet.schedule.map((sched, schedIdx) => (
																	<tr key={schedIdx}>
																		<td>{sched.dayOfWeek}</td>
																		<td>{sched.feedTime}</td>
																		<td>{sched.food}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												)}
											</div>
										))}
									</div>
								)}

								{animal.medicalRecords && animal.medicalRecords.length > 0 && (
									<div className='animal-section'>
										<h4>Medical Records ({animal.medicalRecords.length})</h4>
										<div className='medical-records-list'>
											{animal.medicalRecords.map((record, idx) => (
												<div key={idx} className='medical-record-item'>
													<p><strong>Reason:</strong> {record.reasonForVisit}</p>
													<p><strong>Visit Date:</strong> {formatDateTime(record.visitDate)}</p>
													{record.checkoutDate && (
														<p><strong>Checkout Date:</strong> {formatDateTime(record.checkoutDate)}</p>
													)}
													{record.veterinarianNotes && (
														<p><strong>Notes:</strong> {record.veterinarianNotes}</p>
													)}
													{idx < animal.medicalRecords.length - 1 && <hr />}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

