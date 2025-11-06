// ...existing code...
import { useState } from 'react';
import { Link } from '../../components/link';
import { ArrowLeft } from 'lucide-react';
import { useUserData } from '../../context/userDataContext';
import { Button } from '../../components/button';

export function SignupPage() {
	const { signup } = useUserData();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
		middleInitial: '',
	});
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// new state for multi-step form + show/hide password
	const [step, setStep] = useState(1);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	async function handleFinalSubmit() {
		if (isSubmitting) return;

		setIsSubmitting(true);
		setError(null);

		const res = await signup(
			formData.email,
			formData.password,
			formData.firstName,
			formData.lastName,
			formData.middleInitial
		);

		if (!res?.success) {
			setError(res?.error || 'Failed to sign up (unknown error)');
			setIsSubmitting(false);
			return;
		}

		// success - keep behavior minimal here (context may redirect)
		setIsSubmitting(false);
	}

	function handleNext() {
		// validate step 1 inputs
		if (!formData.email.trim()) {
			setError('Email is required.');
			return;
		}
		if (!formData.password.trim()) {
			setError('Password is required.');
			return;
		}
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match.');
			return;
		}
		setError(null);
		setStep(2);
	}

	return (
		<div className='main-container'>
			<Link
				to='/'
				className='btn btn-outline btn-sm'
			>
				<ArrowLeft size={16} />
				Back to Home
			</Link>

			<h1 style={{ marginTop: '20px' }}>Welcome to</h1>
			<h1 className='the-zoo-text'>The Zoo™</h1>
			<p className='login-subtext'>
				Sign up to create an account and explore the wild side!
			</p>
			{error && <p className='error-message'>{error}</p>}
			<div style={{ maxWidth: '350px' }}>
				<div
					className='login-form'
					id='signup-form'
				>
					{step === 1 && (
						<>
							<div className='form-group'>
								<label htmlFor='email'>Email</label>
								<input
									id='email'
									autoComplete='email'
									type='email'
									value={formData.email}
									onChange={(e) => {
										setFormData({
											...formData,
											email: e.target.value,
										});
										setError(null);
									}}
									placeholder='Enter your email address'
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
									autoComplete='new-password'
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={(e) => {
										setFormData({
											...formData,
											password: e.target.value,
										});
										setError(null);
									}}
									placeholder='Create a password'
								/>
							</div>

							<div className='form-group'>
								<div className='pwd-row'>
									<label htmlFor='confirmPassword'>
										Confirm Password
									</label>
									<button
										type='button'
										className='show-pwd-btn'
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
									>
										{showConfirmPassword
											? '🙈 Hide'
											: '🐵 Show'}
									</button>
								</div>
								<input
									id='confirmPassword'
									autoComplete='new-password'
									type={
										showConfirmPassword
											? 'text'
											: 'password'
									}
									value={formData.confirmPassword}
									onChange={(e) => {
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										});
										setError(null);
									}}
									placeholder='Confirm your password'
								/>
							</div>

							<Button
								variant='green'
								size='lg'
								onClick={handleNext}
								disabled={
									!formData.email.trim() ||
									!formData.password.trim() ||
									!formData.confirmPassword.trim() ||
									formData.password !==
										formData.confirmPassword
								}
							>
								Next
							</Button>
						</>
					)}

					{step === 2 && (
						<>
							<div className='form-group'>
								<label htmlFor='firstName'>First Name</label>
								<input
									id='firstName'
									type='text'
									value={formData.firstName}
									onChange={(e) => {
										setFormData({
											...formData,
											firstName: e.target.value,
										});
										setError(null);
									}}
									placeholder='First name'
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='middleInitial'>
									Middle Initial
								</label>
								<input
									id='middleInitial'
									type='text'
									maxLength={1}
									value={formData.middleInitial}
									onChange={(e) => {
										setFormData({
											...formData,
											middleInitial: e.target.value.slice(
												0,
												1
											),
										});
										setError(null);
									}}
									placeholder='M'
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='lastName'>Last Name</label>
								<input
									id='lastName'
									type='text'
									value={formData.lastName}
									onChange={(e) => {
										setFormData({
											...formData,
											lastName: e.target.value,
										});
										setError(null);
									}}
									placeholder='Last name'
								/>
							</div>

							<div style={{ display: 'flex', gap: '8px' }}>
								<Button
									variant='outline'
									size='lg'
									onClick={() => setStep(1)}
									disabled={isSubmitting}
								>
									<ArrowLeft size={16} />
									Back
								</Button>
								<Button
									variant='green'
									size='lg'
									loading={isSubmitting}
									onClick={handleFinalSubmit}
									disabled={
										!formData.firstName.trim() ||
										!formData.lastName.trim()
									}
								>
									Sign up
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
// ...existing code...
