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
import { PortalHabitatsPage } from './pages/portal/habitats/portalHabitats';

import MembershipPage from './pages/membership/membership';
import MembershipDetailPage from './pages/membership/membershipDetails';

import { BuyMembershipPage } from './pages/portal/buyMembership/buyMembership';

export default function Router() {
	const { path, match } = useRouter();
	const { userEntityType, userEntityData } = useUserData();

	const isAuthProtectedPage = path.startsWith('/portal');
	const isLoginOrSignupPage = path === '/login' || path === '/signup';

	const habitatMatch = match('/habitats/:id');
	const medicalRecordMatch = match('/portal/medical-records/:animalId');
	const feedingScheduleMatch = match('/portal/feeding-schedules/:animalId');

	const membershipMatch = match('/membership/:id');

	const buyMembershipMatch = match('/membership/buy/:id');





	let content = null;

	const pathMap = {
		'/': HomePage,
		'/login': LoginPage,

		'/habitats': HabitatsPage,
		'/attractions': AttractionsPage,
		'/animals': AnimalsPage,

		'/membership': MembershipPage,

		'/portal': PortalPage,
		'/portal/account': AccountPage,
		'/portal/animals': PortalAnimalsPage,
		'/portal/medical-records': MedicalRecordsPage,
		'/portal/feeding-schedules': FeedingSchedulesPage,
		'/portal/habitats': PortalHabitatsPage,
		'/portal/buy-tickets': BuyTicketsPage,
		'/portal/cart': CartPage,
		'/portal/shop': ShopPage,
		'/portal/shift-schedule': ShiftSchedulePage,
		'/portal/schedule-management': ScheduleManagementPage,

		'/testing': TestingPage,
	};

if (habitatMatch) {
        content = <HabitatDetailsPage id={habitatMatch.id} />;
    }
	
	else if (buyMembershipMatch) { 
        content = <BuyMembershipPage id={buyMembershipMatch.id} />;
    } else if (membershipMatch) {
        content = <MembershipDetailPage id={membershipMatch.id} />;
    }

	else if (medicalRecordMatch) {
        content = <MedicalRecordDetailPage animalId={medicalRecordMatch.animalId} />;
    } else if (feedingScheduleMatch) {
        content = <FeedingScheduleDetailPage animalId={feedingScheduleMatch.animalId} />;
    } else if (membershipMatch) {
        content = <MembershipDetailPage id={membershipMatch.id} />;
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