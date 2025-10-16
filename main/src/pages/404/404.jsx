import { Link } from '../../components/link';
import './404.css';

export default function NotFoundPage() {
	return (
		<div className='not-found-page'>
			<h1>404 - Page Not Found</h1>
			<Link
				to='/'
				className='btn btn-green'
				href='/'
			>
				Return Home
			</Link>
		</div>
	);
}
