import './attractions.css';
import { Link } from '../../components/link';
import { BackgroundDots } from '../home/components/backgroundDots';
import { useState, useEffect } from 'react';
import { api } from '../../utils/client-api-utils';
import { showToast } from '../../components/toast/showToast';
import { Loader } from '../../components/loader/loader';

export default function AttractionsPage() {
	const [attractions, setAttractions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAttractions = async () => {
			setLoading(true);
			const result = await api('/api/attractions/get-all', 'POST');

			if (!result.success) {
				showToast(`Error loading attractions: ${result.error}`);
				setLoading(false);
				return;
			}

			setAttractions(result.data);

			setLoading(false);
		};

		loadAttractions();
	}, []);

	return (
		<div className='page attractions-page'>
			<div className='hero-container attractions-hero'>
				<img
					className='hero-image'
					src='/images/attractions/attractions-hero.webp'
					alt='Attractions Hero'
				/>
				<div className='accent-bar' />
				<h4 className='hero-pre-text'>Experiences & shows</h4>
				<h1 className='hero-main-text'>Attractions</h1>
				<p className='hero-sub-text'>
					Thrilling rides, captivating shows, and so much more!
					YIPPEE!!
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
					{loading ? (
						<div
							style={{
								textAlign: 'center',
								padding: '2rem',
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '0.5rem',
								fontSize: '1.5rem',
							}}
						>
							<Loader />
							Loading attractions...
						</div>
					) : (
						<div className='attractions-grid'>
							{attractions.map((a) => {
								return (
									<div
										className='attraction-card two-col'
										key={a.attractionId}
									>
										<div className='media-wrap'>
											<img
												src={
													a.uiImage ||
													'/images/attractions/attractions-hero.webp'
												}
												alt={a.name}
												className='attraction-img'
											/>
										</div>
										<div className='content-wrap'>
											<div className='eyebrow'>
												{a.location}
											</div>
											<h3>{a.name}</h3>
											<p>
												{a.uiDescription ||
													a.description}
											</p>
											<div className='card-actions'>
												<Link
													to={`/attractions/${a.attractionId}`}
													className='text-link'
													href={`/attractions/${a.attractionId}`}
												>
													Learn more →
												</Link>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
