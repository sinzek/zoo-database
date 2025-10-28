import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import './portalAttractions.css';
import { Button } from '../../../components/button';

export function PortalAttractionsPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [attractions, setAttractions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [isManagerPlus, setIsManagerPlus] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		location: '',
		uiDescription: '',
		uiImage: '',
		startDate: '',
		endDate: '',
		// Operating hours
		mondayOpen: '',
		mondayClose: '',
		tuesdayOpen: '',
		tuesdayClose: '',
		wednesdayOpen: '',
		wednesdayClose: '',
		thursdayOpen: '',
		thursdayClose: '',
		fridayOpen: '',
		fridayClose: '',
		saturdayOpen: '',
		saturdayClose: '',
		sundayOpen: '',
		sundayClose: '',
	});

	useEffect(() => {
		// Check if user is manager or above
		if (userEntityData?.accessLevel) {
			const managerLevels = ['manager', 'executive', 'db_admin'];
			setIsManagerPlus(
				managerLevels.includes(userEntityData.accessLevel)
			);
		}

		loadData();
	}, [userEntityData]);

	const loadData = async () => {
		setLoading(true);
		const attractionsResult = await api('/api/attractions/get-all', 'POST');

		if (attractionsResult.success) {
			setAttractions(attractionsResult.data);
		} else {
			showToast('Failed to load attractions');
		}

		setLoading(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate operating hours - close time must be after open time
		const days = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday',
		];
		for (const day of days) {
			const openTime = formData[`${day}Open`];
			const closeTime = formData[`${day}Close`];

			if (openTime && closeTime) {
				// Convert HH:MM to minutes for comparison
				const [openHours, openMinutes] = openTime
					.split(':')
					.map(Number);
				const [closeHours, closeMinutes] = closeTime
					.split(':')
					.map(Number);
				const openTotal = openHours * 60 + openMinutes;
				const closeTotal = closeHours * 60 + closeMinutes;

				if (closeTotal <= openTotal) {
					showToast(
						`Invalid hours for ${day.charAt(0).toUpperCase() + day.slice(1)}: closing time must be after opening time`,
						'error'
					);
					return;
				}
			}
		}

		// Map form field names to API expected names
		const attractionData = {
			name: formData.name,
			location: formData.location,
			description: formData.uiDescription,
			uiImage: formData.uiImage,
			startingDay: formData.startDate,
			endingDay: formData.endDate,
			// Operating hours - pass empty strings directly (don't convert to undefined)
			mondayOpen: formData.mondayOpen,
			mondayClose: formData.mondayClose,
			tuesdayOpen: formData.tuesdayOpen,
			tuesdayClose: formData.tuesdayClose,
			wednesdayOpen: formData.wednesdayOpen,
			wednesdayClose: formData.wednesdayClose,
			thursdayOpen: formData.thursdayOpen,
			thursdayClose: formData.thursdayClose,
			fridayOpen: formData.fridayOpen,
			fridayClose: formData.fridayClose,
			saturdayOpen: formData.saturdayOpen,
			saturdayClose: formData.saturdayClose,
			sundayOpen: formData.sundayOpen,
			sundayClose: formData.sundayClose,
		};

		const result = editingId
			? await api('/api/attraction/update-info', 'PUT', {
					...attractionData,
					attractionId: editingId,
				})
			: await api('/api/attraction/create', 'POST', attractionData);

		if (result.success) {
			showToast(
				`Attraction ${editingId ? 'updated' : 'created'} successfully!`
			);
			setShowAddForm(false);
			setEditingId(null);
			resetForm();
			loadData();
		} else {
			showToast(
				`Failed to ${editingId ? 'update' : 'create'} attraction`,
				'error'
			);
		}
	};

	const resetForm = () => {
		setFormData({
			name: '',
			location: '',
			uiDescription: '',
			uiImage: '',
			startDate: '',
			endDate: '',
			mondayOpen: '',
			mondayClose: '',
			tuesdayOpen: '',
			tuesdayClose: '',
			wednesdayOpen: '',
			wednesdayClose: '',
			thursdayOpen: '',
			thursdayClose: '',
			fridayOpen: '',
			fridayClose: '',
			saturdayOpen: '',
			saturdayClose: '',
			sundayOpen: '',
			sundayClose: '',
		});
	};

	const handleEdit = (attraction) => {
		setEditingId(attraction.attractionId);

		// Helper function to format date for HTML input
		const formatDateForInput = (dateString) => {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toISOString().split('T')[0];
		};

		// Helper function to format time for HTML input
		const formatTimeForInput = (timeString) => {
			if (!timeString) return '';
			// timeString is in format HH:MM:SS, convert to HH:MM
			return timeString.substring(0, 5);
		};

		// Extract hours from the hours array
		const hoursMap = {};
		if (attraction.hours && Array.isArray(attraction.hours)) {
			attraction.hours.forEach((hour) => {
				const dayLower = hour.dayOfWeek.toLowerCase();
				// Create keys with proper capitalization (e.g., 'monday' -> 'mondayOpen', 'mondayClose')
				const openKey = `${dayLower}Open`;
				const closeKey = `${dayLower}Close`;
				hoursMap[openKey] = formatTimeForInput(hour.openTime);
				hoursMap[closeKey] = formatTimeForInput(hour.closeTime);
			});
			console.log('Hours map:', hoursMap); // Debug
		}

		setFormData({
			name: attraction.name || '',
			location: attraction.location || '',
			uiDescription: attraction.uiDescription || '',
			uiImage: attraction.uiImage || '',
			startDate: formatDateForInput(attraction.startDate),
			endDate: formatDateForInput(attraction.endDate),
			mondayOpen: hoursMap['mondayOpen'] || '',
			mondayClose: hoursMap['mondayClose'] || '',
			tuesdayOpen: hoursMap['tuesdayOpen'] || '',
			tuesdayClose: hoursMap['tuesdayClose'] || '',
			wednesdayOpen: hoursMap['wednesdayOpen'] || '',
			wednesdayClose: hoursMap['wednesdayClose'] || '',
			thursdayOpen: hoursMap['thursdayOpen'] || '',
			thursdayClose: hoursMap['thursdayClose'] || '',
			fridayOpen: hoursMap['fridayOpen'] || '',
			fridayClose: hoursMap['fridayClose'] || '',
			saturdayOpen: hoursMap['saturdayOpen'] || '',
			saturdayClose: hoursMap['saturdayClose'] || '',
			sundayOpen: hoursMap['sundayOpen'] || '',
			sundayClose: hoursMap['sundayClose'] || '',
		});
		setShowAddForm(true);
		// Scroll to form
		setTimeout(() => {
			const formElement = document.querySelector(
				'.attraction-form-container'
			);
			if (formElement) {
				formElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}
		}, 100);
	};

	const handleCancel = () => {
		setShowAddForm(false);
		setEditingId(null);
		resetForm();
	};

	const handleDelete = async (attraction) => {
		if (!confirm(`Are you sure you want to delete "${attraction.name}"?`)) {
			return;
		}

		try {
			const result = await api('/api/attraction/delete', 'POST', {
				attractionID: attraction.attractionId,
			});

			if (result.success) {
				showToast('Attraction deleted successfully', 'success');
				loadData();
			} else {
				showToast(
					result.error || 'Failed to delete attraction',
					'error'
				);
			}
		} catch (error) {
			showToast(error.message || 'Failed to delete attraction.', 'error');
		}
	};

	if (loading) {
		return (
			<div className='portal-attractions-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	if (!userEntityData || userEntityType !== 'employee') {
		return (
			<div className='portal-attractions-page'>
				<p className='error-message'>
					This page is only available for employees.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-attractions-page'>
			<div
				className='attractions-header'
				style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
			>
				<h1>Manage Attractions</h1>
				{isManagerPlus && (
					<Button
						onClick={() => {
							setShowAddForm(!showAddForm);
							if (showAddForm) {
								handleCancel();
							}
						}}
						className='add-button'
						variant='green'
						size='lg'
					>
						<Plus size={20} />
						{showAddForm ? 'Cancel' : 'Add Attraction'}
					</Button>
				)}
			</div>

			{showAddForm && (
				<div className='attraction-form-container'>
					<form
						onSubmit={handleSubmit}
						className='attraction-form'
					>
						<h2>
							{editingId
								? 'Edit Attraction'
								: 'Add New Attraction'}
						</h2>

						<div className='form-group'>
							<label>Name *</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className='form-group'>
							<label>Location *</label>
							<input
								type='text'
								value={formData.location}
								onChange={(e) =>
									setFormData({
										...formData,
										location: e.target.value,
									})
								}
								required
							/>
						</div>

						<div className='form-group'>
							<label>Description</label>
							<textarea
								value={formData.uiDescription}
								onChange={(e) =>
									setFormData({
										...formData,
										uiDescription: e.target.value,
									})
								}
								rows={5}
							/>
						</div>

						<div className='form-group'>
							<label>Image URL</label>
							<input
								type='url'
								value={formData.uiImage}
								onChange={(e) =>
									setFormData({
										...formData,
										uiImage: e.target.value,
									})
								}
								placeholder='https://example.com/image.jpg'
							/>
						</div>

						<div className='form-group'>
							<label>Start Date</label>
							<input
								type='date'
								value={formData.startDate}
								onChange={(e) =>
									setFormData({
										...formData,
										startDate: e.target.value,
									})
								}
							/>
						</div>

						<div className='form-group'>
							<label>End Date</label>
							<input
								type='date'
								value={formData.endDate}
								onChange={(e) =>
									setFormData({
										...formData,
										endDate: e.target.value,
									})
								}
							/>
						</div>

						<div className='form-group'>
							<label>Operating Hours (Time format: HH:MM)</label>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr 1fr',
									gap: '1rem',
								}}
							>
								{[
									{
										key: 'monday',
										label: 'Monday',
										open: 'mondayOpen',
										close: 'mondayClose',
									},
									{
										key: 'tuesday',
										label: 'Tuesday',
										open: 'tuesdayOpen',
										close: 'tuesdayClose',
									},
									{
										key: 'wednesday',
										label: 'Wednesday',
										open: 'wednesdayOpen',
										close: 'wednesdayClose',
									},
									{
										key: 'thursday',
										label: 'Thursday',
										open: 'thursdayOpen',
										close: 'thursdayClose',
									},
									{
										key: 'friday',
										label: 'Friday',
										open: 'fridayOpen',
										close: 'fridayClose',
									},
									{
										key: 'saturday',
										label: 'Saturday',
										open: 'saturdayOpen',
										close: 'saturdayClose',
									},
									{
										key: 'sunday',
										label: 'Sunday',
										open: 'sundayOpen',
										close: 'sundayClose',
									},
								].map((day) => (
									<div key={day.key}>
										<label
											style={{
												fontSize: '0.85rem',
												display: 'block',
												marginBottom: '0.5rem',
											}}
										>
											{day.label}
										</label>
										<input
											type='time'
											placeholder='Open'
											value={formData[day.open]}
											onChange={(e) =>
												setFormData({
													...formData,
													[day.open]: e.target.value,
												})
											}
											style={{
												width: '100%',
												marginBottom: '0.5rem',
											}}
										/>
										<input
											type='time'
											placeholder='Close'
											value={formData[day.close]}
											onChange={(e) =>
												setFormData({
													...formData,
													[day.close]: e.target.value,
												})
											}
											style={{ width: '100%' }}
										/>
									</div>
								))}
							</div>
						</div>

						<div className='form-actions'>
							<Button
								type='submit'
								variant='green'
								size='lg'
							>
								<Save size={16} />
								{editingId ? 'Update' : 'Create'} Attraction
							</Button>
							<Button
								type='button'
								onClick={handleCancel}
								variant='outline'
							>
								<X size={16} />
								Cancel
							</Button>
						</div>
					</form>
				</div>
			)}

			<div className='attractions-list'>
				<h2>All Attractions</h2>
				{attractions.length === 0 ? (
					<p className='no-attractions'>No attractions found.</p>
				) : (
					<div className='attractions-grid'>
						{attractions.map((attraction) => (
							<div
								key={attraction.attractionId}
								className='attraction-card'
							>
								<div className='attraction-header'>
									<h3>{attraction.name}</h3>
								</div>
								<div className='attraction-info'>
									<p>
										<strong>Location:</strong>{' '}
										{attraction.location}
									</p>
									{attraction.uiDescription && (
										<p>{attraction.uiDescription}</p>
									)}
									{attraction.startDate && (
										<p>
											<strong>Start Date:</strong>{' '}
											{new Date(
												attraction.startDate
											).toLocaleDateString()}
										</p>
									)}
									{attraction.endDate && (
										<p>
											<strong>End Date:</strong>{' '}
											{new Date(
												attraction.endDate
											).toLocaleDateString()}
										</p>
									)}
								</div>
								{isManagerPlus && (
									<div className='attraction-actions'>
										<Button
											onClick={() =>
												handleEdit(attraction)
											}
											className='edit-button'
											size='sm'
											variant='green'
										>
											<Edit2 size={16} />
											Edit
										</Button>
										<Button
											onClick={() =>
												handleDelete(attraction)
											}
											className='delete-button'
											variant='outline'
										>
											<Trash2 size={16} />
											Delete
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
