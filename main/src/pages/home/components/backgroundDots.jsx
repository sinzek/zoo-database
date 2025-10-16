import './backgroundDots.css';

export function BackgroundDots() {
	return (
		<div className='background-dots'>
			{Array.from({ length: 10 }).map((_, index) => (
				<div
					key={`background-dot-${index}`}
					className='dot'
					style={{
						// random position
						top: `${Math.random() * 100}%`,
						left: `${Math.random() * 50}%`,

						// random size between 20 and 100px
						width: `${20 + Math.random() * 100}px`,
						height: 'auto',
						// random opacity between 0.05 and 0.25
						opacity: 0.01 + Math.random() * 0.05,
					}}
				/>
			))}
		</div>
	);
}
