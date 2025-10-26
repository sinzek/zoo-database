import { useState } from 'react';
import { useUserData } from '../../context/userDataContext';
import './userMenu.css';
import { ChevronDown } from 'lucide-react';
import { Link } from '../link';

export function UserMenu() {
	const { userEntityData, logout } = useUserData();
	const [isOpen, setIsOpen] = useState(false);
    const [mouseLeaveTimeout, setMouseLeaveTimeout] = useState(null);

    const mouseLeaveDebounceTime = 500; // milliseconds


    const handleFade = (direction) => {
        const userMenu = document.querySelector('.user-menu');
        if (direction === 'in') {
            userMenu.classList.add('open');
            userMenu.classList.remove('closed');
        } else {
            userMenu.classList.add('closed');
            userMenu.classList.remove('open');
        }

        setTimeout(() => {
            setIsOpen(direction === 'in');
        }, 100); // wait for animation to complete
    }

    const handleMouseEnter = async () => {
        clearTimeout(mouseLeaveTimeout);
        handleFade('in');
    }

    const handleMouseLeave = async () => {
        setMouseLeaveTimeout(setTimeout(() => {
            handleFade('out');
        }, mouseLeaveDebounceTime));
    }

	return (
		<div className="user-menu">
			<button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="user-menu-button">
                <div className='avatar'>
                    {userEntityData.firstName.charAt(0)}
                    {userEntityData.lastName.charAt(0)}
                </div>
				{userEntityData.firstName} {userEntityData.lastName} <ChevronDown size={20} style={{ rotate: isOpen ? '180deg' : '0deg', transition: 'all 0.2s ease' }} />
			</button>
			{isOpen && (
				<ul onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
					<Link to="/portal/account" className="user-menu-link"><li>My Account</li></Link>
					<Link onClick={logout} className="user-menu-link"><li>Logout</li></Link>
				</ul>
			)}
		</div>
	);
}
