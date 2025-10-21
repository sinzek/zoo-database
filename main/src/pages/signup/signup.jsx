import { useState } from 'react';
import './signup.css';
import { determineFieldErrorText, validateSignupData } from './utils';
//import { useRouter } from '../../context/routerContext';
import { showToast } from '../../components/toast/showToast';
import { Link } from '../../components/link';
import { cn } from '../../utils/cn';
import { Loader } from '../../components/loader/loader';

export default function SignupPage() {

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		middleInitial: '',
	});
	const [_formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [step, setStep] = useState(1);
	const [showPassword, setShowPassword] = useState(false);

	async function handleSubmit() {
		if (isSubmitting) return;

		const { valid, errors } = validateSignupData(formData);

		if (!valid) {
			setFormErrors(errors);
			showToast(
				'ERROR: Please ensure all fields are filled out correctly'
			);
			return;
		}

		try {
			setIsSubmitting(true);
			const newUser = {
				...formData,
			};

			// no need for this on the backend
			delete newUser.confirmPassword;

			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newUser),
			});

			const data = await response.json();

			if (!response.ok) {
				throw data;
			}

			showToast('Success! Account created.');
		} catch (error) {
			console.error('Signup error:', error);
			if (error.fields) {
				for (const field in error.fields) {
					if (
						error.fields[field] &&
						error.fields[field].trim() !== ''
					) {
						setFormErrors((prevErrors) => ({
							...prevErrors,
							[field]: determineFieldErrorText(field),
						}));
					}
				}
			}

			showToast(`ERROR: ${error.error || 'Failed to sign up'}`);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className='main-container'>
			<h1>Welcome to</h1>
			<h1 className='the-zoo-text'>The Zoo™</h1>
			<p className='signup-subtext'>
				Sign up today to purchase tickets and become a The Zoo™
				Member™
			</p>
			<form
				className='signup-form'
				id='signup-form'
			>
				{step === 1 ? (
					<>
						<div className='form-group'>
							<label htmlFor='firstName'>First Name</label>
							<input
								id='firstName'
								autoComplete='given-name'
								type='text'
								value={formData.firstName}
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value,
									})
								}
								placeholder='Enter your first name'
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='lastName'>Last Name</label>
							<input
								id='lastName'
								autoComplete='family-name'
								type='text'
								value={formData.lastName}
								onChange={(e) =>
									setFormData({
										...formData,
										lastName: e.target.value,
									})
								}
								placeholder='Enter your last name'
							/>
						</div>
					</>
				) : (
					<>
						<div className='form-group'>
							<label htmlFor='email'>Email Address</label>
							<input
								id='email'
								type='email'
								autoComplete='email'
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								placeholder='Enter your email'
							/>
						</div>
						<div className='form-group'>
							<div className='pwd-row'>
								<label htmlFor='password'>Password</label>
								<button
									type='button'
									className='show-pwd-btn'
									onClick={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? '🙈 Hide' : '🐵 Show'}
								</button>
							</div>
							<input
								id='password'
								type={showPassword ? 'text' : 'password'}
								autoComplete='new-password'
								value={formData.password}
								onChange={(e) =>
									setFormData({
										...formData,
										password: e.target.value,
									})
								}
								placeholder='Enter a good password'
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='password'>Confirm Password</label>
							<input
								id='confirmPassword'
								type={showPassword ? 'text' : 'password'}
								autoComplete='new-password'
								value={formData.confirmPassword}
								onChange={(e) =>
									setFormData({
										...formData,
										confirmPassword: e.target.value,
									})
								}
								placeholder='Confirm your password'
							/>
						</div>
					</>
				)}
				<button
					className={cn(
						'btn btn-green',
						step === 1 ? 'btn-outine' : 'btn-green'
					)}
					type='button'
					onClick={async () => {
						if (step === 1) {
							setStep(2);
							return;
						} else {
							await handleSubmit();
						}
					}}
					disabled={
						isSubmitting ||
						(step === 1 &&
							(formData.firstName.trim() === '' ||
								formData.lastName.trim() === '')) ||
						(step === 2 &&
							(formData.password !== formData.confirmPassword ||
								formData.password.trim() === '' ||
								formData.email.trim() === ''))
					}
				>
					{isSubmitting && <Loader />}
					{step === 1
						? 'Continue'
						: isSubmitting
							? 'Submitting...'
							: 'Sign Up'}
				</button>
			</form>
			<p className='login-redirect'>
				Already have an account?{' '}
				<Link
					to='/login'
					href='/login'
				>
					Log in here
				</Link>
			</p>
		</div>
	);
}
