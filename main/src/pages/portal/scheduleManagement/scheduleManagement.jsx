/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { hasMinAccessLvl } from '../../../utils/access';
import { Loader } from '../../../components/loader/loader';
import { Button } from '../../../components/button';
import {
	fetchAllShifts,
	fetchAllEmployees,
	createShift,
	assignEmployeeToShift,
	deleteShift,
} from './utils';
import './scheduleManagement.css';
import { Check } from 'lucide-react';

function CreateShiftModal({ onClose, onShiftCreated }) {
	const [start, setStart] = useState();
	const [end, setEnd] = useState();
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!start || !end) {
			setError('Start and end times are required.');
			return;
		}
		if (new Date(start) >= new Date(end)) {
			setError('End time must be after start time.');
			return;
		}

		if (
			new Date(start).getTime() < Date.now() ||
			new Date(end).getTime() < Date.now()
		) {
			setError('Start and times must be in the future.');
			return;
		}

		const result = await createShift({
			start: new Date(start),
			end: new Date(end),
		});

		if (result.success) {
			onShiftCreated();
			onClose();
		} else {
			setError(result.error || 'Failed to create shift.');
		}
	};

	return (
		<div className='modal-backdrop'>
			<div className='modal-content'>
				<h2>Create New Shift</h2>
				<form
					onSubmit={handleSubmit}
					className='create-shift-form'
				>
					<div className='form-group'>
						<label htmlFor='start-time'>Start Time</label>
						<input
							id='start-time'
							type='datetime-local'
							value={start}
							onChange={(e) => setStart(e.target.value)}
							required
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='end-time'>End Time</label>
						<input
							id='end-time'
							type='datetime-local'
							value={end}
							onChange={(e) => setEnd(e.target.value)}
							required
						/>
					</div>
					{error && <p className='error-message'>{error}</p>}
					<div className='modal-actions'>
						<Button
							type='button'
							onClick={onClose}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							variant='green'
						>
							Create
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

function ShiftCard({ shift, employees, onAssign, onDelete }) {
	const [selectedEmployee, setSelectedEmployee] = useState('');

	const handleAssign = () => {
		if (!selectedEmployee) {
			alert('Please select an employee to assign.');
			return;
		}
		const start = new Date(shift.start);
		const end = new Date(shift.end);
		const totalHours = (end - start) / (1000 * 60 * 60);

		onAssign(shift.shiftId, selectedEmployee, totalHours.toFixed(2));
		setSelectedEmployee('');
	};

	const formatTime = (dateString) =>
		new Date(dateString).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

	return (
		<div className='shift-card'>
			<div className='shift-time'>
				{formatTime(shift.start)} - {formatTime(shift.end)}
			</div>
			<div className='assigned-employees'>
				<strong>Assigned:</strong>
				{shift.assignedEmployees?.length > 0 ? (
					<ul>
						{shift.assignedEmployees.map((emp) => (
							<li key={emp.employeeId}>
								{emp.firstName} {emp.lastName}
							</li>
						))}
					</ul>
				) : (
					<p>None</p>
				)}
			</div>
			<div className='assign-form'>
				<select
					value={selectedEmployee}
					onChange={(e) => setSelectedEmployee(e.target.value)}
				>
					<option value=''>Assign Employee...</option>
					{employees.map((emp) => (
						<option
							key={emp.employeeId}
							value={emp.employeeId}
						>
							{emp.firstName} {emp.lastName} ({emp.jobTitle})
						</option>
					))}
				</select>
				<Button
					onClick={handleAssign}
					size='small'
					variant='green'
					style={{ width: '25px', height: '25px', padding: '0' }}
				>
					<Check size='17' />
				</Button>
			</div>
			<Button
				onClick={() => onDelete(shift.shiftId)}
				variant='green'
				size='small'
				className='delete-shift-btn'
			>
				Delete Shift
			</Button>
		</div>
	);
}

export function ScheduleManagementPage() {
	const { userEntityData, businessEmployeeWorksFor } = useUserData();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [shifts, setShifts] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const getInitialDateRange = () => {
		const start = new Date();
		start.setDate(start.getDate() - start.getDay());
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 6);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	};

	const [dateRange, setDateRange] = useState(getInitialDateRange);

	const hasAccess = hasMinAccessLvl('manager', userEntityData);

	const loadData = useCallback(async () => {
		if (!hasAccess || !businessEmployeeWorksFor) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const [shiftsData, employeesData] = await Promise.all([
				fetchAllShifts(dateRange),
				fetchAllEmployees(businessEmployeeWorksFor.businessId),
			]);
			// Assuming the API returns shifts with an `assignedEmployees` array
			console.log('Shifts Data:', shiftsData);

			setShifts(shiftsData);
			setEmployees(employeesData);
		} catch (err) {
			setError('Failed to load schedule data. Please try again later.');
			console.error('Error loading schedule data:', err);
		} finally {
			setLoading(false);
		}
	}, [dateRange, hasAccess, businessEmployeeWorksFor]);

	useEffect(() => {
		loadData();
	}, [dateRange, hasAccess, loadData]);

	const handleDateChange = (weeksToAdd) => {
		setDateRange((prev) => {
			const newStart = new Date(prev.start);
			newStart.setDate(newStart.getDate() + weeksToAdd * 7);
			const newEnd = new Date(newStart);
			newEnd.setDate(newEnd.getDate() + 6);
			newEnd.setHours(23, 59, 59, 999);
			return { start: newStart, end: newEnd };
		});
	};

	const handleAssignEmployee = async (shiftId, employeeId, totalHours) => {
		const result = await assignEmployeeToShift(
			shiftId,
			employeeId,
			totalHours
		);
		if (result.success) {
			loadData(); // Refresh data to show the new assignment
		}
	};

	const handleDeleteShift = async (shiftId) => {
		if (window.confirm('Are you sure you want to delete this shift?')) {
			const result = await deleteShift(shiftId);
			if (result.success) {
				loadData(); // Refresh data
			}
		}
	};

	const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
		const day = new Date(dateRange.start);
		day.setDate(day.getDate() + i);
		return day;
	});

	if (!hasAccess) {
		return (
			<div className='centered-page'>
				<p>You do not have permission to access this page.</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='centered-page'>
				<Loader />
			</div>
		);
	}

	if (error) {
		return <div className='centered-page error-message'>{error}</div>;
	}

	return (
		<div className='page schedule-management-page'>
			<header className='schedule-header'>
				<h1>Schedule Management</h1>
				<div className='schedule-actions'>
					<div className='schedule-nav'>
						<Button onClick={() => handleDateChange(-1)}>
							Prev Week
						</Button>
						<span>
							{dateRange.start.toLocaleDateString()} -{' '}
							{dateRange.end.toLocaleDateString()}
						</span>
						<Button onClick={() => handleDateChange(1)}>
							Next Week
						</Button>
					</div>
					<Button
						variant='green'
						onClick={() => setShowCreateModal(true)}
					>
						Create Shift
					</Button>
				</div>
			</header>

			<div className='schedule-grid'>
				{daysOfWeek.map((day) => {
					const dayShifts = shifts.filter((shift) => {
						const shiftDate = new Date(shift.start);
						return (
							shiftDate.getFullYear() === day.getFullYear() &&
							shiftDate.getMonth() === day.getMonth() &&
							shiftDate.getDate() === day.getDate()
						);
					});

					return (
						<div
							key={day.toISOString()}
							className='schedule-day'
						>
							<h3>
								{day.toLocaleDateString([], {
									weekday: 'long',
									month: 'short',
									day: 'numeric',
								})}
							</h3>
							<div className='shifts-container'>
								{dayShifts.length > 0 ? (
									dayShifts.map((shift) => (
										<ShiftCard
											key={shift.shiftId}
											shift={shift}
											employees={employees}
											onAssign={handleAssignEmployee}
											onDelete={handleDeleteShift}
										/>
									))
								) : (
									<p className='no-shifts'>
										No shifts scheduled.
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{showCreateModal && (
				<CreateShiftModal
					onClose={() => setShowCreateModal(false)}
					onShiftCreated={loadData}
				/>
			)}
		</div>
	);
}
