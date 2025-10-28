import { fetchShiftSchedule } from './utils';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useUserData } from '../../../context/userDataContext';
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	XCircle,
	Clock,
} from 'lucide-react';
import { Button } from '../../../components/button';
import './shiftSchedule.css';
import { cn } from '../../../utils/cn';
import { Loader } from '../../../components/loader/loader';

export function ShiftSchedulePage() {
	const { userEntityData, userEntityType } = useUserData();
	const [shiftSchedule, setShiftSchedule] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const hasFetchedShifts = useRef(false);

	// Initialize a 14-day range starting from the beginning of the current week
	const getInitialDateRange = () => {
		const start = new Date();
		start.setDate(start.getDate() - start.getDay()); // Start of the current week (Sunday)
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setDate(end.getDate() + 13); // 13 days after start (total 14 days)
		end.setHours(23, 59, 59, 999);

		return { startDate: start, endDate: end };
	};

	const [dateRange, setDateRange] = useState(getInitialDateRange());

	useEffect(() => {
		const loadShiftSchedule = async () => {
			if (!userEntityData?.employeeId || hasFetchedShifts.current) return;

			setIsLoading(true);
			setError(null);
			try {
				const shifts = await fetchShiftSchedule(
					userEntityData.employeeId,
					dateRange
				);
				console.log('Loaded shifts:', shifts);

				setShiftSchedule(shifts);
				hasFetchedShifts.current = true;
			} catch (err) {
				setError(
					err.message ||
						'An unexpected error occurred while fetching shifts.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadShiftSchedule();
	}, [userEntityData, dateRange]);

	const handleDateChange = (weeksToAdd) => {
		setDateRange((prevRange) => {
			const newStart = new Date(prevRange.startDate);
			newStart.setDate(newStart.getDate() + weeksToAdd * 7);

			const newEnd = new Date(newStart);
			newEnd.setDate(newEnd.getDate() + 13);
			newEnd.setHours(23, 59, 59, 999);

			return { startDate: newStart, endDate: newEnd };
		});
	};

	const groupedShifts = useMemo(() => {
		const groups = {};
		for (
			let d = new Date(dateRange.startDate);
			d <= dateRange.endDate;
			d.setDate(d.getDate() + 1)
		) {
			const dateStr = d.toISOString().split('T')[0];
			groups[dateStr] = [];
		}

		shiftSchedule.forEach((shift) => {
			const shiftDateStr = new Date(shift.start)
				.toISOString()
				.split('T')[0];
			if (groups[shiftDateStr]) {
				groups[shiftDateStr].push(shift);
			}
		});

		return groups;
	}, [shiftSchedule, dateRange]);

	const formatDate = (date) => {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	const formatTime = (dateString) => {
		return new Date(dateString).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		});
	};

	const getShiftStatusIcon = (shift) => {
		const now = new Date();
		const shiftEnd = new Date(shift.end);
		const hasClockTimes = shift.clockTimes && shift.clockTimes.length > 0;

		if (shiftEnd < now) {
			if (hasClockTimes) {
				return (
					<CheckCircle2
						className='status-icon completed'
						aria-label='Completed'
					/>
				);
			} else {
				return (
					<XCircle
						className='status-icon missed'
						aria-label='Missed'
					/>
				);
			}
		}
		return (
			<Clock
				className='status-icon upcoming'
				aria-label='Upcoming'
			/>
		);
	};

	if (!userEntityData || userEntityType !== 'employee') {
		return (
			<div className='centered-page'>
				<p>This page is only available for employees.</p>
			</div>
		);
	}

	return (
		<div className='page shift-schedule-page'>
			<header className='schedule-header'>
				<div className='loader-row'>
					{isLoading && (
						<Loader
							style={{
								width: '36px',
								height: '36px',
								color: 'var(--color-green)',
							}}
						/>
					)}
					<h1>My Shift Schedule</h1>
				</div>
				<div className='schedule-nav'>
					<Button
						variant='green'
						size='sm'
						onClick={() => handleDateChange(-1)}
					>
						<ArrowLeft size={16} /> Previous Week
					</Button>
					<span className='date-range-display'>
						{formatDate(dateRange.startDate)} -{' '}
						{formatDate(dateRange.endDate)}
					</span>
					<Button
						variant='green'
						size='sm'
						onClick={() => handleDateChange(1)}
					>
						Next Week <ArrowRight size={16} />
					</Button>
				</div>
			</header>

			{error && (
				<div className='centered-page error-message'>{error}</div>
			)}
			{isLoading && !error && (
				<div className='schedule-grid'>
					{Array(14)
						.fill(0)
						.map((_, index) => (
							<div
								key={`loading-${index}`}
								className='day-column'
							>
								<div className='day-header'>
									<span className='day-name'>&nbsp;</span>
									<span className='day-date'>&nbsp;</span>
								</div>
								<div className='shifts-list'>
									<div className='shift-card'>
										<div className='shift-time'>
											<Loader
												style={{
													width: '16px',
													height: '16px',
													color: 'var(--color-green)',
												}}
											/>
											<span>Loading...</span>
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
			)}
			{!isLoading && !error && (
				<div className='schedule-grid'>
					{Object.entries(groupedShifts).map(([dateStr, shifts]) => (
						<div
							key={dateStr}
							className={cn(
								'day-column',
								new Date(dateStr) < new Date() && 'past-day'
							)}
						>
							<div className='day-header'>
								<span className='day-name'>
									{new Date(dateStr).toLocaleDateString(
										'en-US',
										{
											weekday: 'short',
										}
									)}
								</span>

								<span className='day-date'>
									{formatDate(new Date(dateStr))}
								</span>
							</div>
							<div className='shifts-list'>
								{shifts.length > 0 ? (
									shifts.map((shift) => (
										<div
											key={shift.shiftId}
											className={cn(
												'shift-card',
												shift.end < new Date() &&
													'past-shift'
											)}
										>
											<div className='shift-time'>
												{getShiftStatusIcon(shift)}
												<span>
													{formatTime(shift.start)} -{' '}
													{formatTime(shift.end)}
												</span>
											</div>
											{shift.clockTimes &&
												shift.clockTimes.length > 0 && (
													<div className='clock-times'>
														{shift.clockTimes.map(
															(ct) => (
																<div
																	key={
																		ct.clockTimeId
																	}
																>
																	<strong>
																		{ct.type ===
																		'in'
																			? 'In: '
																			: 'Out: '}
																	</strong>
																	{formatTime(
																		ct.time
																	)}
																</div>
															)
														)}
													</div>
												)}
										</div>
									))
								) : (
									<div className='no-shifts'>No shifts</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
