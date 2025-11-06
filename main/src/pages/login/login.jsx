import { useState } from 'react';

import { Link } from 'react-router-dom'; 
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

		<a href = "/" className="home-button" style={{
			position: 'absolute',
			top: '20px',
			left: '20px',
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			color: 'var(--color-lbrown)', 
			textDecoration: 'none', 
			fontWeight: '500' }}>
				
			<ArrowLeft size={20} />
			Back to Home
		</a>

			<h1>Welcome back to</h1>
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
