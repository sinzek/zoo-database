function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 *
 * @param {{ email: string, password: string, confirmPassword: string, firstName: string, lastName: string }} params
 * @returns {{ valid: boolean, errors: { [key: string]: string }}}
 */
export function validateSignupData({
	email,
	password,
	confirmPassword,
	firstName,
	lastName,
}) {
	const errors = {};

	if (!email || email.trim() === '') {
		errors.username = 'Email is required';
	} else if (!isValidEmail(email)) {
		errors.username = 'Please enter a valid email address';
	}

	const { valid: passwordValid, error: passwordError } =
		validatePasswordRules(password);

	if (!password || password.trim() === '') {
		errors.password = 'Password is required';
	} else if (!passwordValid) {
		errors.password = passwordError;
	}

	if (!confirmPassword || confirmPassword.trim() === '') {
		errors.confirmPassword = 'Please confirm your password';
	} else if (password !== confirmPassword) {
		errors.confirmPassword = 'Passwords do not match';
	}

	if (!firstName || firstName.trim() === '') {
		errors.firstName = 'First name is required';
	} else if (firstName.length > 50) {
		errors.firstName = 'First name must be 50 characters or less';
	}

	if (!lastName || lastName.trim() === '') {
		errors.lastName = 'Last name is required';
	} else if (lastName.length > 50) {
		errors.lastName = 'Last name must be 50 characters or less';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
	};
}

export function determineFieldErrorText(fieldName) {
	switch (fieldName) {
		case 'firstName':
			return 'First name is invalid';
		case 'lastName':
			return 'Last name is invalid';
		case 'email':
			return 'Email is invalid';
		case 'password':
			return 'Password is invalid';
		default:
			return 'Unknown error';
	}
}

/**
 * Validates password against one basic rule:
 * - at least 8 characters
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

	return { valid: true };
}
