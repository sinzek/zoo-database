import { useEffect, useState } from 'react';
import { api } from '../../utils/client-api-utils';
import { Loader } from '../../components/loader/loader';

// eslint-disable-next-line react/prop-types
export default function AttractionDetailPage({ id }) {
	const [loading, setLoading] = useState(true);
	const [attraction, setAttraction] = useState(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			const result = await api('/api/attractions/get-all', 'POST');
			if (result.success && Array.isArray(result.data)) {
				const found = result.data.find((a) => a.attractionId === id);
				setAttraction(found || null);
			} else {
				setAttraction(null);
			}
			setLoading(false);
		};
		load();
	}, [id]);

	const formatTime = (timeStr) => {
		if (!timeStr) return '';
		const [hours, minutes] = timeStr.split(':');
		const h = parseInt(hours);
		const ampm = h >= 12 ? 'PM' : 'AM';
		const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const renderHours = (hours) => {
		if (!hours || !Array.isArray(hours) || hours.length === 0) {
			return (
				<div style={{ color: '#888', fontStyle: 'italic' }}>
					Hours not available
				</div>
			);
		}
		const dayOrder = [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday',
		];
		const sorted = [...hours].sort(
			(a, b) =>
				dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
		);

		const groups = [];
		let current = null;
		for (const h of sorted) {
			if (!current) {
				current = {
					start: h.dayOfWeek,
					end: h.dayOfWeek,
					open: h.openTime,
					close: h.closeTime,
				};
			} else if (
				h.openTime === current.open &&
				h.closeTime === current.close &&
				dayOrder.indexOf(h.dayOfWeek) -
					dayOrder.indexOf(current.end) ===
					1
			) {
				current.end = h.dayOfWeek;
			} else {
				groups.push(current);
				current = {
					start: h.dayOfWeek,
					end: h.dayOfWeek,
					open: h.openTime,
					close: h.closeTime,
				};
			}
		}
		if (current) groups.push(current);

		return (
			<div style={{ display: 'grid', gap: '0.35rem' }}>
				{groups.map((g, idx) => (
					<div
						key={idx}
						style={{ color: '#c0d4b3' }}
					>
						{g.start === g.end
							? g.start
							: `${g.start.substring(0, 3)} - ${g.end.substring(0, 3)}`}
						: {formatTime(g.open)} - {formatTime(g.close)}
					</div>
				))}
			</div>
		);
	};

	if (loading) {
		return (
			<div className='page attractions-page'>
				<div className='centered-loader'>
					<Loader />
				</div>
			</div>
		);
	}

	if (!attraction) {
		return (
			<div className='page attractions-page'>
				<div style={{ padding: '2rem' }}>Attraction not found.</div>
			</div>
		);
	}

	return (
		<div className='page attractions-page'>
			<div className='section'>
				<div className='attraction-card two-col'>
					<div className='media-wrap'>
						<img
							src={
								attraction.uiImage ||
								'/images/attractions/attractions-hero.webp'
							}
							alt={attraction.name}
							className='attraction-img'
						/>
					</div>
					<div className='content-wrap'>
						<div className='eyebrow'>{attraction.location}</div>
						<h2>{attraction.name}</h2>
						{attraction.uiDescription && (
							<p>{attraction.uiDescription}</p>
						)}
						<div
							style={{
								marginTop: '0.75rem',
								padding: '0.75rem',
								backgroundColor: 'rgba(0,0,0,0.2)',
								borderRadius: 6,
							}}
						>
							<strong
								style={{
									color: '#9be15d',
									display: 'block',
									marginBottom: '0.5rem',
								}}
							>
								Operating Hours
							</strong>
							{renderHours(attraction.hours)}
						</div>
						{(attraction.startDate || attraction.endDate) && (
							<div
								style={{
									marginTop: '0.75rem',
									fontSize: '0.9rem',
									color: '#dcd5be',
								}}
							>
								{attraction.startDate && (
									<div>
										<strong>Starts:</strong>{' '}
										{new Date(
											attraction.startDate
										).toLocaleDateString()}
									</div>
								)}
								{attraction.endDate && (
									<div>
										<strong>Ends:</strong>{' '}
										{new Date(
											attraction.endDate
										).toLocaleDateString()}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
