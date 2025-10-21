import { Navbar } from './components/navbar/navbar';
import { useRouter } from './context/routerContext';
import NotFoundPage from './pages/404/404';
import HomePage from './pages/home/home';
import LoginPage from './pages/login/login';

export default function Router() {
	const { path, match } = useRouter();

	const isAuthProtectedPage = path.startsWith('/portal');
	const isLoginOrSignupPage = path === '/login' || path === '/signup';

	const animalsMatch = match('/animals/:id');

	let content = null;
	if (path === '/') content = <HomePage />;
	else if (path === '/login') content = <LoginPage />;
	else if (animalsMatch) content = <div>Animal ID: {animalsMatch.id}</div>;
	else content = <NotFoundPage />;

	return (
		<div className='router-container'>
			{!isAuthProtectedPage && !isLoginOrSignupPage && <Navbar />}
			{content}
		</div>
	);
}
