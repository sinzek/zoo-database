import { FormBuilder } from '../../components/formBuilder/formBuilder';
import { useUserData } from '../../context/userDataContext';
import { useState } from 'react';

export function TestPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [formData, setFormData] = useState({
		exampleField: '',
		anotherField: '',
	});

	return (
		<div>
			Welcome to the Test Page, {userEntityData?.firstName || 'User'}! You
			are a {userEntityType || 'Unknown Type'}
			<br />
			<FormBuilder
				fields={[
					{
						name: 'exampleField',
						label: 'Example Field',
						type: 'text',
						placeholder: 'Enter something...',
						autoComplete: 'off',
					},
					{
						name: 'anotherField',
						label: 'Another Field',
						type: 'number',
						placeholder: 'Enter a number...',
						autoComplete: 'off',
					},
				]}
				formData={formData}
				setFormData={setFormData}
			/>
		</div>
	);
}
