import { showToast } from '../../../components/toast/showToast';
import { api } from '../../../utils/client-api-utils';

export async function fetchShiftSchedule(employeeId, dateRange) {
	const result = await api('/api/shifts/get-n-by-employee', 'POST', {
		employeeId,
	});

	if (!result.success) {
		showToast(
			`Error: ${result.error || 'Failed to fetch shift schedule.'}`
		);
		return [];
	}

	const shifts = result.data;

	// optionally filter by date range
	if (dateRange) {
		const { startDate, endDate } = dateRange;
		return shifts.filter((shift) => {
			const shiftStart = new Date(shift.start);
			const shiftEnd = new Date(shift.end);
			return (
				shiftStart >= new Date(startDate) &&
				shiftEnd <= new Date(endDate)
			);
		});
	}

	return shifts;
}
