import { Navbar } from "./components/navbar/navbar";
import { useRouter } from "./context/routerContext";
import NotFoundPage from "./pages/404/404";
import HomePage from "./pages/home/home";
import HabitatsPage from "./pages/habitats/habitats";
import LoginPage from "./pages/login/login";
import AttractionsPage from "./pages/attractions/attractions";
import { PortalPage } from "./pages/portal/portal";
import HabitatDetailsPage from "./pages/habitats/habitatDetails";

import MembershipPage from './pages/membership/membership'; // new
import MembershipDetailPage from './pages/membership/membershipDetails';

export default function Router() {
  const { path, match } = useRouter();

  const isAuthProtectedPage = path.startsWith("/portal");
  const isLoginOrSignupPage = path === "/login" || path === "/signup";

  const animalsMatch = match("/animals/:id");
  const habitatMatch = match("/habitats/:id");

  const membershipMatch = match('/membership/:id');

  let content = null;
  if (path === "/") content = <HomePage />;
  else if (path === "/login") content = <LoginPage />;

  else if (path === "/habitats") content = <HabitatsPage />;
  else if (habitatMatch) content = <HabitatDetailsPage id={habitatMatch.id} />;
  
  else if (path === "/attractions") content = <AttractionsPage />;
  else if (animalsMatch) content = <div>Animal ID: {animalsMatch.id}</div>;
  else if (path === "/portal") content = <PortalPage />;

  else if (membershipMatch) content = <MembershipDetailPage id={membershipMatch.id} />; 
  else if (path === '/membership') content = <MembershipPage />;   


  else content = <NotFoundPage />;
  

  return (
    <div className="router-container">
      {!isAuthProtectedPage && !isLoginOrSignupPage && <Navbar />}
      {content}
    </div>
  );
}
