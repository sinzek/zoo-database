import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import './portalHabitats.css';
import { Button } from '../../../components/button';

export function PortalHabitatsPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [habitats, setHabitats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [isManagerPlus, setIsManagerPlus] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		imageUrl: '',
		extraDetails: '',
		climate: '',
		funFact: '',
	});

	useEffect(() => {
		// Check if user is manager or above
		if (userEntityData?.accessLevel) {
			const managerLevels = ['manager', 'db_admin'];
			setIsManagerPlus(
				managerLevels.includes(userEntityData.accessLevel)
			);
		}

		loadData();
	}, [userEntityData]);

	const loadData = async () => {
		setLoading(true);
		const habitatsResult = await api('/api/habitats/get-all', 'POST');

		if (habitatsResult.success) {
			setHabitats(habitatsResult.data);
		} else {
			showToast('Failed to load habitats');
		}

		setLoading(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const result = editingId
			? await api('/api/habitat/update', 'PUT', {
					...formData,
					habitatId: editingId,
				})
			: await api('/api/habitat/create', 'POST', formData);

		if (result.success) {
			showToast(
				`Habitat ${editingId ? 'updated' : 'created'} successfully!`
			);
			setShowAddForm(false);
			setEditingId(null);
			resetForm();
			loadData();
		} else {
			showToast(`Failed to ${editingId ? 'update' : 'create'} habitat`);
		}
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			imageUrl: '',
			extraDetails: '',
			climate: '',
			funFact: '',
		});
	};

	const handleEdit = (habitat) => {
		setEditingId(habitat.habitatId);
		setFormData({
			name: habitat.name || '',
			description: habitat.description || '',
			imageUrl: habitat.imageUrl || '',
			extraDetails: habitat.extraDetails || '',
			climate: habitat.climate || '',
			funFact: habitat.funFact || '',
		});
		setShowAddForm(true);
		// Scroll to form
		setTimeout(() => {
			const formElement = document.querySelector(
				'.habitat-form-container'
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

	const handleDelete = async (habitat) => {
		if (
			!confirm(
				`Are you sure you want to archive "${habitat.name}"?\n\nThis habitat will be archived. Animals in this habitat will remain but will be marked as being in an archived habitat. You can reassign them to active habitats from the Animals page.`
			)
		) {
			return;
		}

		try {
			const result = await api('/api/habitat/delete', 'POST', {
				habitatId: habitat.habitatId,
			});

			if (result.success) {
				showToast(
					result.data.message || 'Habitat archived successfully',
					'success'
				);
				loadData();
			} else {
				showToast(result.error || 'Failed to archive habitat');
			}
		} catch (error) {
			showToast(error.message || 'Failed to archive habitat.');
		}
	};

	if (loading) {
		return (
			<div className='portal-habitats-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	if (!userEntityData || userEntityType !== 'employee') {
		return (
			<div className='portal-habitats-page'>
				<p className='error-message'>
					This page is only available for employees.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-habitats-page'>
			<div className='habitats-header'>
				<h1>Manage Habitats</h1>
				{isManagerPlus && (
					<Button
						onClick={() => {
							setShowAddForm(!showAddForm);
							if (showAddForm) {
								handleCancel();
							}
						}}
						className='add-button'
					>
						<Plus size={20} />
						{showAddForm ? 'Cancel' : 'Add Habitat'}
					</Button>
				)}
			</div>

			{showAddForm && (
				<div className='habitat-form-container'>
					<form
						onSubmit={handleSubmit}
						className='habitat-form'
					>
						<h2>
							{editingId ? 'Edit Habitat' : 'Add New Habitat'}
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
								minLength={4}
							/>
							<p className='form-hint'>Minimum 4 characters</p>
						</div>

						<div className='form-group'>
							<label>Description *</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								required
								rows={5}
							/>
						</div>

						<div className='form-group'>
							<label>Image URL</label>
							<input
								type='url'
								value={formData.imageUrl}
								onChange={(e) =>
									setFormData({
										...formData,
										imageUrl: e.target.value,
									})
								}
								placeholder='https://example.com/image.jpg'
							/>
						</div>

						<div className='form-group'>
							<label>Climate</label>
							<textarea
								value={formData.climate}
								onChange={(e) =>
									setFormData({
										...formData,
										climate: e.target.value,
									})
								}
								rows={3}
								placeholder='Temperature, humidity, weather patterns...'
							/>
						</div>

						<div className='form-group'>
							<label>Extra Details</label>
							<textarea
								value={formData.extraDetails}
								onChange={(e) =>
									setFormData({
										...formData,
										extraDetails: e.target.value,
									})
								}
								rows={3}
								placeholder='Additional habitat information...'
							/>
						</div>

						<div className='form-group'>
							<label>Fun Fact</label>
							<textarea
								value={formData.funFact}
								onChange={(e) =>
									setFormData({
										...formData,
										funFact: e.target.value,
									})
								}
								rows={2}
								placeholder='Interesting fact about this habitat...'
							/>
						</div>

						<div className='form-actions'>
							<Button
								type='submit'
								variant='green'
							>
								<Save size={16} />
								{editingId ? 'Update' : 'Create'} Habitat
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

			<div className='habitats-list'>
				<h2>All Habitats</h2>
				{habitats.length === 0 ? (
					<p className='no-habitats'>No habitats found.</p>
				) : (
					<div className='habitats-grid'>
						{habitats.map((habitat) => (
							<div
								key={habitat.habitatId}
								className='habitat-card'
								style={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
								}}
							>
								<div className='habitat-header'>
									<h3>{habitat.name}</h3>
								</div>
								<div className='habitat-info'>
									<p>{habitat.description}</p>
								</div>
								{isManagerPlus && (
									<div
										className='habitat-actions'
										style={{ marginTop: '2rem' }}
									>
										<Button
											onClick={() => handleEdit(habitat)}
											variant='green'
										>
											<Edit2 size={16} />
											Edit
										</Button>
										<Button
											onClick={() =>
												handleDelete(habitat)
											}
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
