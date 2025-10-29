import { hasMinAccessLvl } from '../../../utils/access';
import {
	Calendar,
	PawPrint,
	TreePalm,
	BriefcaseMedical,
	Apple,
	CalendarCog,
	Building,
	Users,
	BarChart,
	ShieldBan,
	DollarSign,
} from 'lucide-react';

export function availableLinksForAccessLevel(uedata) {
	const links = [];

	if (hasMinAccessLvl('worker', uedata)) {
		links.push({
			to: '/portal/shift-schedule',
			label: 'My Schedule',
			icon: Calendar,
		});
	}

	if (hasMinAccessLvl('zookeeper', uedata)) {
		links.push(
			{ to: '/portal/animals', label: 'Animals', icon: PawPrint },
			{
				to: '/portal/medical-records',
				label: 'Medical Records',
				icon: BriefcaseMedical,
			},
			{
				to: '/portal/feeding-schedules',
				label: 'Feeding Schedules',
				icon: Apple,
			}
			// { to: '#', label: 'File Complaints', icon: Smile } // troll face moment
		);
	}

	if (hasMinAccessLvl('manager', uedata)) {
		links.push(
			{
				to: '/portal/schedule-management',
				label: 'Schedule Management',
				icon: CalendarCog,
			},
			{
				to: '/portal/attractions',
				label: 'Attractions',
				icon: Building,
			},
			{ to: '/portal/employees', label: 'Employees', icon: Users },
			{ to: '/portal/reports', label: 'Reports', icon: BarChart },
			{ to: '/portal/habitats', label: 'Manage Habitats', icon: TreePalm },
			{ to: '/portal/expenses', label: 'Expenses', icon: DollarSign }
		);
	}

	if (hasMinAccessLvl('executive', uedata)) {
		links.push({
			to: '/portal/business-management',
			label: 'Business Management',
			icon: Building,
		});
	}

	if (hasMinAccessLvl('db_admin', uedata)) {
		links.push({
			to: '/portal/admin',
			label: 'Command Center',
			icon: ShieldBan,
		});
	}

	return links;
}
