import { useEffect, useState } from 'react';
import { useRouter } from '../../../context/routerContext';
import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';
import { useUserData } from '../../../context/userDataContext';
import './membershipTransaction.css';

export function MembershipTransactionPage() {
	const [loading, setLoading] = useState(true);
	const [transaction, setTransaction] = useState(null);
	const [membership, setMembership] = useState(null);

	const { path } = useRouter();
	const { userEntityData: customer, userEntityType } = useUserData();

	useEffect(() => {
		async function fetchTransactionData() {
			const slices = path.split('/');
			const transactionId = slices[slices.length - 1];

			const result = await api(
				'/api/transactions/get-membership-transaction',
				'POST',
				{
					transactionId,
				}
			);

			if (!result.success) {
				console.error('Error fetching transaction data:', result.error);
				showToast(
					`Error: ${result.error || 'Failed to fetch transaction data.'}`
				);
				setLoading(false);
				return;
			}

			setTransaction(result.data.transaction);
			setMembership(result.data.membership);
			setLoading(false);
		}

		fetchTransactionData();
	}, [path]);

	if (userEntityType !== 'customer') {
		return (
			<div className='membership-transaction-page'>
				<h2>Access Denied</h2>
				<p>This page is only accessible to customers.</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='membership-transaction-page'>
				<h2>Loading...</h2>
			</div>
		);
	}

	if (!transaction || !membership) {
		return (
			<div className='membership-transaction-page'>
				<h2>Error</h2>
				<p>Unable to load membership transaction details.</p>
			</div>
		);
	}

	return (
		<div className='receipt-container'>
			<div className='receipt-card'>
				<h1 className='receipt-header'>Thank You For Your Purchase!</h1>
				<p className='receipt-subheader'>
					Here is a summary of your new membership.
				</p>

				<div className='receipt-section'>
					<h2>Customer Details</h2>
					<p>
						<strong>Name:</strong> {customer.firstName}{' '}
						{customer.lastName}
					</p>
				</div>

				<div className='receipt-section'>
					<h2>Membership Details</h2>
					<p>
						<strong>Level:</strong>{' '}
						<span className='capitalize'>{membership.level}</span>
					</p>
					<p>
						<strong>Start Date:</strong>{' '}
						{new Date(membership.startDate).toLocaleDateString()}
					</p>
					<p>
						<strong>Expiration Date:</strong>{' '}
						{new Date(membership.expireDate).toLocaleDateString()}
					</p>
					<p>
						<strong>Auto-Renew:</strong>{' '}
						{membership.autoRenew ? 'Yes' : 'No'}
					</p>
				</div>

				<div className='receipt-section'>
					<h2>Transaction Summary</h2>
					<p>
						<strong>Transaction ID:</strong>{' '}
						{transaction.transactionId}
					</p>
					<p>
						<strong>Date:</strong>{' '}
						{new Date(membership.startDate).toLocaleDateString()}
					</p>
					<p>
						<strong>Amount Paid:</strong> $
						{Number(transaction.amount).toFixed(2)}
					</p>
				</div>

				<div className='receipt-footer'>
					<p>
						A confirmation has been sent to your notification box.
					</p>
					<p>We look forward to seeing you at The Zoo(TM)!</p>
				</div>
			</div>
		</div>
	);
}
