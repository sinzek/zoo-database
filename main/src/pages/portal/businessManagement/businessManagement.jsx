/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { hasMinAccessLvl } from '../../../utils/access';
import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { Button } from '../../../components/button';
import {
	Building,
	Edit,
	Trash2,
	Plus,
	Save,
	X,
	ShoppingBag,
} from 'lucide-react';
import './businessManagement.css';
import { Link } from '../../../components/link';

const initialFormData = {
	name: '',
	address: '',
	phone: '',
	email: '',
	uiDescription: '',
	type: 'zoo',
	ownerId: '',
	hours: {
		Sunday: { openTime: undefined, closeTime: undefined },
		Monday: { openTime: undefined, closeTime: undefined },
		Tuesday: { openTime: undefined, closeTime: undefined },
		Wednesday: { openTime: undefined, closeTime: undefined },
		Thursday: { openTime: undefined, closeTime: undefined },
		Friday: { openTime: undefined, closeTime: undefined },
		Saturday: { openTime: undefined, closeTime: undefined },
	},
};

function BusinessModal({ business, onClose, onSave, isDbAdmin }) {
	const [formData, setFormData] = useState(initialFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (business) {
			const newFormData = {
				...initialFormData,
				...business,
				hours: { ...initialFormData.hours },
			};
			if (business.hours) {
				business.hours.forEach((h) => {
					newFormData.hours[h.dayOfWeek] = {
						openTime: h.openTime.slice(0, 5),
						closeTime: h.closeTime.slice(0, 5),
					};
				});
			}
			setFormData(newFormData);
		} else {
			setFormData(initialFormData);
		}
	}, [business]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleHourChange = (day, type, value) => {
		setFormData((prev) => ({
			...prev,
			hours: {
				...prev.hours,
				[day]: { ...prev.hours[day], [type]: value },
			},
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		await onSave(formData);
		setIsSubmitting(false);
	};

	const days = Object.keys(initialFormData.hours);

	const handleSetDayClosed = (day) => {
		setFormData((prev) => {
			const isCurrentlyClosed = !prev.hours[day]?.openTime;
			const newHours = isCurrentlyClosed
				? { openTime: '09:00', closeTime: '17:00' } // set to default open hours
				: { openTime: undefined, closeTime: undefined }; // set to closed

			return {
				...prev,
				hours: {
					...prev.hours,
					[day]: newHours,
				},
			};
		});
	};

	return (
		<div className='modal-backdrop'>
			<div className='modal-content business-modal'>
				<h2>{business ? 'Edit Business' : 'Create Business'}</h2>
				<form
					onSubmit={handleSubmit}
					className='business-form'
				>
					<div className='form-section'>
						<h3>Business Info</h3>
						<div className='form-group'>
							<label htmlFor='name'>Name</label>
							<input
								name='name'
								value={formData.name}
								onChange={handleChange}
								placeholder='Business Name'
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='address'>Address</label>
							<input
								name='address'
								value={formData.address}
								onChange={handleChange}
								placeholder='Address'
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='phone'>Phone</label>
							<input
								name='phone'
								value={formData.phone}
								onChange={handleChange}
								placeholder='Phone (10 digits)'
								pattern='\d{10}'
								title='Phone number must be 10 digits.'
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='email'>Email</label>
							<input
								name='email'
								value={formData.email}
								onChange={handleChange}
								placeholder='Email'
								type='email'
								required
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='uiDescription'>
								UI Description
							</label>
							<textarea
								name='uiDescription'
								value={formData.uiDescription}
								onChange={handleChange}
								placeholder='UI Description'
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='type'>Business Type</label>
							<select
								name='type'
								value={formData.type}
								onChange={handleChange}
							>
								<option value='zoo'>Zoo</option>
								<option value='retail'>Retail</option>
								<option value='food'>Food</option>
								<option value='vet_clinic'>Vet Clinic</option>
							</select>
						</div>

						{isDbAdmin && (
							<>
								<label htmlFor='ownerId'>
									Owner Employee ID
								</label>
								<input
									name='ownerId'
									value={formData.ownerId}
									onChange={handleChange}
									placeholder='Owner Employee ID (Optional)'
								/>
							</>
						)}
					</div>

					<div className='form-section'>
						<h3>Operating Hours</h3>
						<div className='hours-grid'>
							{days.map((day) => (
								<div
									key={day}
									className='hour-row'
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '5px',
										}}
									>
										<input
											type='checkbox'
											className='checkbox'
											checked={
												!formData.hours[day].openTime
											}
											onChange={() =>
												handleSetDayClosed(day)
											}
										/>{' '}
										Closed
									</div>
									<label>{day}</label>
									<input
										type='time'
										value={
											formData.hours[day].openTime ?? ''
										}
										onChange={(e) =>
											handleHourChange(
												day,
												'openTime',
												e.target.value
											)
										}
									/>
									<input
										type='time'
										value={
											formData.hours[day].closeTime ?? ''
										}
										onChange={(e) =>
											handleHourChange(
												day,
												'closeTime',
												e.target.value
											)
										}
									/>
								</div>
							))}
						</div>
					</div>

					<div className='form-actions'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={isSubmitting}
						>
							<X size={16} /> Cancel
						</Button>
						<Button
							type='submit'
							variant='green'
							loading={isSubmitting}
						>
							<Save size={16} /> Save
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

export function BusinessManagementPage() {
	const { userEntityData } = useUserData();
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBusiness, setEditingBusiness] = useState(null);

	const hasAccess = hasMinAccessLvl('manager', userEntityData);
	const isDbAdmin = userEntityData?.accessLevel === 'db_admin';

	const loadBusinesses = useCallback(async () => {
		setLoading(true);
		const result = await api('/api/business/get-all-with-hours', 'POST');
		if (result.success) {
			setBusinesses(result.data);
		} else {
			showToast('Failed to load businesses.');
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (hasAccess) {
			loadBusinesses();
		} else {
			setLoading(false);
		}
	}, [hasAccess, loadBusinesses]);

	const handleCreate = () => {
		setEditingBusiness(null);
		setIsModalOpen(true);
	};

	const handleEdit = (business) => {
		setEditingBusiness(business);
		setIsModalOpen(true);
	};

	const handleDelete = async (businessId) => {
		if (
			window.confirm(
				'Are you sure you want to delete this business? This action cannot be undone.'
			)
		) {
			const result = await api('/api/business/delete', 'POST', {
				businessId,
			});
			if (result.success) {
				showToast('Business deleted successfully.');
				loadBusinesses();
			} else {
				showToast(result.error || 'Failed to delete business.');
			}
		}
	};

	const handleSave = async (formData) => {
		const endpoint = formData.businessId
			? '/api/business/update-one'
			: '/api/business/create-one';
		const method = formData.businessId ? 'PUT' : 'POST';

		const result = await api(endpoint, method, formData);

		if (result.success) {
			showToast(
				`Business ${formData.businessId ? 'updated' : 'created'} successfully.`
			);
			setIsModalOpen(false);
			loadBusinesses();
		} else {
			showToast(result.error || 'Failed to save business.');
		}
	};

	if (loading) {
		return (
			<div className='centered-page'>
				<Loader />
			</div>
		);
	}

	if (!hasAccess) {
		return (
			<div className='centered-page'>
				<p>You do not have permission to access this page.</p>
			</div>
		);
	}

	return (
		<div className='page business-management-page'>
			<header className='business-header'>
				<h1>Business Management</h1>
				{isDbAdmin && (
					<Button
						variant='green'
						onClick={handleCreate}
					>
						<Plus size={16} /> Create Business
					</Button>
				)}
			</header>

			<div className='businesses-grid'>
				{businesses.map((business) => {
					const canEdit =
						isDbAdmin ||
						userEntityData.businessId === business.businessId;
					return (
						<div
							key={business.businessId}
							className='business-card'
						>
							<div className='business-card-header'>
								<h3>
									<Building size={20} /> {business.name}
								</h3>
								<span className='business-type'>
									{business.type}
									{business.businessId ===
										userEntityData.businessId &&
										' (You work here)'}
								</span>
							</div>
							<p>{business.address}</p>
							<p>
								{business.email} | {business.phone}
							</p>
							{business.uiDescription && (
								<p className='description'>
									{business.uiDescription}
								</p>
							)}
							<h4 className='op-hours'>Operating Hours:</h4>
							{business.hours && business.hours.length > 0 ? (
								<div className='hours-list'>
									{business.hours.map((h) => (
										<div
											key={h.dayOfWeek}
											className='hour-row'
										>
											<strong>{h.dayOfWeek}:</strong>{' '}
											{h.openTime === '00:00:00' &&
											h.closeTime === '00:00:00'
												? 'Closed'
												: `${h.openTime.slice(
														0,
														5
													)} - ${h.closeTime.slice(
														0,
														5
													)}`}
										</div>
									))}
								</div>
							) : (
								<p>No operating hours available.</p>
							)}

							{canEdit && (
								<div className='card-actions'>
									<Button
										variant='green'
										size='lg'
										onClick={() => handleEdit(business)}
									>
										<Edit size={14} /> Edit
									</Button>
									<Link
										to={`/portal/inventory-management/${business.businessId}`}
										href={`/portal/inventory-management/${business.businessId}`}
									>
										<Button
											variant='outline'
											size='lg'
											onClick={() => handleEdit(business)}
										>
											<ShoppingBag size={14} /> Manage
											Inventory
										</Button>
									</Link>
									{isDbAdmin && (
										<Button
											variant='danger'
											size='small'
											onClick={() =>
												handleDelete(
													business.businessId
												)
											}
										>
											<Trash2 size={14} /> Delete
										</Button>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{isModalOpen && (
				<BusinessModal
					business={editingBusiness}
					onClose={() => setIsModalOpen(false)}
					onSave={handleSave}
					isDbAdmin={isDbAdmin}
				/>
			)}
		</div>
	);
}
