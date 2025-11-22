import { useState } from 'react';

import { Link } from '../../components/link';
import { ArrowLeft } from 'lucide-react';

import './login.css';
import { useUserData } from '../../context/userDataContext';
import { Button } from '../../components/button';

export default function LoginPage() {
	const { login } = useUserData();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	async function handleSubmit() {
		if (isSubmitting) return;

		setIsSubmitting(true);

		await login(formData.email, formData.password);

		setIsSubmitting(false);
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

			<h1 style={{ marginTop: '20px' }}>Welcome back to</h1>
			<h1 className='the-zoo-text'>The Zoo™</h1>
			<p className='login-subtext'>
				Log in to access your account and explore the wild side!
			</p>
			{error && <p className='error-message'>{error}</p>}
			<div
				className='login-form'
				id='login-form'
			>
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
							className='show-pwd-btn'
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? '🙈 Hide' : '🐵 Show'}
						</button>
					</div>
					<input
						id='password'
						autoComplete='current-password'
						type={showPassword ? 'text' : 'password'}
						value={formData.password}
						onChange={(e) => {
							setFormData({
								...formData,
								password: e.target.value,
							});
							setError(null);
						}}
						placeholder='Enter your password'
						onKeyDown={(e) => {
							if (
								!formData.email.trim() ||
								!formData.password.trim()
							)
								return;

							if (e.key === 'Enter') {
								handleSubmit();
							}
						}}
					/>
				</div>
				<Button
					variant='green'
					size='lg'
					loading={isSubmitting}
					onClick={handleSubmit}
					disabled={
						!formData.email.trim() || !formData.password.trim()
					}
				>
					Log In
				</Button>
			</div>
		</div>
	);
}
