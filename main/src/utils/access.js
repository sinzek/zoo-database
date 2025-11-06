const ACCESS_LEVELS = {
	zookeeper: 3,
	manager: 4,
	executive: 5,
	db_admin: 6,
};

/**
 * @param {'zookeeper' | 'manager' | 'executive' | 'db_admin'} level
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
