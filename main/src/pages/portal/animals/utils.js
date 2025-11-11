import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';

export async function fetchAnimals() {
	const result = await api('/api/animal/get-all-grouped-by-habitat', 'POST');

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to fetch animals.'}`);
		return [];
	}

	// Flatten the grouped data into a single array
	const animals = [];
	for (const habitatGroup of result.data || []) {
		if (habitatGroup.animals) {
			for (const animal of habitatGroup.animals) {
				animals.push({
					...animal,
					habitatName: habitatGroup.habitatName,
					habitatDeletedAt: habitatGroup.habitatDeletedAt,
				});
			}
		}
	}

	return animals;
}

export async function fetchHabitats() {
	const result = await api('/api/habitats/get-all', 'POST');

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to fetch habitats.'}`);
		return [];
	}

	return result.data || [];
}

export async function createAnimal(animalData) {
	const result = await api('/api/animal/create', 'POST', animalData);

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to create animal.'}`);
		return { success: false };
	}

	showToast('Animal created successfully');
	return { success: true, data: result.data };
}

export async function updateAnimal(animalId, animalData) {
	const result = await api('/api/animal/update', 'PUT', {
		animalId,
		...animalData,
	});

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to update animal.'}`);
		return { success: false };
	}

	showToast('Animal updated successfully');
	return { success: true, data: result.data };
}

export async function deleteAnimal(animalId) {
	const result = await api('/api/animal/delete-one', 'POST', { animalId });

	if (!result.success) {
		showToast(`Error: ${result.error || 'Failed to delete animal.'}`);
		return { success: false };
	}

	showToast('Animal deleted successfully');
	return { success: true };
}
