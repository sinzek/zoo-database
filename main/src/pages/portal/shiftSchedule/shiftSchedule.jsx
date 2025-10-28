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
import { dateIsWithin6Hours } from './utils';

// avoiding utc skew
const toLocalDateKey = (d) => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
};

const fromLocalDateKey = (key) => {
	const [y, m, d] = key.split('-').map(Number);
	return new Date(y, m - 1, d); // local midnight
};

export function ShiftSchedulePage() {
	const { userEntityData, userEntityType } = useUserData();
	const [shiftSchedule, setShiftSchedule] = useState([]);
	const [clockTimes, setClockTimes] = useState([]);
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
			if (!userEntityData?.employeeId) return;

			setIsLoading(true);
			setError(null);
			hasFetchedShifts.current = false;
			try {
				const { shifts, clockTimes } = await fetchShiftSchedule(
					userEntityData.employeeId,
					dateRange
				);

				setShiftSchedule(shifts);
				setClockTimes(clockTimes);
				hasFetchedShifts.current = true;
			} catch (err) {
				console.error('Error fetching shifts:', err);
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

	const calendarData = useMemo(() => {
		const data = {};
		for (
			let d = new Date(dateRange.startDate);
			d <= dateRange.endDate;
			d.setDate(d.getDate() + 1)
		) {
			const dateStr = toLocalDateKey(new Date(d));
			data[dateStr] = { shifts: [], clockTimes: [] };
		}

		shiftSchedule?.forEach((shift) => {
			const shiftDateStr = toLocalDateKey(new Date(shift.start));
			if (data[shiftDateStr]) {
				data[shiftDateStr].shifts.push(shift);
			}
		});

		clockTimes?.forEach((clockTime) => {
			const clockTimeDateStr = toLocalDateKey(
				new Date(clockTime.startTime)
			);
			if (data[clockTimeDateStr]) {
				data[clockTimeDateStr].clockTimes.push(clockTime);
			}
		});

		return data;
	}, [shiftSchedule, clockTimes, dateRange]);

	const totalHoursWorked = useMemo(() => {
		return clockTimes.reduce((acc, ct) => {
			if (ct.startTime && ct.endTime) {
				const start = new Date(ct.startTime);
				const end = new Date(ct.endTime);
				const duration = (end - start) / (1000 * 60 * 60); // duration in hours
				return acc + duration;
			}
			return acc;
		}, 0);
	}, [clockTimes]);

	const totalHours = useMemo(() => {
		return shiftSchedule.reduce((acc, shift) => {
			if (shift.start && shift.end) {
				const start = new Date(shift.start);
				const end = new Date(shift.end);
				const duration = (end - start) / (1000 * 60 * 60); // duration in hours
				return acc + duration;
			}
			return acc;
		}, 0);
	}, [shiftSchedule]);

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

		let hasClockTimes = false;

		hasClockTimes = (clockTimes || []).some((ct) =>
			dateIsWithin6Hours(ct.startTime, shift.start)
		);

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

	useEffect(() => {
		console.log('Isloading:', isLoading);
		console.log('Error:', error);
	}, [isLoading, error]);

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
					{Object.entries(calendarData).map(
						([dateStr, { shifts, clockTimes: dayClockTimes }]) => {
							const displayDate = fromLocalDateKey(dateStr);

							return (
								<div
									key={dateStr}
									className={cn(
										'day-column',
										displayDate < new Date() && 'past-day'
									)}
								>
									<div className='day-header'>
										<span className='day-name'>
											{displayDate.toLocaleDateString(
												'en-US',
												{
													weekday: 'short',
												}
											)}
										</span>

										<span className='day-date'>
											{formatDate(displayDate)}
										</span>
									</div>
									<div className='shifts-list'>
										{shifts.length > 0 && (
											<div className='day-section'>
												<h4 className='day-section-header'>
													Shifts
												</h4>
												{shifts.map((shift) => (
													<div
														key={shift.shiftId}
														className={cn(
															'shift-card',
															new Date(
																shift.end
															) < new Date() &&
																'past-shift'
														)}
													>
														<div className='shift-time'>
															{getShiftStatusIcon(
																shift
															)}
															<span>
																{formatTime(
																	shift.start
																)}{' '}
																-{' '}
																{formatTime(
																	shift.end
																)}
															</span>
														</div>
													</div>
												))}
											</div>
										)}
										{dayClockTimes.length > 0 && (
											<div className='day-section'>
												<h4 className='day-section-header'>
													Clock Times
												</h4>
												{dayClockTimes.map((ct) => (
													<div
														key={ct.clockTimeId}
														className='clock-time-card'
													>
														<div className='shift-time'>
															<Clock
																className='status-icon'
																aria-label='Clock Time'
															/>
															<span>
																{formatTime(
																	ct.startTime
																)}{' '}
																-{' '}
																{formatTime(
																	ct.endTime
																)}
															</span>
														</div>
													</div>
												))}
											</div>
										)}
										{shifts.length === 0 &&
											dayClockTimes.length === 0 && (
												<div className='no-shifts'>
													No activity
												</div>
											)}
									</div>
								</div>
							);
						}
					)}
				</div>
			)}
			{!isLoading && !error && (
				<div className='total-hours-display'>
					Total hrs worked between {formatDate(dateRange.startDate)}{' '}
					and {formatDate(dateRange.endDate)}:{' '}
					<strong>
						{totalHoursWorked.toFixed(2)}
						{' / '}
						{totalHours.toFixed(2)}
					</strong>
				</div>
			)}
		</div>
	);
}
