import { Button } from '../../components/button';
import { api } from '../../utils/client-api-utils';
import { showToast } from '../../components/toast/showToast';
import { useState } from 'react';
import './testing.css';

export function TestingPage() {
	const [loading, setLoading] = useState(false);

	const genDummyEmps = async () => {
		setLoading(true);
		const result = await api('/api/dummy-data/gen-emps', 'POST');

		if (result.success) {
			showToast('Dummy employees generated successfully!');
		} else {
			showToast(
				`Error: ${result.error || 'Failed to generate dummy employees.'}`
			);
		}
		setLoading(false);
	};

	return (
		<div className='testing-page'>
			<h1>Testing Page</h1>
			<Button
				loading={loading}
				variant='outline'
				size='lg'
				onClick={genDummyEmps}
				disabled
			>
				Generate Dummy Employees
			</Button>
		</div>
	);
}
