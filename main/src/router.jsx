import { Navbar } from './components/navbar/navbar';
import { useRouter } from './context/routerContext';
import NotFoundPage from './pages/404/404';
import HomePage from './pages/home/home';
import HabitatsPage from './pages/habitats/habitats';
import LoginPage from './pages/login/login';
import AttractionsPage from './pages/attractions/attractions';
import HabitatDetailsPage from './pages/habitats/habitatDetails';
import { TestingPage } from './pages/testing/testing';
import AnimalsPage from './pages/animals/animals';
import { PortalPage } from './pages/portal/portal';
import { AccountPage } from './pages/portal/account/account';
import { TopMenu } from './components/topMenu/topMenu';

export default function Router() {
	const { path, match } = useRouter();

	const isAuthProtectedPage = path.startsWith('/portal');
	const isLoginOrSignupPage = path === '/login' || path === '/signup';

	const habitatMatch = match('/habitats/:id');

	let content = null;

	const pathMap = {
		'/': HomePage,
		'/login': LoginPage,

		'/habitats': HabitatsPage,
		'/attractions': AttractionsPage,
		'/animals': AnimalsPage,

		'/portal': PortalPage,
		'/portal/account': AccountPage,

		'/testing': TestingPage,
	};

	if (habitatMatch) {
		content = <HabitatDetailsPage id={habitatMatch.id} />;
	} else if(pathMap[path]) {
		const Component = pathMap[path];
		content = <Component />;
	} else {
		content = <NotFoundPage />;
	}

	return (
		<div className='router-container'>
			{!isAuthProtectedPage && !isLoginOrSignupPage && <Navbar />}
			<TopMenu />
			{content}
		</div>
	);
}
