import { useState } from 'react';
import './login.css';
//import { useRouter } from '../../context/routerContext';
import { showToast } from '../../components/toast/showToast';
import { Loader } from '../../components/loader/loader';
import { api } from '../../utils/client-api-utils';

export default function LoginPage() {
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

		const result = await api('/api/auth/login', 'POST', {
			email: formData.email,
			password: formData.password,
		});

		if (!result.success) {
			console.error('Login error:', result.error);
			showToast(`ERROR: ${result.error || 'Failed to log in'}`);
			setError(result.error || 'Failed to log in');
			setIsSubmitting(false);
			return;
		}

		const { data } = result;
		console.log('Login successful:', data);
		showToast('Success! Logged in.');
		setIsSubmitting(false);
		//router.navigateTo('/portal'); --- IGNORE ---
	}

	return (
		<div className='main-container'>
			<h1>Welcome back to</h1>
			<h1 className='the-zoo-text'>The Zoo™</h1>
			<p className='login-subtext'>
				Log in to access your account and explore the wild side!
			</p>
			{error && <p className='error-message'>{error}</p>}
			<form
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
						onChange={(e) =>
							setFormData({
								...formData,
								email: e.target.value,
							})
						}
						placeholder='Enter your email address'
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='password'>Password</label>
					<input
						id='password'
						autoComplete='current-password'
						type='password'
						value={formData.password}
						onChange={(e) =>
							setFormData({
								...formData,
								password: e.target.value,
							})
						}
						placeholder='Enter your password'
					/>
				</div>
				<button
					className='btn btn-green'
					type='button'
					onClick={handleSubmit}
					disabled={
						isSubmitting ||
						!formData.email.trim() ||
						!formData.password.trim()
					}
				>
					{isSubmitting && <Loader />}
					{isSubmitting ? 'Logging in...' : 'Log In'}
				</button>
			</form>
		</div>
	);
}
