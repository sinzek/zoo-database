import { useState } from 'react';
import './App.css';

function App() {
	const [count, setCount] = useState(0);

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
					onClick={() => setCount((count) => count + 1)}
				>
					Count is {count}
				</button>
			</div>
		</>
	);
}

export default App;
