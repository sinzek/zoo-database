import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { useRouter } from '../../../context/routerContext';
import { showToast } from '../../../components/toast/showToast.jsx';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import {
	HeartPulse,
	FileText,
	Calendar,
	Clock,
	Edit,
	Save,
	X,
	ChevronLeft,
	Plus,
	Trash2,
} from 'lucide-react';
import './medicalRecordDetail.css';
import { Button } from '../../../components/button';

// eslint-disable-next-line react/prop-types
export function MedicalRecordDetailPage({ animalId }) {
	const { navigate } = useRouter();
	const { userEntityData } = useUserData();
	const [animal, setAnimal] = useState(null);
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState(null);
	const [editingFormData, setEditingFormData] = useState({
		veterinarianNotes: '',
		reasonForVisit: '',
		checkoutDate: '',
	});
	const [showNewRecordForm, setShowNewRecordForm] = useState(false);
	const [newRecordFormData, setNewRecordFormData] = useState({
		veterinarianNotes: '',
		reasonForVisit: '',
		visitDate: '',
		checkoutDate: '',
	});
	const [isVeterinarian, setIsVeterinarian] = useState(false);

	useEffect(() => {
		// Check if user is a veterinarian or above
		if (userEntityData?.accessLevel) {
			const vetLevels = [
				'veterinarian',
				'manager',
				'executive',
				'db_admin',
			];
			const isVet = vetLevels.includes(userEntityData.accessLevel);
			setIsVeterinarian(isVet);
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
		}

		// Get medical records
		const recordsResult = await api(
			'/api/medical-record/get-by-animal',
			'POST',
			{
				animalId,
			}
		);

		if (recordsResult.success) {
			setRecords(recordsResult.data || []);
		}

		setLoading(false);
	};

	const formatDateForInput = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		// Convert to YYYY-MM-DDTHH:mm format for datetime-local
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	const handleEdit = (record) => {
		setEditingId(record.medicalRecordId);
		setEditingFormData({
			veterinarianNotes: record.veterinarianNotes || '',
			reasonForVisit: record.reasonForVisit || '',
			checkoutDate: formatDateForInput(record.checkoutDate),
		});
	};

	const handleSave = async (medicalRecordId) => {
		setLoading(true);
		const result = await api('/api/medical-record/update', 'PUT', {
			medicalRecordId,
			...editingFormData,
		});

		if (!result.success) {
			console.error('Update error:', result.error);
			showToast('Failed to update medical record');
		}

		showToast('Medical record updated successfully', 'success');
		setEditingId(null);
		loadData();

		setLoading(false);
	};

	const handleDelete = async (medicalRecordId) => {
		if (!confirm('Are you sure you want to delete this medical record?')) {
			return;
		}
		setLoading(true);
		const result = await api('/api/medical-record/delete', 'POST', {
			medicalRecordId,
		});

		if (result.success) {
			showToast('Medical record deleted successfully');
			loadData();
		} else {
			showToast('Failed to delete medical record');
		}

		setLoading(false);
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditingFormData({
			veterinarianNotes: '',
			reasonForVisit: '',
			checkoutDate: '',
		});
	};

	const handleNewRecordSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);

		const result = await api('/api/medical-record/create', 'POST', {
			animalId,
			...newRecordFormData,
		});

		if (result.success) {
			showToast('Medical record created successfully');
			setShowNewRecordForm(false);
			setNewRecordFormData({
				veterinarianNotes: '',
				reasonForVisit: '',
				visitDate: '',
				checkoutDate: '',
			});
			loadData();
		} else {
			showToast('Failed to create medical record');
		}

		setLoading(false);
	};

	const goBack = () => {
		navigate('/portal/medical-records');
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className='medical-record-detail-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	return (
		<div className='medical-record-detail-page'>
			<Button
				variant='outline'
				onClick={goBack}
				size='lg'
				style={{ marginBottom: '1rem' }}
			>
				<ChevronLeft size={20} />
				Back to Medical Records
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
							<HeartPulse size={32} />
							{animal.firstName} {animal.lastName}
						</h1>
						<p className='common-name'>{animal.commonName}</p>
						{animal.birthDate && (
							<p className='birth-date'>
								Born:{' '}
								{new Date(
									animal.birthDate
								).toLocaleDateString()}
							</p>
						)}
						{animal.deathDate && (
							<p className='death-date'>
								Deceased:{' '}
								{new Date(
									animal.deathDate
								).toLocaleDateString()}
							</p>
						)}
					</div>
				</div>
			)}

			<div className='records-section'>
				<div className='records-section-header'>
					<h2>Medical History</h2>
					{isVeterinarian && (
						<Button
							onClick={() =>
								setShowNewRecordForm(!showNewRecordForm)
							}
							className='add-record-button'
							variant='green'
							style={{ marginBottom: '1rem' }}
						>
							<Plus size={16} />
							{showNewRecordForm
								? 'Cancel'
								: 'Add Medical Record'}
						</Button>
					)}
				</div>

				{showNewRecordForm && (
					<form
						onSubmit={handleNewRecordSubmit}
						className='new-record-form'
					>
						<h3>Create New Medical Record</h3>
						<div className='form-group'>
							<label>Reason for Visit *</label>
							<input
								type='text'
								value={newRecordFormData.reasonForVisit}
								onChange={(e) =>
									setNewRecordFormData({
										...newRecordFormData,
										reasonForVisit: e.target.value,
									})
								}
								required
								placeholder="E.g., 'Annual Checkup'"
							/>
						</div>
						<div className='form-group'>
							<label>Visit Date *</label>
							<input
								type='datetime-local'
								value={newRecordFormData.visitDate}
								onChange={(e) =>
									setNewRecordFormData({
										...newRecordFormData,
										visitDate: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className='form-group'>
							<label>Checkout Date</label>
							<input
								type='datetime-local'
								value={newRecordFormData.checkoutDate}
								onChange={(e) =>
									setNewRecordFormData({
										...newRecordFormData,
										checkoutDate: e.target.value,
									})
								}
							/>
							<p className='form-hint'>
								Leave empty if animal is still in care
							</p>
						</div>
						<div className='form-group'>
							<label>Veterinarian Notes</label>
							<textarea
								value={newRecordFormData.veterinarianNotes}
								onChange={(e) =>
									setNewRecordFormData({
										...newRecordFormData,
										veterinarianNotes: e.target.value,
									})
								}
								rows={4}
								style={{
									boxSizing: 'border-box',
									width: '100%',
								}}
								placeholder='Enter any notes from the veterinarian here.'
							/>
						</div>
						<div className='form-actions'>
							<Button
								type='submit'
								variant='green'
								loading={loading}
							>
								<Save size={16} />
								Create Record
							</Button>
							<Button
								type='button'
								onClick={() => {
									setShowNewRecordForm(false);
									setNewRecordFormData({
										veterinarianNotes: '',
										reasonForVisit: '',
										visitDate: '',
										checkoutDate: '',
									});
								}}
								variant='outline'
							>
								<X size={16} />
								Cancel
							</Button>
						</div>
					</form>
				)}

				{records.length === 0 ? (
					<p className='no-records'>
						No medical records found for this animal.
					</p>
				) : (
					<div className='records-list'>
						{records.map((record) => {
							const isEditing =
								editingId === record.medicalRecordId;
							return (
								<div
									key={record.medicalRecordId}
									className='record-card'
								>
									{isEditing ? (
										<div className='record-edit-form'>
											<div className='form-group'>
												<label>Reason for Visit</label>
												<input
													type='text'
													value={
														editingFormData.reasonForVisit
													}
													onChange={(e) =>
														setEditingFormData({
															...editingFormData,
															reasonForVisit:
																e.target.value,
														})
													}
													placeholder="E.g., 'Annual Checkup'"
												/>
											</div>
											<div className='form-group'>
												<label>
													Veterinarian Notes
												</label>
												<textarea
													value={
														editingFormData.veterinarianNotes
													}
													onChange={(e) =>
														setEditingFormData({
															...editingFormData,
															veterinarianNotes:
																e.target.value,
														})
													}
													rows={4}
													placeholder='Enter any notes from the veterinarian here'
												/>
											</div>
											<div className='form-group'>
												<label>Checkout Date</label>
												<input
													type='datetime-local'
													value={
														editingFormData.checkoutDate
													}
													onChange={(e) =>
														setEditingFormData({
															...editingFormData,
															checkoutDate:
																e.target.value,
														})
													}
												/>
											</div>
											<div className='form-actions'>
												<Button
													onClick={() =>
														handleSave(
															record.medicalRecordId
														)
													}
													variant='green'
												>
													<Save size={16} />
													Save
												</Button>
												<Button
													onClick={handleCancel}
													variant='outline'
												>
													<X size={16} />
													Cancel
												</Button>
											</div>
										</div>
									) : (
										<>
											<div className='record-header'>
												<h3>
													<FileText size={20} />
													{record.reasonForVisit}
												</h3>
												{isVeterinarian && (
													<div className='record-actions'>
														<Button
															onClick={() =>
																handleEdit(
																	record
																)
															}
															variant='green'
															size='sm'
														>
															<Edit size={16} />
															Edit
														</Button>
														<Button
															onClick={() =>
																handleDelete(
																	record.medicalRecordId
																)
															}
															style={{
																marginTop:
																	'10px',
															}}
															variant='outline'
															size='sm'
														>
															<Trash2 size={16} />
															Delete
														</Button>
													</div>
												)}
											</div>
											<div className='record-info'>
												<div className='info-row'>
													<Calendar size={16} />
													<strong>
														Visit Date:
													</strong>{' '}
													{formatDate(
														record.visitDate
													)}
												</div>
												{record.checkoutDate && (
													<div className='info-row'>
														<Clock size={16} />
														<strong>
															Checkout:
														</strong>{' '}
														{formatDate(
															record.checkoutDate
														)}
													</div>
												)}
												{!record.checkoutDate && (
													<div className='info-row active'>
														<Clock size={16} />
														<strong>
															Status:
														</strong>{' '}
														Active (Still in care)
													</div>
												)}
											</div>
											{record.veterinarianNotes && (
												<div className='record-notes'>
													<strong>Notes:</strong>
													<p>
														{
															record.veterinarianNotes
														}
													</p>
												</div>
											)}
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
