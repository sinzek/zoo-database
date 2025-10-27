import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { useRouter } from '../../../context/routerContext';
import { showToast } from '../../../components/toast/showToast';
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
	const [isVeterinarian, setIsVeterinarian] = useState(false);

	useEffect(() => {
		// Check if user is a veterinarian
		if (userEntityData?.accessLevel) {
			const vetLevels = [
				'veterinarian',
				'senior-veterinarian',
				'executive',
			];
			setIsVeterinarian(vetLevels.includes(userEntityData.accessLevel));
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

	const handleEdit = (record) => {
		setEditingId(record.medicalRecordId);
		setEditingFormData({
			veterinarianNotes: record.veterinarianNotes || '',
			reasonForVisit: record.reasonForVisit || '',
			checkoutDate: record.checkoutDate || '',
		});
	};

	const handleSave = async (medicalRecordId) => {
		const result = await api('/api/medical-record/update', 'PUT', {
			medicalRecordId,
			...editingFormData,
		});

		if (result.success) {
			showToast('Medical record updated successfully', 'success');
			setEditingId(null);
			loadData();
		} else {
			showToast('Failed to update medical record', 'error');
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditingFormData({
			veterinarianNotes: '',
			reasonForVisit: '',
			checkoutDate: '',
		});
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
				<h2>Medical History</h2>
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
												<button
													onClick={() =>
														handleSave(
															record.medicalRecordId
														)
													}
													className='save-button'
												>
													<Save size={16} />
													Save
												</button>
												<button
													onClick={handleCancel}
													className='cancel-button'
												>
													<X size={16} />
													Cancel
												</button>
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
													<button
														onClick={() =>
															handleEdit(record)
														}
														className='edit-button'
													>
														<Edit size={16} />
														Edit
													</button>
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
