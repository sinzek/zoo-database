import './animals.css';
import { Link } from '../../components/link';
import { BackgroundDots } from '../home/components/backgroundDots';
import { useEffect, useState } from 'react';
import { api } from '../../utils/client-api-utils';
import { Skeleton } from '../../components/skeleton/skeleton';

export default function AnimalsPage() {
	const [loading, setLoading] = useState(true);
	const [animalsByHabitat, setAnimalsByHabitat] = useState([]);

	useEffect(() => {
		async function fetchAnimals() {
			const result = await api(
				'/api/animal/get-all-grouped-by-habitat',
				'POST'
			);

			if (!result.success) {
				console.error('Failed to fetch animals:', result.error);
				setLoading(false);
				return;
			}

			console.log('Fetched animals data:', result.data);

			setAnimalsByHabitat(result.data);
			setLoading(false);
		}

		fetchAnimals();
	}, []);

	return (
		<div className='page animals-page'>
			<div className='hero-container animal-hero'>
				<img
					className='hero-image'
					src='/images/habitats/forest.webp'
					alt='animals Hero'
				/>
				<div className='accent-bar' />
				<h4 className='hero-pre-text'>Meet our friends</h4>
				<h1 className='hero-main-text'>Animals</h1>
				<p className='hero-sub-text'>
					From the tiniest insects to the largest mammals, explore the
					diverse creatures that call our zoo home.
				</p>
				<div className='hero-btn-list'>
					<Link
						to='/habitats'
						className='btn btn-green btn-lg'
						href='/habitats'
					>
						Habitats
					</Link>
					<Link
						to='/'
						className='btn btn-outline btn-lg'
						href='/'
					>
						← Home
					</Link>
				</div>
			</div>

			<div className='bottom-wrap'>
				<div
					className='bottom-dots left-dots'
					aria-hidden='true'
				>
					<BackgroundDots />
				</div>
				<div
					className='bottom-dots right-dots'
					aria-hidden='true'
				>
					<BackgroundDots />
				</div>

				<div className='section'>
					<div className='habitat-rows'>
						{loading ? (
							<Skeleton className='habitat-row-skeleton' />
						) : (
							animalsByHabitat.map(
								({ habitatId, habitatName, animals }) => (
									<div
										key={habitatId}
										className='habitat-row'
									>
										<h2 className='habitat-name'>
											{habitatName}
										</h2>
										<div className='animal-grid'>
											{animals.map((animal) => (
												<div
													key={animal.animalId}
													className='animal-card'
												>
													<img
														src={animal.imageUrl}
														alt={animal.commonName}
														className='animal-img'
													/>
													<div>
														<h3 className='animal-name'>
															{animal.firstName}{' '}
															the{' '}
															{animal.commonName}
														</h3>
														<p className='animal-behavior'>
															{animal.behavior}
														</p>
													</div>
													<p className='animal-scientific-name'>
														<i>{animal.species}</i>
													</p>
												</div>
											))}
										</div>
									</div>
								)
							)
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
