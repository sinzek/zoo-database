import { showToast } from '../../../components/toast/showToast';
import { hasMinAccessLvl } from '../../../utils/access';
import { api } from '../../../utils/client-api-utils';

export async function getAllDeletedAnimals(
	curAnimals,
	setAnimals,
	setLoading,
	userEntityData
) {
	if (!hasMinAccessLvl('zookeeper', userEntityData)) {
		showToast('ERROR: You do not have permission to view deleted animals.');
		return;
	}

	setLoading(true);
	const result = await api('/api/animal/get-all-deleted', 'GET');

	if (!result.success) {
		console.error('Error fetching deleted animals:', result.error);
		showToast(
			`ERROR: ${result.error || 'Failed to fetch deleted animals.'}`
		);
		setLoading(false);
		return;
	}

	const deletedAnimals = result.data;
	setAnimals([...curAnimals, ...deletedAnimals]);
	setLoading(false);
}
