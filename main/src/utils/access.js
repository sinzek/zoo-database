const ACCESS_LEVELS = {
	zookeeper: 1,
	manager: 2,
	db_admin: 3,
};

/**
 * @param {'zookeeper' | 'manager' | 'db_admin'} level
 * @returns {boolean}
 */
export function hasMinAccessLvl(level, userEntityData) {
	if (
		!ACCESS_LEVELS[level] ||
		!userEntityData ||
		!userEntityData.accessLevel
	) {
		return false;
	}

	return ACCESS_LEVELS[userEntityData.accessLevel] >= ACCESS_LEVELS[level];
}
