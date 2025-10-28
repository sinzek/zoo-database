import '../habitats/habitats.css';
import { useEffect, useState } from 'react';
import { Link } from '../../components/link';
import { BackgroundDots } from '../home/components/backgroundDots';
import PropTypes from 'prop-types';
import { api } from '../../utils/client-api-utils';
import { showToast } from '../../components/toast/showToast';
import { Skeleton } from '../../components/skeleton/skeleton';

export default function HabitatDetailsPage({ id }) {
	const [loading, setLoading] = useState(true);
	const [habitat, setHabitat] = useState(null);
	const [associatedAnimals, setAssociatedAnimals] = useState([]);

	console.log('Rendering HabitatDetailsPage with id:', id);

	useEffect(() => {
		if (!id) {
			console.error('No habitat ID provided');
			setLoading(false);
			return;
		}

		async function fetchHabitat() {
			const result = await api(`/api/habitats/get-one`, 'POST', {
				habitatId: id,
			});

			if (!result.success) {
				console.error('Failed to fetch habitat:', result.error);
				showToast(
					`ERROR: ${result.error || 'Failed to load habitat data'}`
				);
				setLoading(false);
				return;
			}

			console.log('Fetched habitat data:', result.data);

			setHabitat(result.data.habitat);
			setAssociatedAnimals(result.data.associatedAnimals);
		}

		fetchHabitat().finally(() => setLoading(false));
	}, [id]);

	if (loading) {
		return (
			<div className='page habitats-page'>
				<div className='hero-container habitat-hero'>
					<Skeleton className='hero-image' />
					<div className='accent-bar' />
					<h4 className='hero-pre-text'>Just one sec</h4>
					<h1 className='hero-main-text'>
						Loading habitat details...
					</h1>
					<p className='hero-sub-text'>Will anyone even read this?</p>
				</div>
			</div>
		);
	}

	if (!habitat) {
		return (
			<div className='page habitats-page hero-container'>
				<h2>Habitat not found</h2>
				<p>The habitat you’re looking for doesn’t exist.</p>
				<Link
					to='/habitats'
					href='/habitats'
					className='btn btn-outline btn-lg'
				>
					← Back to Habitats
				</Link>
			</div>
		);
	}

	return (
		<div className='page habitats-page'>
			<div className='hero-container habitat-hero'>
				<img
					className='hero-image'
					src={habitat.imageUrl}
					alt={habitat.name}
				/>
				<div className='accent-bar' />
				<h4 className='hero-pre-text'>Habitat</h4>
				<h1 className='hero-main-text'>{habitat.name}</h1>
				<p className='hero-sub-text'>{habitat.description}</p>
				<div className='hero-btn-list'>
					<Link
						to='/habitats'
						href='/habitats'
						className='btn btn-outline btn-lg'
					>
						← All Habitats
					</Link>
					<Link
						to='/'
						href='/'
						className='btn btn-green btn-lg'
					>
						Home
					</Link>
				</div>
			</div>

			<div className='details-bottom-wrap'>
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

				<div className='details-wrap'>
					<div className='details-grid'>
						<div className='details-card'>
							<div className='icon-row'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M8 2v4' />
									<path d='M12 2v4' />
									<path d='M16 2v4' />
									<rect
										width='16'
										height='18'
										x='4'
										y='4'
										rx='2'
									/>
									<path d='M8 10h6' />
									<path d='M8 14h8' />
									<path d='M8 18h5' />
								</svg>
								<h2>Details</h2>
							</div>
							<p>{habitat.extraDetails}</p>
						</div>

						<div className='details-card'>
							<div className='icon-row'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M12 2v2' />
									<path d='m4.93 4.93 1.41 1.41' />
									<path d='M20 12h2' />
									<path d='m19.07 4.93-1.41 1.41' />
									<path d='M15.947 12.65a4 4 0 0 0-5.925-4.128' />
									<path d='M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z' />
								</svg>
								<h2>Climate</h2>
							</div>
							<p>{habitat.climate}</p>
						</div>

						<div className='details-card'>
							<div className='icon-row'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<circle
										cx='11'
										cy='4'
										r='2'
									/>
									<circle
										cx='18'
										cy='8'
										r='2'
									/>
									<circle
										cx='20'
										cy='16'
										r='2'
									/>
									<path d='M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z' />
								</svg>
								<h2>Featured Animals</h2>
							</div>
							{associatedAnimals.length === 0 ? (
								<p>No animals found in this habitat.</p>
							) : (
								<p>
									{associatedAnimals
										.map((a) => a.commonName)
										.join(', ')}
								</p>
							)}
						</div>

						<div className='details-card'>
							<div className='icon-row'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z' />
									<path d='M14 3v4a2 2 0 0 0 2 2h4' />
									<path d='M8 13h.01' />
									<path d='M16 13h.01' />
									<path d='M10 16s.8 1 2 1c1.3 0 2-1 2-1' />
								</svg>
								<h2>Fun Fact</h2>
							</div>
							<p>{habitat.funFact}</p>
						</div>
					</div>

					<div className='details-footer'>
						<Link
							to='/habitats'
							href='/habitats'
							className='btn btn-outline btn-lg'
						>
							← Back to Habitats
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

HabitatDetailsPage.propTypes = {
	id: PropTypes.string.isRequired,
};
