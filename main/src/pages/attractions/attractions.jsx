import './attractions.css';
import { Link } from '../../components/link';
import { BackgroundDots } from '../home/components/backgroundDots';
import { useState, useEffect } from 'react';
import { api } from '../../utils/client-api-utils';
import { Button } from '../../components/button';

export default function AttractionsPage() {
	const [active, setActive] = useState('All');
	const [attractions, setAttractions] = useState([]);
	const [loading, setLoading] = useState(true);

	const categories = ['All', 'Kids', 'Hands-On', 'Shows', 'Tours'];

	useEffect(() => {
		const loadAttractions = async () => {
			setLoading(true);
			const result = await api('/api/attractions/get-all', 'POST');

			if (result.success && result.data) {
				setAttractions(result.data);
			} else {
				// Fallback to dummy data if API fails
				setAttractions([
					{
						attractionId: '1',
						name: 'Safari Tram Tour',
						uiImage: '/images/attractions/safari-tram.webp',
						uiDescription:
							'Guided ride through open-range habitats with live narration.',
						location: 'Main Zoo',
					},
					{
						attractionId: '2',
						name: 'Reptile Encounter',
						uiImage: '/images/attractions/reptile-encounter.webp',
						uiDescription:
							'Meet snakes and lizards up close with a keeper talk.',
						location: 'Education Center',
					},
					{
						attractionId: '3',
						name: 'Birds in Flight Show',
						uiImage: '/images/attractions/birds-show.webp',
						uiDescription:
							'Raptors and parrots demonstrate natural behaviors on cue.',
						location: 'Show Arena',
					},
					{
						attractionId: '4',
						name: 'Kids Discovery Zone',
						uiImage: '/images/attractions/kids-zone.webp',
						uiDescription:
							'Hands-on exhibits, climbing nets, and splash pads for families.',
						location: 'Kids Zone',
					},
					{
						attractionId: '5',
						name: 'Aquatic Tunnel Walk',
						uiImage: '/images/attractions/aquatic-tunnel.webp',
						uiDescription:
							'Walk beneath sharks and rays in a panoramic tunnel.',
						location: 'Aquarium',
					},
					{
						attractionId: '6',
						name: 'Evening Lantern Trail',
						uiImage: '/images/attractions/lantern-trail.webp',
						uiDescription:
							'Seasonal after-dark path with illuminated animal sculptures.',
						location: 'Main Path',
					},
				]);
			}
			setLoading(false);
		};

		loadAttractions();
	}, []);

	const visible =
		active === 'All'
			? attractions
			: attractions.filter((a) => {
					// Map database attractions to categories based on description/keywords
					const desc = a.uiDescription?.toLowerCase() || '';
					if (
						active === 'Kids' &&
						(desc.includes('kids') || desc.includes('child'))
					)
						return true;
					if (active === 'Hands-On' && desc.includes('hands-on'))
						return true;
					if (active === 'Shows' && desc.includes('show'))
						return true;
					if (active === 'Tours' && desc.includes('tour'))
						return true;
					return false;
				});

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
					From keeper talks to immersive tours—find something for
					everyone.
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
					<div className='filter-row'>
						{categories.map((cat) => (
							<Button
								key={cat}
								className={
									'filter-pill' +
									(active === cat ? ' is-active' : '')
								}
								onClick={() => setActive(cat)}
								type='button'
							>
								{cat}
							</Button>
						))}
					</div>

					{loading ? (
						<div style={{ textAlign: 'center', padding: '2rem' }}>
							Loading attractions...
						</div>
					) : (
						<div className='attractions-grid'>
							{visible.map((a) => {
								// Format hours for display
								// const formatTime = (timeStr) => {
								// 	if (!timeStr) return '';
								// 	// timeStr is in format HH:MM:SS, convert to HH:MM AM/PM
								// 	const [hours, minutes] = timeStr.split(':');
								// 	const h = parseInt(hours);
								// 	const ampm = h >= 12 ? 'PM' : 'AM';
								// 	const displayHour =
								// 		h > 12 ? h - 12 : h === 0 ? 12 : h;
								// 	return `${displayHour}:${minutes} ${ampm}`;
								// };

								// const formatHours = (hours) => {
								// 	if (
								// 		!hours ||
								// 		!Array.isArray(hours) ||
								// 		hours.length === 0
								// 	) {
								// 		return (
								// 			<span className='no-hours'>
								// 				Hours not available
								// 			</span>
								// 		);
								// 	}

								// 	// sort by day order
								// 	const dayOrder = [
								// 		'Monday',
								// 		'Tuesday',
								// 		'Wednesday',
								// 		'Thursday',
								// 		'Friday',
								// 		'Saturday',
								// 		'Sunday',
								// 	];
								// 	const sortedHours = [...hours].sort(
								// 		(a, b) =>
								// 			dayOrder.indexOf(a.dayOfWeek) -
								// 			dayOrder.indexOf(b.dayOfWeek)
								// 	);

								// 	// group consecutive days
								// 	const grouped = [];
								// 	let currentGroup = null;

								// 	for (const hour of sortedHours) {
								// 		if (!currentGroup) {
								// 			currentGroup = {
								// 				start: hour.dayOfWeek,
								// 				end: hour.dayOfWeek,
								// 				open: hour.openTime,
								// 				close: hour.closeTime,
								// 			};
								// 		} else if (
								// 			hour.openTime ===
								// 				currentGroup.open &&
								// 			hour.closeTime ===
								// 				currentGroup.close &&
								// 			dayOrder.indexOf(hour.dayOfWeek) -
								// 				dayOrder.indexOf(
								// 					currentGroup.end
								// 				) ===
								// 				1
								// 		) {
								// 			currentGroup.end = hour.dayOfWeek;
								// 		} else {
								// 			grouped.push(currentGroup);
								// 			currentGroup = {
								// 				start: hour.dayOfWeek,
								// 				end: hour.dayOfWeek,
								// 				open: hour.openTime,
								// 				close: hour.closeTime,
								// 			};
								// 		}
								// 	}
								// 	if (currentGroup)
								// 		grouped.push(currentGroup);

								// 	return (
								// 		<div className='hours-list'>
								// 			{grouped.map((group, idx) => (
								// 				<div
								// 					key={idx}
								// 					className='hours-item'
								// 				>
								// 					{group.start === group.end
								// 						? group.start
								// 						: `${group.start.substring(0, 3)} - ${group.end.substring(0, 3)}`}
								// 					: {formatTime(group.open)} -{' '}
								// 					{formatTime(group.close)}
								// 				</div>
								// 			))}
								// 		</div>
								// 	);
								// };

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
