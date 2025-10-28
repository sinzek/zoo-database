import { showToast } from '../../../components/toast/showToast';
import { api } from '../../../utils/client-api-utils';

export function dateIsWithin6Hours(date, referencedDate) {
	if (!date || !referencedDate) return false;
	console.log('Comparing dates:', date.toString(), referencedDate.toString());

	const sixHoursInMs = 6 * 60 * 60 * 1000;
	return (
		Math.abs(
			new Date(date).getTime() - new Date(referencedDate).getTime()
		) <= sixHoursInMs
	);
}

export async function fetchShiftSchedule(employeeId, dateRange) {
	const result = await api('/api/shifts/get-n-by-employee', 'POST', {
		employeeId,
	});

	if (!result.success) {
		showToast(
			`Error: ${result.error || 'Failed to fetch shift schedule.'}`
		);
		return [{ shifts: [], clockTimes: [] }]; // return empty arrays on error
	}

	console.log('Fetched shifts:', result.data);

	const { shifts, clockTimes } = result.data;

	// optionally filter by date range
	if (dateRange) {
		const { startDate, endDate } = dateRange;
		console.log('Filtering shifts from', startDate, 'to', endDate);

		return {
			shifts: shifts.filter((shift) => {
				const shiftStart = new Date(shift.start);
				const shiftEnd = new Date(shift.end);
				return (
					shiftStart >= new Date(startDate) &&
					shiftEnd <= new Date(endDate)
				);
			}),
			clockTimes: clockTimes.filter((clockTime) => {
				const clockStart = new Date(clockTime.startTime);
				const clockEnd = new Date(clockTime.endTime);

				console.log('Clock time:', clockTime, clockStart, clockEnd);
				console.log(
					'Is within range:',
					clockStart >= new Date(startDate) &&
						clockEnd <= new Date(endDate)
				);

				return (
					clockStart >= new Date(startDate) &&
					clockEnd <= new Date(endDate)
				);
			}),
		};
	}

	return { shifts, clockTimes };
}
