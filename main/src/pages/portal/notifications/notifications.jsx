import { useEffect, useState } from 'react';
import { useUserData } from '../../../context/userDataContext';
import './notifications.css';
import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';

export function NotificationsPage() {
	const { userInfo } = useUserData();
	const [notis, setNotis] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchNotifications() {
			if (!userInfo || !userInfo.userId) return;
			setLoading(true);
			const result = await api('/api/notifications/get-n-by-user', 'GET');

			if (!result.success) {
				console.error('Failed to fetch notifications:', result.message);
				showToast('Error fetching notifications: ' + result.message);
				setLoading(false);
				return;
			}

			console.log('Fetched notifications:', result.data);

			setNotis(result.data || []);
			setLoading(false);
		}

		fetchNotifications();
	}, [userInfo]);

	if (loading) {
		return (
			<div
				className='centered-page'
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					gap: '1rem',
					color: 'var(--color-lgreen)',
				}}
			>
				<Loader /> Fetching notifications...
			</div>
		);
	}

	return (
		<div
			className='notifications-page'
			style={{ color: 'var(--color-green)' }}
		>
			<h1>Notifications</h1>
			<p style={{ marginTop: '20px', color: 'var(--color-lgreen)' }}>
				Here&apos;s where important stuff happens.
			</p>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					columnGap: '1rem',
					marginTop: '1rem',
					marginBottom: '0rem',
					color: 'var(--color-lbrown)',
				}}
			>
				<h3>Date</h3>
				<h3>Message</h3>
			</div>
			<div
				style={{
					height: '2px',
					width: '100%',
					backgroundColor: 'var(--color-brown)',
					marginTop: '0rem',
				}}
			/>

			{notis.length === 0 && (
				<i style={{ color: 'var(--color-lbrown)', fontSize: '1.2rem' }}>
					No notifications at this time.
				</i>
			)}
			{notis.length > 0 &&
				notis.map((noti) => (
					<div
						key={noti.notificationId}
						style={{
							marginBottom: '1.5rem',
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							columnGap: '1rem',
							alignItems: 'center',
							borderBottom: '2px solid var(--color-brown)',
							paddingBottom: '1rem',
							paddingTop: '1rem',
							color: 'var(--color-lgreen)',
						}}
					>
						<h3>
							{new Date(noti.sentAt).toISOString().split('T')[0]}
						</h3>
						<p>{noti.content}</p>
					</div>
				))}
		</div>
	);
}
