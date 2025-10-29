import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { useRouter } from '../../../context/routerContext';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import {
	Apple,
	Calendar,
	Plus,
	Trash2,
	Edit,
	Save,
	X,
	ChevronLeft,
} from 'lucide-react';
import './feedingScheduleDetail.css';
import { Button } from '../../../components/button';

// eslint-disable-next-line react/prop-types
export function FeedingScheduleDetailPage({ animalId }) {
	const { navigate } = useRouter();
	const { userEntityData } = useUserData();
	const [animal, setAnimal] = useState(null);
	const [diet, setDiet] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editingDayId, setEditingDayId] = useState(null);
	const [newDayFormData, setNewDayFormData] = useState({
		dayOfWeek: 'Monday',
		feedTime: '',
		food: '',
	});
	const [editingFormData, setEditingFormData] = useState({
		dayOfWeek: 'Monday',
		feedTime: '',
		food: '',
	});
	const [showNewForm, setShowNewForm] = useState(false);
	const [isZookeeperPlus, setIsZookeeperPlus] = useState(false);
	const [showCreateDietForm, setShowCreateDietForm] = useState(false);
	const [newDietFormData, setNewDietFormData] = useState({
		specialNotes: '',
	});

	useEffect(() => {
		// Check if user can edit (zookeeper+)
		if (userEntityData?.accessLevel) {
			const zookeeperLevels = [
				'zookeeper',
				'veterinarian',
				'manager',
				'executive',
				'db_admin',
			];
			setIsZookeeperPlus(
				zookeeperLevels.includes(userEntityData.accessLevel)
			);
		}

		if (animalId) {
			loadData();
		}
	}, [animalId, userEntityData]);

	const loadData = async () => {
		setLoading(true);

		// Get animal details
		const animalResult = await api('/api/animal/get-one-by-id', 'POST', {
			animalId,
		});

		if (animalResult.success) {
			setAnimal(animalResult.data);

			// Get diet for this animal by animalId
			const dietResult = await api(
				'/api/diet/get-by-animal-with-schedule',
				'POST',
				{
					animalId: animalResult.data.animalId,
				}
			);

			console.log('Diet result:', dietResult);

			if (
				dietResult.success &&
				dietResult.data &&
				dietResult.data.length > 0
			) {
				console.log('Setting diet:', dietResult.data[0]);
				setDiet(dietResult.data[0]);
			} else {
				console.log('Animal does not have a diet assigned');
				setDiet(null);
			}
		}

		setLoading(false);
	};

	const handleNewDaySubmit = async (e) => {
		e.preventDefault();

		if (!diet?.dietId) {
			showToast('Animal does not have a diet assigned', 'error');
			return;
		}

		const result = await api('/api/diet/add-schedule-day', 'POST', {
			dietId: diet.dietId,
			...newDayFormData,
		});

		if (result.success) {
			showToast('Feeding schedule day added successfully', 'success');
			setShowNewForm(false);
			setNewDayFormData({
				dayOfWeek: 'Monday',
				feedTime: '',
				food: '',
			});
			loadData();
		} else {
			showToast('Failed to add feeding schedule day', 'error');
		}
	};

	const handleEdit = (scheduleDay) => {
		setEditingDayId(scheduleDay.dietScheduleDayId);
		setEditingFormData({
			dayOfWeek: scheduleDay.dayOfWeek,
			feedTime: scheduleDay.feedTime.slice(0, 5), // Convert to HH:mm format
			food: scheduleDay.food,
		});
	};

	const handleSave = async (dietScheduleDayId) => {
		const result = await api('/api/diet/update-schedule-day', 'PUT', {
			dietScheduleDayId,
			...editingFormData,
		});

		if (result.success) {
			showToast('Feeding schedule updated successfully', 'success');
			setEditingDayId(null);
			loadData();
		} else {
			showToast('Failed to update feeding schedule', 'error');
		}
	};

	const handleCancel = () => {
		setEditingDayId(null);
		setEditingFormData({
			dayOfWeek: 'Monday',
			feedTime: '',
			food: '',
		});
	};

	const handleDelete = async (dietScheduleDayId) => {
		if (
			!confirm(
				'Are you sure you want to delete this feeding schedule day?'
			)
		) {
			return;
		}

		const result = await api('/api/diet/delete-schedule-day', 'POST', {
			dietScheduleDayId,
		});

		if (result.success) {
			showToast('Feeding schedule day deleted successfully', 'success');
			loadData();
		} else {
			showToast('Failed to delete feeding schedule day', 'error');
		}
	};

	const handleCreateDiet = async (e) => {
		e.preventDefault();

		const result = await api('/api/diet/create', 'POST', {
			animalId,
			...newDietFormData,
		});

		if (result.success) {
			console.log('Diet created successfully:', result);
			showToast('Diet created successfully', 'success');
			setShowCreateDietForm(false);
			setNewDietFormData({
				specialNotes: '',
			});
			// Reload data to fetch the newly created diet
			await loadData();
		} else {
			showToast('Failed to create diet', 'error');
		}
	};

	const goBack = () => {
		navigate('/portal/feeding-schedules');
	};

	const DAYS_OF_WEEK = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	];

	if (loading) {
		return (
			<div className='feeding-schedule-detail-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	return (
		<div className='feeding-schedule-detail-page'>
			<Button
				onClick={goBack}
				className='back-button'
				style={{ marginBottom: '1rem' }}
			>
				<ChevronLeft size={20} />
				Back to Feeding Schedules
			</Button>

			{animal && (
				<div className='animal-header'>
					{animal.imageUrl && (
						<img
							src={animal.imageUrl}
							alt={animal.firstName}
							className='animal-header-image'
						/>
					)}
					<div className='animal-header-info'>
						<h1>
							<Apple size={32} />
							{animal.firstName} {animal.lastName}
						</h1>
						<p className='common-name'>{animal.commonName}</p>
						<u
							style={{
								color: 'var(--color-lgreen)',
								marginTop: '0.5rem',
							}}
						>
							Special notes:
						</u>
						<p style={{ fontStyle: 'italic' }}>
							{diet && diet.specialNotes}
						</p>
					</div>
				</div>
			)}

			<div className='schedule-section'>
				{isZookeeperPlus && diet && (
					<div className='schedule-actions'>
						{!showNewForm && (
							<Button
								onClick={() => setShowNewForm(true)}
								className='add-day-button'
							>
								<Plus size={16} />
								Add Feeding Schedule Day
							</Button>
						)}
						{showNewForm && (
							<form
								onSubmit={handleNewDaySubmit}
								className='new-day-form'
							>
								<div className='form-row'>
									<div className='form-group'>
										<label>Day of Week</label>
										<select
											value={newDayFormData.dayOfWeek}
											onChange={(e) =>
												setNewDayFormData({
													...newDayFormData,
													dayOfWeek: e.target.value,
												})
											}
										>
											{DAYS_OF_WEEK.map((day) => (
												<option
													key={day}
													value={day}
												>
													{day}
												</option>
											))}
										</select>
									</div>
									<div className='form-group'>
										<label>Feed Time</label>
										<input
											type='time'
											value={newDayFormData.feedTime}
											onChange={(e) =>
												setNewDayFormData({
													...newDayFormData,
													feedTime: e.target.value,
												})
											}
											required
										/>
									</div>
									<div className='form-group'>
										<label>Food</label>
										<input
											type='text'
											value={newDayFormData.food}
											onChange={(e) =>
												setNewDayFormData({
													...newDayFormData,
													food: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div className='form-actions'>
									<Button
										type='submit'
										className='save-button'
										variant='green'
									>
										<Save size={16} />
										Add
									</Button>
									<Button
										type='button'
										onClick={() => {
											setShowNewForm(false);
											setNewDayFormData({
												dayOfWeek: 'Monday',
												feedTime: '',
												food: '',
											});
										}}
										variant='outline'
										className='cancel-button'
									>
										<X size={16} />
										Cancel
									</Button>
								</div>
							</form>
						)}
					</div>
				)}

				{!diet ? (
					<div className='no-diet-container'>
						<p className='no-diet'>
							No feeding schedule assigned to this animal.
						</p>
						{isZookeeperPlus && (
							<>
								{!showCreateDietForm ? (
									<Button
										onClick={() =>
											setShowCreateDietForm(true)
										}
										className='create-diet-button'
									>
										<Plus size={16} />
										Create Diet for This Animal
									</Button>
								) : (
									<form
										onSubmit={handleCreateDiet}
										className='create-diet-form'
									>
										<h3>Create Diet</h3>
										<div className='form-group'>
											<label>Special Notes</label>
											<textarea
												value={
													newDietFormData.specialNotes
												}
												onChange={(e) =>
													setNewDietFormData({
														...newDietFormData,
														specialNotes:
															e.target.value,
													})
												}
												rows={3}
												placeholder='Any special dietary requirements...'
											/>
										</div>
										<div className='form-actions'>
											<Button
												type='submit'
												className='save-button'
												variant='green'
											>
												<Save size={16} />
												Create Diet
											</Button>
											<Button
												type='button'
												onClick={() => {
													setShowCreateDietForm(
														false
													);
													setNewDietFormData({
														specialNotes: '',
													});
												}}
												className='cancel-button'
												variant='outline'
											>
												<X size={16} />
												Cancel
											</Button>
										</div>
									</form>
								)}
							</>
						)}
					</div>
				) : diet.scheduleDays && diet.scheduleDays.length === 0 ? (
					<p className='no-schedule'>
						No feeding schedule days configured.
					</p>
				) : (
					<div className='schedule-days'>
						{diet.scheduleDays
							.sort((a, b) => {
								return (
									DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
									DAYS_OF_WEEK.indexOf(b.dayOfWeek)
								);
							})
							.map((day) => {
								const isEditing =
									editingDayId === day.dietScheduleDayId;
								return (
									<div
										key={day.dietScheduleDayId}
										className='schedule-day-card'
									>
										{isEditing ? (
											<div className='edit-form'>
												<div className='form-row'>
													<div className='form-group'>
														<label>
															Day of Week
														</label>
														<select
															value={
																editingFormData.dayOfWeek
															}
															onChange={(e) =>
																setEditingFormData(
																	{
																		...editingFormData,
																		dayOfWeek:
																			e
																				.target
																				.value,
																	}
																)
															}
														>
															{DAYS_OF_WEEK.map(
																(d) => (
																	<option
																		key={d}
																		value={
																			d
																		}
																	>
																		{d}
																	</option>
																)
															)}
														</select>
													</div>
													<div className='form-group'>
														<label>Feed Time</label>
														<input
															type='time'
															value={
																editingFormData.feedTime
															}
															onChange={(e) =>
																setEditingFormData(
																	{
																		...editingFormData,
																		feedTime:
																			e
																				.target
																				.value,
																	}
																)
															}
														/>
													</div>
													<div className='form-group'>
														<label>Food</label>
														<input
															type='text'
															value={
																editingFormData.food
															}
															onChange={(e) =>
																setEditingFormData(
																	{
																		...editingFormData,
																		food: e
																			.target
																			.value,
																	}
																)
															}
														/>
													</div>
												</div>
												<div className='form-actions'>
													<Button
														onClick={() =>
															handleSave(
																day.dietScheduleDayId
															)
														}
														className='save-button'
														variant='green'
													>
														<Save size={16} />
														Save
													</Button>
													<Button
														onClick={handleCancel}
														className='cancel-button'
														variant='green'
													>
														<X size={16} />
														Cancel
													</Button>
												</div>
											</div>
										) : (
											<>
												<div className='schedule-day-header'>
													<h3>
														<Calendar size={20} />
														{day.dayOfWeek}
													</h3>
													{isZookeeperPlus && (
														<div className='action-buttons'>
															<Button
																onClick={() =>
																	handleEdit(
																		day
																	)
																}
																className='edit-button'
																variant='green'
															>
																<Edit
																	size={16}
																/>
															</Button>
															<Button
																onClick={() =>
																	handleDelete(
																		day.dietScheduleDayId
																	)
																}
																className='delete-button'
																variant='outline'
															>
																<Trash2
																	size={16}
																/>
															</Button>
														</div>
													)}
												</div>
												<div className='schedule-day-info'>
													<div className='info-item'>
														<strong>
															Feed Time:
														</strong>{' '}
														{day.feedTime}
													</div>
													<div className='info-item'>
														<strong>Food:</strong>{' '}
														{day.food}
													</div>
												</div>
											</>
										)}
									</div>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
}
