import './habitats.css';
import { Link } from '../../components/link';
import { BackgroundDots } from '../home/components/backgroundDots';
import { useEffect, useState } from 'react';
import { api } from '../../utils/client-api-utils';
import { Skeleton } from '../../components/skeleton/skeleton';

export default function HabitatsPage() {
	const [loading, setLoading] = useState(true);
	const [habitats, setHabitats] = useState([]);

	// Fetch habitats data from API when component mounts
	useEffect(() => {
		async function fetchHabitats() {
			const result = await api('/api/habitats/get-all', 'POST');

			if (!result.success) {
				console.error('Failed to fetch habitats:', result.error);
				setLoading(false);
				return;
			}

			setHabitats(result.data);
			setLoading(false);
		}

		fetchHabitats();
	}, []);

	return (
		<div className='page habitats-page'>
			<div className='hero-container habitat-hero'>
				<img
					className='hero-image'
					src='/images/habitats/habitats-hero.webp'
					alt='Habitats Hero'
				/>
				<div className='accent-bar' />
				<h4 className='hero-pre-text'>Explore our environments</h4>
				<h1 className='hero-main-text'>Habitats</h1>
				<p className='hero-sub-text'>
					From sun-kissed savannas to misty wetlands, discover where
					our animals live and thrive.
				</p>
				<div className='hero-btn-list'>
					<Link
						to='/animals'
						className='btn btn-green btn-lg'
						href='/animals'
					>
						Animals
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
					<div className='habitat-grid'>
						{loading &&
							Array(8)
								.fill(0)
								.map((_, idx) => (
									<Skeleton
										key={`skeleton-${idx}`}
										className='skelly'
									/>
								))}

						{!loading &&
							habitats.map((h) => (
								<div
									className='habitat-card'
									key={h.habitatId}
								>
									<img
										src={
											h.imageUrl ||
											'/public/images/habitats/mountains.webp'
										}
										alt={h.name}
										className='habitat-img'
									/>
									<h3>{h.name}</h3>
									<p>{h.description}</p>
									<div className='card-actions'>
										<Link
											to={`/habitats/${h.habitatId}`}
											href={`/habitats/${h.habitatId}`}
											className='text-link'
										>
											Learn more →
										</Link>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
