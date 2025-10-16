import crypto from 'crypto';

/**
 * For hashing passwords using SHA-256 (this is pretty insecure)
 * @param {string} password
 * @returns {string} Hashed password
 */
export function sha256Hash(password) {
	if (typeof password !== 'string') {
		throw new Error('Password must be a string');
	}

	return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Validates password against basic rules:
 * - at least 8 characters
 * - at least one uppercase letter
 * - at least one lowercase letter
 * - at least one number
 * - at least one special character
 * @param {string} password
 * @returns {{valid: boolean, error?: string}} if not valid, error contains reason
 */
export function validatePasswordRules(password) {
	if (typeof password !== 'string') {
		return { valid: false, error: 'Password must be a string' };
	}

	if (password.length < 8) {
		return {
			valid: false,
			error: 'Password must be at least 8 characters long',
		};
	}

	if (!/[A-Z]/.test(password)) {
		return {
			valid: false,
			error: 'Password must contain at least one uppercase letter',
		};
	}

	if (!/[a-z]/.test(password)) {
		return {
			valid: false,
			error: 'Password must contain at least one lowercase letter',
		};
	}

	if (!/[0-9]/.test(password)) {
		return {
			valid: false,
			error: 'Password must contain at least one number',
		};
	}

	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		return {
			valid: false,
			error: 'Password must contain at least one special character',
		};
	}

	return { valid: true };
}

/**
 * Attempts to validate that all provided strings are non-empty and do not contain potentially dangerous characters.
 * @param  {...string} strings Array of strings to validate
 * @returns {boolean} false if one is not valid, true if all valid
 */
export function validateStrings(...strings) {
	for (const str of strings) {
		if (typeof str !== 'string' || str.trim() === '') {
			return false;
		}

		if (
			str.includes("'") ||
			str.includes('"') ||
			str.includes('<') ||
			str.includes('>') ||
			str.includes(';') ||
			str.includes('--')
		) {
			return false; // basic check to prevent SQL injection
		}
	}

	return true;
}
