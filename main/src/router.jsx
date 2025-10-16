import { Navbar } from './components/navbar/navbar';
import { useRouter } from './context/routerContext';
import HomePage from './pages/home/home';

export default function Router() {
	const { path, match } = useRouter();

	const isAuthProtectedPage = path.startsWith('/portal');

	const animalsMatch = match('/animals/:id');

	let content = null;
	if (path === '/') content = <HomePage />;
	else if (animalsMatch) content = <div>Animal ID: {animalsMatch.id}</div>;
	else content = <div>404 Not Found</div>;

	return (
		<div className='router-container'>
			{!isAuthProtectedPage && <Navbar />}
			{content}
		</div>
	);
}
