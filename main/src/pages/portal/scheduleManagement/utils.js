import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';

/**
 * Fetches all shifts within a given date range.
 * @param {{ start: Date, end: Date }} dateRange - The date range to fetch shifts for.
 * @returns {Promise<Array>} A promise that resolves to an array of shift objects.
 */
export async function fetchAllShifts(dateRange) {
	const result = await api('/api/shifts/get-n-by-date-range', 'POST', {
		startDate: dateRange.start.toISOString(),
		endDate: dateRange.end.toISOString(),
	});

	if (!result.success) {
		showToast(`Error fetching shifts: ${result.error}`);
		return [];
	}
	console.log('Fetched shifts:', result.data);

	return result.data || [];
}

/**
 * Fetches all employees.
 * @returns {Promise<Array>} A promise that resolves to an array of employee objects.
 */
export async function fetchAllEmployees(businessId) {
	const result = await api('/api/employee/get-n-by-business', 'POST', {
		businessId,
	});

	if (!result.success) {
		showToast(`Error fetching employees: ${result.error}`);
		return [];
	}
	return result.data || [];
}

/**
 * Creates a new shift.
 * @param {object} shiftData - The data for the new shift.
 * @returns {Promise<{success: boolean, data: object}>} A promise that resolves with the result.
 */
export async function createShift(shiftData) {
	const result = await api('/api/shifts/create', 'POST', shiftData);
	if (result.success) {
		showToast('Shift created successfully!');
	} else {
		showToast(`Error creating shift: ${result.error}`);
	}
	return result;
}

/**
 * Assigns an employee to a shift.
 * @param {string} shiftId - The ID of the shift.
 * @param {string} employeeId - The ID of the employee.
 * @param {number} totalHours - The total hours for the assignment.
 * @returns {Promise<{success: boolean}>} A promise that resolves with the result.
 */
export async function assignEmployeeToShift(shiftId, employeeId, totalHours) {
	const result = await api('/api/shifts/assign-employee-to-shift', 'POST', {
		shiftId,
		employeeId,
		totalHours,
	});

	if (result.success) {
		showToast('Employee assigned successfully!');
	} else {
		showToast(`Error assigning employee: ${result.error}`);
	}
	return result;
}

/**
 * Deletes a shift.
 * @param {string} shiftId - The ID of the shift to delete.
 * @returns {Promise<{success: boolean}>} A promise that resolves with the result.
 */
export async function deleteShift(shiftId) {
	const result = await api('/api/shifts/delete', 'POST', { shiftId });
	if (result.success) {
		showToast('Shift deleted successfully!');
	} else {
		showToast(`Error deleting shift: ${result.error}`);
	}
	return result;
}
