import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';

// Fetches all employees (you might want filtering options later)
export async function fetchEmployees() {
    // NOTE: Ensure this API endpoint exists and returns an array of employees
    const result = await api('/api/employee/get-all', 'POST'); 

    if (!result.success) {
        showToast(`Error: ${result.error || 'Failed to fetch employees.'}`);
        return [];
    }
    return result.data || [];
}


// New
export async function fetchAnimals() {
	
	const result = await api('/api/animal/get-all-grouped-by-habitat','POST');

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to fetch animals.'}`);
		return [];
	}

	const animals = [];
	for (const habitatGroup of result.data || []) {
		if (habitatGroup.animals) {
			for (const animal of habitatGroup.animals) {
				animals.push({
					
					animalId: animal.animalId,
					name: animal.firstName || animal.commonName, 
					species: animal.species,
				});
			}
		}
	}

    
	return animals; //Flat list
}

// New
export async function updateAssignedAnimals(employeeId, animalIds) {
    const result = await api('/api/employee/assign-animals', 'POST', {
        employeeId: employeeId,
        animalIds: animalIds, //array of animal IDs
    });

    if (!result.success) {
        console.error("API Error: Failed to assign animals.", result.error);
        return { success: false, error: result.error };
    }
    return { success: true };
}



// Fetches businesses for dropdowns
export async function fetchBusinesses() {
    // NOTE: Ensure this API endpoint exists
    const result = await api('/api/business/get-all', 'POST'); 
    if (!result.success) {
        showToast(`Error: ${result.error || 'Failed to fetch businesses.'}`);
        return [];
    }
    return result.data || [];
}

// Creates a new employee
export async function createEmployee(employeeData) {
    // NOTE: Ensure this API endpoint exists and handles employee creation
    const result = await api('/api/employee/create', 'POST', employeeData);

    if (!result.success) {
        showToast(`Error: ${result.error || 'Failed to create employee.'}`);
        return { success: false };
    }
    showToast('Employee created successfully!');
    return { success: true, data: result.data };
}

// Updates an existing employee
export async function updateEmployee(employeeId, employeeData) {
    // NOTE: Ensure this API endpoint exists and handles updates
    const result = await api('/api/employee/update-one', 'PUT', {
        employeeId, // Make sure API expects employeeId in the body
        ...employeeData,
    });

    if (!result.success) {
        showToast(`Error: ${result.error || 'Failed to update employee.'}`);
        return { success: false };
    }
    showToast('Employee updated successfully!');
    return { success: true, data: result.data };
}

// (Optional) Fetches employees to act as potential supervisors
export async function fetchSupervisors() {
    // Re-use fetchEmployees or create a specific endpoint if needed
    return fetchEmployees(); 
}