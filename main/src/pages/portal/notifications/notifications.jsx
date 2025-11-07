import { useEffect, useState } from 'react';
import { useUserData } from '../../../context/userDataContext';
import './notifications.css';
import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { Button } from '../../../components/button';
import { BookCheck, Check, Trash2 } from 'lucide-react';

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

	const formatDateTime = (dateString) => {
		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	async function markAsRead(notificationId) {
		const result = await api('/api/notifications/mark-as-read', 'POST', {
			notificationId,
		});

		if (!result.success) {
			showToast('Error marking notification as read: ' + result.message);
			return;
		}

		// update local state
		setNotis((prevNotis) =>
			prevNotis.map((noti) =>
				noti.notificationId === notificationId
					? { ...noti, seen: true }
					: noti
			)
		);
	}

	async function hardDeleteNotification(notificationId) {
		const result = await api('/api/notifications/delete-one', 'POST', {
			notificationId,
		});

		if (!result.success) {
			showToast('Error deleting notification: ' + result.message);
			return;
		}

		// update local state
		setNotis((prevNotis) =>
			prevNotis.filter((noti) => noti.notificationId !== notificationId)
		);

		showToast('Notification deleted successfully');
	}

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
					gridTemplateColumns: '1fr 1fr 0.5fr',
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
					marginBottom: '1.75rem',
				}}
			/>

			{notis.length === 0 && (
				<i style={{ color: 'var(--color-lbrown)', fontSize: '1.2rem' }}>
					No notifications at this time.
				</i>
			)}
			{notis.length > 0 &&
				notis
					.sort(
						(a, b) =>
							new Date(b.sentAt).getTime() -
							new Date(a.sentAt).getTime()
					)
					.map((noti) => (
						<div
							key={noti.notificationId}
							style={{
								marginBottom: '1.5rem',
								display: 'grid',
								gridTemplateColumns: '1fr 1fr 0.5fr',
								columnGap: '1rem',
								alignItems: 'center',
								borderBottom: '2px solid var(--color-brown)',
								paddingBottom: '1.75rem',
								color: 'var(--color-lgreen)',
								opacity: noti.seen ? 0.6 : 1,
							}}
						>
							<h3>{formatDateTime(noti.sentAt)}</h3>
							<p>{noti.content}</p>
							<div
								style={{
									display: 'flex',
									gap: '0.5rem',
									flexDirection: 'column',
								}}
							>
								<Button
									variant='green'
									size='sm'
									onClick={() =>
										markAsRead(noti.notificationId)
									}
									disabled={noti.seen}
								>
									{noti.seen ? (
										<>
											<Check size={16} />
											Read
										</>
									) : (
										<>
											<BookCheck size={16} />
											Mark as Read
										</>
									)}
								</Button>

								<Button
									variant='outline'
									size='sm'
									onClick={() =>
										hardDeleteNotification(
											noti.notificationId
										)
									}
								>
									<Trash2 size={16} />
									Delete
								</Button>
							</div>
						</div>
					))}
		</div>
	);
}
