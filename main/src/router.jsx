import { Navbar } from './components/navbar/navbar';
import { useRouter } from './context/routerContext';
import NotFoundPage from './pages/404/404';
import HomePage from './pages/home/home';
import HabitatsPage from './pages/habitats/habitats';
import LoginPage from './pages/login/login';
import AttractionsPage from './pages/attractions/attractions';
import AttractionDetailPage from './pages/attractions/attractionDetail';
import HabitatDetailsPage from './pages/habitats/habitatDetails';
import { TestingPage } from './pages/testing/testing';
import AnimalsPage from './pages/animals/animals';
import { PortalPage } from './pages/portal/portal';
import { AccountPage } from './pages/portal/account/account';
import { TopMenu } from './components/topMenu/topMenu';
import { BuyTicketsPage } from './pages/portal/buyTickets/buyTickets';
import { CartPage } from './pages/portal/cart/cart';
import { ShopPage } from './pages/portal/shop/shop';
import { Sidebar } from './pages/portal/sidebar/sidebar';
import { useUserData } from './context/userDataContext';
import { ShiftSchedulePage } from './pages/portal/shiftSchedule/shiftSchedule';
import { PortalAnimalsPage } from './pages/portal/animals/animals';
import { MedicalRecordsPage } from './pages/portal/medicalRecords/medicalRecords';
import { MedicalRecordDetailPage } from './pages/portal/medicalRecords/medicalRecordDetail';
import { FeedingSchedulesPage } from './pages/portal/feedingSchedules/feedingSchedules';
import { FeedingScheduleDetailPage } from './pages/portal/feedingSchedules/feedingScheduleDetail';
import { ScheduleManagementPage } from './pages/portal/scheduleManagement/scheduleManagement';
import { PortalAttractionsPage } from './pages/portal/attractions/portalAttractions';
import { PortalReportsPage } from './pages/portal/reports/reports';
import { PortalRevenueReportPage } from './pages/portal/reports/revenue';
import { PortalHabitatsPage } from './pages/portal/habitats/portalHabitats';
import { BusinessManagementPage } from './pages/portal/businessManagement/businessManagement';

export default function Router() {
	const { path, match } = useRouter();
	const { userEntityType, userEntityData } = useUserData();

	const isAuthProtectedPage = path.startsWith('/portal');
	const isLoginOrSignupPage = path === '/login' || path === '/signup';

    const habitatMatch = match('/habitats/:id');
    const attractionMatch = match('/attractions/:id');
	const medicalRecordMatch = match('/portal/medical-records/:animalId');
	const feedingScheduleMatch = match('/portal/feeding-schedules/:animalId');

	let content = null;

	const pathMap = {
		'/': HomePage,
		'/login': LoginPage,

		'/habitats': HabitatsPage,
		'/attractions': AttractionsPage,
		'/animals': AnimalsPage,

		'/portal': PortalPage,
		'/portal/account': AccountPage,
		'/portal/animals': PortalAnimalsPage,
		'/portal/medical-records': MedicalRecordsPage,
		'/portal/feeding-schedules': FeedingSchedulesPage,
		'/portal/attractions': PortalAttractionsPage,
		'/portal/habitats': PortalHabitatsPage,
		'/portal/buy-tickets': BuyTicketsPage,
		'/portal/cart': CartPage,
		'/portal/shop': ShopPage,
		'/portal/shift-schedule': ShiftSchedulePage,
		'/portal/schedule-management': ScheduleManagementPage,
		'/portal/reports': PortalReportsPage,
		'/portal/reports/revenue': PortalRevenueReportPage,
		'/portal/business-management': () => <BusinessManagementPage />,

		'/testing': TestingPage,
	};

    if (habitatMatch) {
		content = <HabitatDetailsPage id={habitatMatch.id} />;
    } else if (attractionMatch) {
        content = <AttractionDetailPage id={attractionMatch.id} />;
	} else if (medicalRecordMatch) {
		content = (
			<MedicalRecordDetailPage animalId={medicalRecordMatch.animalId} />
		);
	} else if (feedingScheduleMatch) {
		content = (
			<FeedingScheduleDetailPage
				animalId={feedingScheduleMatch.animalId}
			/>
		);
	} else if (pathMap[path]) {
		const Component = pathMap[path];
		content = <Component />;
	} else {
		content = <NotFoundPage />;
	}

	return (
		<div className='router-container'>
			{!isAuthProtectedPage && !isLoginOrSignupPage && <Navbar />}
			<TopMenu />
			<Sidebar
				ueType={userEntityType}
				uedata={userEntityData}
			/>
			<div
				className='content-container'
				id='main-content'
			>
				{content}
			</div>
		</div>
	);
}
