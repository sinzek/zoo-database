import { useState } from 'react';
import './App.css';

function App() {
	const handleSendTestAPIRequest = async () => {
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Something went wrong');
			}

			console.log('Response from API:', data);
			alert(`Response from API: ${data.message}`);
		} catch (err) {
			console.error('Error calling API:', err);
			alert(`Error: ${err.message}`);
		}
	};

	return (
		<>
			<div className='app-container'>
				<h1>Zoo Database Project</h1>
				<p>
					This is a placeholder. Make sure you watch a video about the
					fundamentals of JavaScript and React!
				</p>
				<button
					className='btn-outline'
					onClick={async () => await handleSendTestAPIRequest()}
				>
					Test the API
				</button>
			</div>
		</>
	);
}

export default App;
