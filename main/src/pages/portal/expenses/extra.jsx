import { showToast } from '../../../components/toast/showToast';
import { hasMinAccessLvl } from '../../../utils/access';
import { api } from '../../../utils/client-api-utils';

export async function getAllDeletedExpenses(
	curExpenses,
	setExpenses,
	setLoading,
	userEntityData,
	selectedBusinessId
) {
	if (!hasMinAccessLvl('db_admin', userEntityData)) {
		showToast('ERROR: You do not have permission to view deleted expenses.');
		return;
	}

	setLoading(true);
	const result = await api('/api/expense/get-all-deleted', 'POST', {
		businessId: selectedBusinessId || null,
	});

	if (!result.success) {
		console.error('Error fetching deleted expenses:', result.error);
		showToast(
			`ERROR: ${result.error || 'Failed to fetch deleted expenses.'}`
		);
		setLoading(false);
		return;
	}

	// Handle nested array structure from backend (similar to revenue report)
	const raw = result.data;
	let deletedExpenses;
	if (Array.isArray(raw)) {
		if (raw.length > 0 && Array.isArray(raw[0])) {
			deletedExpenses = raw[0];
		} else {
			deletedExpenses = raw;
		}
	} else {
		deletedExpenses = [];
	}

	setExpenses([...curExpenses, ...deletedExpenses]);
	setLoading(false);
}

