import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { Button } from '../../../components/button';
import { Loader } from '../../../components/loader/loader';
import {
	fetchAnimals,
	createAnimal,
	updateAnimal,
	fetchHabitats,
	deleteAnimal,
} from './utils';
import {
	Plus,
	Edit2,
	Save,
	X,
	Trash,
	Frown,
	BriefcaseMedical,
	Apple,
	ArrowRight,
} from 'lucide-react';
import './animals.css';
import { getAllDeletedAnimals } from './extra';
import { Link } from '../../../components/link';

export function PortalAnimalsPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [animals, setAnimals] = useState([]);
	const [habitats, setHabitats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [hasFetchedDeleted, setHasFetchedDeleted] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		commonName: '',
		species: '',
		genus: '',
		birthDate: '',
		deathDate: '',
		sex: 'male',
		behavior: '',
		habitatId: '',
		importedFrom: '',
		importDate: '',
		imageUrl: '',
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		const [animalsData, habitatsData] = await Promise.all([
			fetchAnimals(),
			fetchHabitats(),
		]);
		setAnimals(animalsData);
		setHabitats(habitatsData);
		setLoading(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// For now, we'll create animals without diet - this needs to be handled separately
		const animalData = {
			...formData,
			imageUrl: formData.imageUrl || null,
		};

		const result = editingId
			? await updateAnimal(editingId, {
					...animalData,
					animalId: editingId,
				})
			: await createAnimal(animalData);

		if (result.success) {
			setShowAddForm(false);
			setEditingId(null);
			resetForm();
			loadData();
		}
	};

	const handleDelete = async (animalId) => {
		const ok = confirm(
			'Are you sure you want to delete this animal? This action cannot be undone.'
		);

		if (!ok) return;

		await deleteAnimal(animalId);

		loadData();
	};

	const resetForm = () => {
		setFormData({
			firstName: '',
			lastName: '',
			commonName: '',
			species: '',
			genus: '',
			birthDate: '',
			deathDate: '',
			sex: 'male',
			behavior: '',
			habitatId: '',
			importedFrom: '',
			importDate: '',
			imageUrl: '',
		});
	};

	const handleEdit = (animal) => {
		setEditingId(animal.animalId);

		// Helper function to format date for HTML input
		const formatDateForInput = (dateString) => {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toISOString().split('T')[0];
		};

		setFormData({
			firstName: animal.firstName || '',
			lastName: animal.lastName || '',
			commonName: animal.commonName || '',
			species: animal.species || '',
			genus: animal.genus || '',
			birthDate: formatDateForInput(animal.birthDate) || '',
			deathDate: formatDateForInput(animal.deathDate) || '',
			sex: animal.sex || 'male',
			behavior: animal.behavior || '',
			habitatId: animal.habitatId || '',
			importedFrom: animal.importedFrom || '',
			importDate: formatDateForInput(animal.importDate) || '',
			imageUrl: animal.imageUrl || '',
		});
		setShowAddForm(true);

		setTimeout(() => {
			const formElement = document.querySelector(
				'.animal-form-container'
			);
			if (formElement) {
				formElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}
		}, 0);
	};

	const handleCancel = () => {
		setShowAddForm(false);
		setEditingId(null);
		resetForm();
	};

	if (loading) {
		return (
			<div className='portal-animals-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	if (!userEntityData || userEntityType !== 'employee') {
		return (
			<div className='portal-animals-page'>
				<p className='error-message'>
					This page is only available for employees.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-animals-page'>
			<div className='form-container'>
				<div className='animals-header'>
					<h1>Animal Management</h1>
					<Button
						onClick={() => {
							setShowAddForm(!showAddForm);
							if (showAddForm) {
								handleCancel();
							}
						}}
						className='btn-green'
					>
						{showAddForm ? (
							<>
								<X size={18} />
								Cancel
							</>
						) : (
							<>
								<Plus size={18} />
								Add Animal
							</>
						)}
					</Button>
				</div>

				{showAddForm && (
					<div className='animal-form-container'>
						<form
							onSubmit={handleSubmit}
							className='animal-form'
						>
							<h2>
								{editingId ? 'Edit Animal' : 'Add New Animal'}
							</h2>

							<div className='form-grid'>
								<div className='form-group'>
									<label>First Name *</label>
									<input
										type='text'
										value={formData.firstName}
										onChange={(e) =>
											setFormData({
												...formData,
												firstName: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label>Last Name</label>
									<input
										type='text'
										value={formData.lastName}
										onChange={(e) =>
											setFormData({
												...formData,
												lastName: e.target.value,
											})
										}
									/>
								</div>

								<div className='form-group'>
									<label>Common Name *</label>
									<input
										type='text'
										value={formData.commonName}
										onChange={(e) =>
											setFormData({
												...formData,
												commonName: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label>Species *</label>
									<input
										type='text'
										value={formData.species}
										onChange={(e) =>
											setFormData({
												...formData,
												species: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label>Genus *</label>
									<input
										type='text'
										value={formData.genus}
										onChange={(e) =>
											setFormData({
												...formData,
												genus: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label>Birth Date *</label>
									<input
										type='date'
										value={formData.birthDate}
										onChange={(e) =>
											setFormData({
												...formData,
												birthDate: e.target.value,
											})
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label>Death Date</label>
									<input
										type='date'
										value={formData.deathDate}
										onChange={(e) =>
											setFormData({
												...formData,
												deathDate: e.target.value,
											})
										}
									/>
								</div>

								<div className='form-group'>
									<label>Sex *</label>
									<select
										value={formData.sex}
										onChange={(e) =>
											setFormData({
												...formData,
												sex: e.target.value,
											})
										}
										required
									>
										<option value='male'>Male</option>
										<option value='female'>Female</option>
									</select>
								</div>

								<div className='form-group'>
									<label>Habitat *</label>
									<select
										value={formData.habitatId}
										onChange={(e) =>
											setFormData({
												...formData,
												habitatId: e.target.value,
											})
										}
										required
									>
										<option value=''>Select Habitat</option>
										{habitats.map((habitat) => (
											<option
												key={habitat.habitatId}
												value={habitat.habitatId}
											>
												{habitat.name}
											</option>
										))}
									</select>
								</div>

								<div className='form-group full-width'>
									<label>Behavior</label>
									<textarea
										value={formData.behavior}
										onChange={(e) =>
											setFormData({
												...formData,
												behavior: e.target.value,
											})
										}
										rows={3}
									/>
								</div>

								<div className='form-group'>
									<label>Imported From</label>
									<input
										type='text'
										value={formData.importedFrom}
										onChange={(e) =>
											setFormData({
												...formData,
												importedFrom: e.target.value,
											})
										}
									/>
								</div>

								<div className='form-group'>
									<label>Import Date</label>
									<input
										type='date'
										value={formData.importDate}
										onChange={(e) =>
											setFormData({
												...formData,
												importDate: e.target.value,
											})
										}
									/>
								</div>

								<div className='form-group full-width'>
									<label>Image URL</label>
									<input
										type='text'
										value={formData.imageUrl}
										onChange={(e) =>
											setFormData({
												...formData,
												imageUrl: e.target.value,
											})
										}
										placeholder='https://...'
									/>
								</div>
							</div>

							<div className='form-actions'>
								<Button
									type='button'
									onClick={handleCancel}
								>
									Cancel
								</Button>
								<Button
									type='submit'
									className='btn-green'
								>
									<Save size={18} />
									{editingId ? 'Update' : 'Create'} Animal
								</Button>
							</div>
						</form>
					</div>
				)}
			</div>

			<div className='animals-list'>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						justifyContent: 'space-between',
					}}
				>
					<h2
						style={{
							marginLeft: '20px',
							color: 'var(--color-lbrown)',
							fontWeight: '500',
						}}
					>
						All Animals
					</h2>
					<Button
						onClick={async () => {
							if (hasFetchedDeleted) return;
							setHasFetchedDeleted(true);
							await getAllDeletedAnimals(
								animals,
								setAnimals,
								setLoading,
								userEntityData
							);
						}}
						variant='outline'
						size='sm'
						disabled={hasFetchedDeleted}
						loading={loading}
					>
						{hasFetchedDeleted
							? 'Deleted Animals Included'
							: 'Include Deleted Animals'}
					</Button>
				</div>
				{animals.length === 0 ? (
					<p className='no-animals'>No animals found.</p>
				) : (
					<div className='animals-grid'>
						{animals.map((animal) => (
							<div
								key={animal.animalId}
								className='animal-card'
								style={{
									opacity: animal.deletedAt ? 0.5 : 1,
									pointerEvents: animal.deletedAt
										? 'none'
										: 'auto',
								}}
							>
								<div className='animal-header'>
									<h3>
										{animal.firstName} {animal.lastName}{' '}
										{animal.deletedAt ? '(Deleted)' : ''}
									</h3>
									<div className='animal-actions'>
										{animal.deathDate && (
											<span className='status-badge dead'>
												<Frown size={16} />
												DECEASED
											</span>
										)}

										<Button
											onClick={() => handleEdit(animal)}
											className='btn-icon'
											variant='green'
										>
											<Edit2 size={16} />
										</Button>
										{!animal.deletedAt && (
											<Button
												onClick={() =>
													handleDelete(
														animal.animalId
													)
												}
												className='btn-icon'
												variant='outline'
											>
												<Trash size={16} />
											</Button>
										)}
									</div>
								</div>
								{animal.imageUrl && (
									<img
										src={animal.imageUrl}
										alt={animal.firstName}
										className='animal-image'
									/>
								)}
								<div className='animal-info'>
									<p>
										<strong>Common Name:</strong>{' '}
										{animal.commonName}
									</p>
									<p>
										<strong>Species:</strong>{' '}
										{animal.species}
									</p>
									<p>
										<strong>Genus:</strong> {animal.genus}
									</p>
									<p>
										<strong>Sex:</strong> {animal.sex}
									</p>
									<p>
										<strong>Habitat:</strong>{' '}
										{animal.habitatName || 'Unknown'}
									</p>
									{animal.birthDate && (
										<p>
											<strong>Birth Date:</strong>{' '}
											{new Date(
												animal.birthDate
											).toLocaleDateString()}
										</p>
									)}
									{animal.deathDate && (
										<p className='death-date-info'>
											<strong>Death Date:</strong>{' '}
											{new Date(
												animal.deathDate
											).toLocaleDateString()}
										</p>
									)}
									{animal.behavior && (
										<p>
											<strong>Behavior:</strong>{' '}
											{animal.behavior}
										</p>
									)}
								</div>
								<div
									style={{
										marginTop: '2rem',
										display: 'flex',
										gap: '0.5rem',
										justifyContent: 'end',
									}}
								>
									<Link
										to={`/portal/medical-records/${animal.animalId}`}
										href={`/portal/medical-records/${animal.animalId}`}
									>
										<Button
											size='sm'
											variant='lgreen'
										>
											<BriefcaseMedical size={16} />
											Records
											<ArrowRight size={16} />
										</Button>
									</Link>
									<Link
										to={`/portal/feeding-schedules/${animal.animalId}`}
										href={`/portal/feeding-schedules/${animal.animalId}`}
									>
										<Button
											variant='lgreen'
											size='sm'
										>
											<Apple size={16} />
											Diet
											<ArrowRight size={16} />
										</Button>
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
