import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { useRouter } from '../../../context/routerContext';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import { HeartPulse, ChevronRight } from 'lucide-react';
import './medicalRecords.css';

export function MedicalRecordsPage() {
	const { userEntityData, userEntityType } = useUserData();
	const { navigate } = useRouter();
	const [animals, setAnimals] = useState([]);
	const [myAnimals, setMyAnimals] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, [userEntityData]);

	const loadData = async () => {
		setLoading(true);
		
		// Get all animals
		const allAnimalsResult = await api(
			'/api/animal/get-all-grouped-by-habitat',
			'POST'
		);

		if (!allAnimalsResult.success) {
			showToast('Failed to load animals');
			setLoading(false);
			return;
		}

		// Flatten the grouped data
		const allAnimals = [];
		for (const habitatGroup of allAnimalsResult.data || []) {
			if (habitatGroup.animals) {
				for (const animal of habitatGroup.animals) {
					allAnimals.push({
						...animal,
						habitatName: habitatGroup.habitatName,
					});
				}
			}
		}

		// Get animals the current employee takes care of
		if (userEntityType === 'employee' && userEntityData?.employeeId) {
			const myAnimalsResult = await api('/api/animal/get-n-by-handler', 'POST', {
				employeeId: userEntityData.employeeId,
			});

			if (myAnimalsResult.success) {
				const myAnimalIds = new Set(
					myAnimalsResult.data.map((animal) => animal.animalId)
				);

				const myAnimalsList = allAnimals.filter((animal) =>
					myAnimalIds.has(animal.animalId)
				);
				const otherAnimals = allAnimals.filter(
					(animal) => !myAnimalIds.has(animal.animalId)
				);

				setMyAnimals(myAnimalsList);
				setAnimals(otherAnimals);
			} else {
				setAnimals(allAnimals);
				setMyAnimals([]);
			}
		} else {
			setAnimals(allAnimals);
			setMyAnimals([]);
		}

		setLoading(false);
	};

	const handleAnimalClick = (animalId) => {
		navigate(`/portal/medical-records/${animalId}`);
	};

	if (loading) {
		return (
			<div className='portal-medical-records-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	if (!userEntityData || userEntityType !== 'employee') {
		return (
			<div className='portal-medical-records-page'>
				<p className='error-message'>
					This page is only available for employees.
				</p>
			</div>
		);
	}

	const displayAnimals = [...myAnimals, ...animals];

	return (
		<div className='portal-medical-records-page'>
			<div className='medical-records-header'>
				<h1>Medical Records</h1>
			</div>

			{myAnimals.length > 0 && (
				<div className='animal-section'>
					<h2 className='section-header'>
						<HeartPulse size={20} />
						Animals Under Your Care
					</h2>
					<div className='animals-grid'>
						{myAnimals.map((animal) => (
							<div
								key={animal.animalId}
								className='animal-card clickable'
								onClick={() => handleAnimalClick(animal.animalId)}
							>
								{animal.imageUrl && (
									<img
										src={animal.imageUrl}
										alt={animal.firstName}
										className='animal-image'
									/>
								)}
								<div className='animal-content'>
									<h3>{animal.firstName} {animal.lastName}</h3>
									<p className='common-name'>{animal.commonName}</p>
									<p className='habitat'>{animal.habitatName}</p>
								</div>
								<ChevronRight className='chevron-icon' />
							</div>
						))}
					</div>
				</div>
			)}

			<div className='animal-section'>
				<h2 className='section-header'>
					All Animals
				</h2>
				{displayAnimals.length === 0 ? (
					<p className='no-animals'>No animals found.</p>
				) : (
					<div className='animals-grid'>
						{displayAnimals.map((animal) => (
							<div
								key={animal.animalId}
								className='animal-card clickable'
								onClick={() => handleAnimalClick(animal.animalId)}
							>
								{animal.imageUrl && (
									<img
										src={animal.imageUrl}
										alt={animal.firstName}
										className='animal-image'
									/>
								)}
								<div className='animal-content'>
									<h3>
										{animal.firstName} {animal.lastName}
									</h3>
									<p className='common-name'>{animal.commonName}</p>
									<p className='habitat'>{animal.habitatName}</p>
								</div>
								<ChevronRight className='chevron-icon' />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

