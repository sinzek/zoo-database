import { useUserData } from '../../../context/userDataContext';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/button';
import { showToast } from '../../../components/toast/showToast';
import { api } from '../../../utils/client-api-utils';
import { FormBuilder } from '../../../components/formBuilder/formBuilder';
import './account.css';

export function AccountPage() {
	const { userEntityData, userInfo, userEntityType, setUserEntityData } =
		useUserData();

	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		if (userEntityData) {
			setFormData(userEntityData);
		}
	}, [userEntityData]);

	const handleCancel = () => {
		setFormData(userEntityData);
		setIsEditing(false);
	};

	const handleSave = async () => {
		setIsSubmitting(true);
		const endpoint =
			userEntityType === 'employee'
				? '/api/employee/update'
				: '/api/customer/update';

		const result = await api(endpoint, 'PUT', formData);

		if (result.success) {
			setUserEntityData(formData);
			setIsEditing(false);
			showToast('Account updated successfully!');
		} else {
			showToast(`Error: ${result.error || 'Failed to update account.'}`);
		}
		setIsSubmitting(false);
	};

	const getFields = () => {
		const commonFields = [
			{ name: 'firstName', label: 'First Name', type: 'text' },
			{ name: 'lastName', label: 'Last Name', type: 'text' },
			{ name: 'middleInitial', label: 'Middle Initial', type: 'text' },
		];

		if (userEntityType === 'employee') {
			return [
				...commonFields,
				{ name: 'phone', label: 'Phone', type: 'tel' },
				{
					name: 'addressStreet',
					label: 'Street Address',
					type: 'text',
				},
				{ name: 'addressCity', label: 'City', type: 'text' },
				{ name: 'addressState', label: 'State', type: 'text' },
				{
					name: 'addressPostalCode',
					label: 'Postal Code',
					type: 'text',
				},
			];
		}
		return commonFields; // For customer
	};

	if (!userEntityData) {
		return <div className='centered-page'>Loading account details...</div>;
	}

	return (
		<div className='centered-page account-page'>
			<h1>My Account</h1>
			<div className='account-card'>
				<div className='account-info-static'>
					<p>
						<strong>Email:</strong> {userInfo.email}
					</p>
					{userEntityType === 'employee' && (
						<>
							<p>
								<strong>Job Title:</strong>{' '}
								{userEntityData.jobTitle}
							</p>
							<p>
								<strong>Access Level:</strong>{' '}
								{userEntityData.accessLevel}
							</p>
						</>
					)}
					{userEntityType === 'customer' && (
						<p>
							<strong>Member Since:</strong>{' '}
							{new Date(
								userEntityData.joinDate
							).toLocaleDateString()}
						</p>
					)}
				</div>

				<FormBuilder
					fields={getFields()}
					formData={formData}
					setFormData={setFormData}
					isEditing={isEditing}
					style={{
						flexDirection:
							userEntityType === 'employee' ? 'row' : 'column',
						flexWrap:
							userEntityType === 'employee' ? 'wrap' : 'nowrap',
					}}
				/>

				<div className='account-actions'>
					{isEditing ? (
						<>
							<Button
								variant='outline'
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								variant='green'
								onClick={handleSave}
								loading={isSubmitting}
							>
								Save Changes
							</Button>
						</>
					) : (
						<Button onClick={() => setIsEditing(true)}>
							Edit Information
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
