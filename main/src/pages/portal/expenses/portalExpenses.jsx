import { useState, useEffect } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import { api } from '../../../utils/client-api-utils';
import { Button } from '../../../components/button';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import './portalExpenses.css';
import { getAllDeletedExpenses } from './extra';

export function PortalExpensesPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [loading, setLoading] = useState(false);
	const [expensesLoading, setExpensesLoading] = useState(false);
	const [businesses, setBusinesses] = useState([]);
	const [expenses, setExpenses] = useState([]);
	const [selectedBusinessId, setSelectedBusinessId] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [hasFetchedDeleted, setHasFetchedDeleted] = useState(false);
	const [formData, setFormData] = useState({
		expenseDescription: '',
		cost: '',
		purchaseDate: '',
		businessId: '',
	});

	const isManagerPlus =
		userEntityData &&
		userEntityType === 'employee' &&
		['manager', 'db_admin'].includes(userEntityData.accessLevel);

	const isAdmin =
		userEntityData &&
		userEntityType === 'employee' &&
		userEntityData.accessLevel === 'db_admin';

	const canAccessAllBusinesses =
		userEntityData &&
		userEntityType === 'employee' &&
		['manager', 'db_admin'].includes(userEntityData.accessLevel);

	// Load businesses on mount
	useEffect(() => {
		const loadBusinesses = async () => {
			try {
				const res = await api('/api/business/get-all', 'POST');
				if (res.success && Array.isArray(res.data)) {
					if (canAccessAllBusinesses) {
						setBusinesses(res.data);
					} else if (isManagerPlus && userEntityData?.businessId) {
						const filteredBusiness = res.data.filter(
							(b) => b.businessId === userEntityData.businessId
						);
						setBusinesses(filteredBusiness);
						setSelectedBusinessId(userEntityData.businessId);
					}
				}
			} catch (e) {
				console.error('Failed to load businesses:', e);
			}
		};

		if (isManagerPlus) {
			loadBusinesses();
		}
	}, [isManagerPlus, canAccessAllBusinesses, userEntityData]);

	// Load expenses when business changes
	useEffect(() => {
		if (selectedBusinessId) {
			setHasFetchedDeleted(false);
			loadExpenses();
		} else {
			setExpenses([]);
		}
	}, [selectedBusinessId]);

	const loadExpenses = async () => {
		setExpensesLoading(true);
		try {
			const res = await api('/api/expense/get-by-business', 'POST', {
				businessId: selectedBusinessId,
			});
			if (res.success && Array.isArray(res.data)) {
				setExpenses(res.data);
			} else {
				setExpenses([]);
			}
		} catch (e) {
			console.error('Failed to load expenses:', e);
			setExpenses([]);
		} finally {
			setExpensesLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const resetFormFields = () => {
		setFormData({
			expenseDescription: '',
			cost: '',
			purchaseDate: '',
			businessId: canAccessAllBusinesses
				? ''
				: userEntityData?.businessId || '',
		});
	};

	const closeForm = () => {
		setEditingId(null);
		setShowAddForm(false);
		resetFormFields();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Validation
			if (
				!formData.expenseDescription ||
				formData.expenseDescription.trim() === ''
			) {
				showToast('Please enter a description');
				setLoading(false);
				return;
			}

			if (!formData.cost || parseFloat(formData.cost) <= 0) {
				showToast('Please enter a valid cost (greater than 0)');
				setLoading(false);
				return;
			}

			if (!formData.purchaseDate) {
				showToast('Please select a purchase date');
				setLoading(false);
				return;
			}

			// Set business ID based on access level
			const businessId =
				canAccessAllBusinesses && editingId === null
					? formData.businessId || selectedBusinessId
					: canAccessAllBusinesses && editingId
						? selectedBusinessId
						: userEntityData?.businessId;

			if (!businessId) {
				showToast('Please select a business');
				setLoading(false);
				return;
			}

			const expenseData = {
				expenseDescription: formData.expenseDescription.trim(),
				cost: parseFloat(formData.cost),
				purchaseDate: formData.purchaseDate + ' 00:00:00',
				businessId,
			};

			let res;
			if (editingId) {
				// Update existing expense
				res = await api('/api/expense/update', 'PUT', {
					expenseId: editingId,
					...expenseData,
				});
			} else {
				// Create new expense
				res = await api('/api/expense/create', 'POST', expenseData);
			}

			if (res.success) {
				showToast(
					editingId
						? 'Expense updated successfully'
						: 'Expense added successfully'
				);
				closeForm();
				await loadExpenses();
			} else {
				showToast(res.error || 'Failed to save expense');
			}
		} catch (e) {
			showToast(e?.message || 'Failed to save expense');
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (expense) => {
		// Format date for input (YYYY-MM-DD)
		const purchaseDate = expense.purchaseDate
			? new Date(expense.purchaseDate).toISOString().split('T')[0]
			: '';

		setFormData({
			expenseDescription: expense.expenseDescription || '',
			cost: expense.cost || '',
			purchaseDate,
			businessId: expense.businessId || '',
		});
		setEditingId(expense.expenseId);
		setShowAddForm(true);
	};

	const handleDelete = async (expenseId) => {
		if (!window.confirm('Are you sure you want to delete this expense?')) {
			return;
		}

		setLoading(true);
		try {
			const res = await api('/api/expense/delete', 'POST', { expenseId });
			if (res.success) {
				showToast('Expense deleted successfully');
				await loadExpenses();
			} else {
				showToast(res.error || 'Failed to delete expense');
			}
		} catch (e) {
			showToast(e?.message || 'Failed to delete expense');
		} finally {
			setLoading(false);
		}
	};

	const handleBusinessChange = (e) => {
		setSelectedBusinessId(e.target.value);
	};

	if (!isManagerPlus) {
		return (
			<div className='portal-expenses-page'>
				<p className='error-message'>
					Expense management is available to managers and above.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-expenses-page'>
			<div className='expenses-header'>
				<h1 style={{ marginRight: '20px' }}>Expense Management</h1>
				<Button
					onClick={() => {
						resetFormFields();
						setEditingId(null);
						setShowAddForm(true);
					}}
					variant='green'
					size='sm'
				>
					<Plus size={20} />
					Add Expense
				</Button>
			</div>

			{canAccessAllBusinesses && (
				<div className='expense-filter-container'>
					<div className='form-group'>
						<label htmlFor='businessFilter'>
							Filter by Business
						</label>
						<select
							id='businessFilter'
							name='businessFilter'
							value={selectedBusinessId}
							onChange={handleBusinessChange}
						>
							<option value=''>Select a business</option>
							{businesses.map((business) => (
								<option
									key={business.businessId}
									value={business.businessId}
								>
									{business.name} ({business.type})
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			{showAddForm && (
				<div className='expense-form-container'>
					<div className='form-header'>
						<h2>{editingId ? 'Edit Expense' : 'New Expense'}</h2>
						<Button
							onClick={closeForm}
							variant='outline'
							aria-label='Close'
							size='sm'
						>
							<X size={24} />
						</Button>
					</div>
					<form
						className='expense-form'
						onSubmit={handleSubmit}
					>
						<div className='form-group'>
							<label htmlFor='expenseDescription'>
								Description *
							</label>
							<input
								type='text'
								id='expenseDescription'
								name='expenseDescription'
								value={formData.expenseDescription}
								onChange={handleInputChange}
								placeholder='Enter expense description'
								required
								maxLength={100}
							/>
						</div>

						<div className='form-group'>
							<label htmlFor='cost'>Cost ($) *</label>
							<input
								type='number'
								id='cost'
								name='cost'
								value={formData.cost}
								onChange={handleInputChange}
								placeholder='0.00'
								step='0.01'
								min='0.01'
								required
							/>
						</div>

						<div className='form-group'>
							<label htmlFor='purchaseDate'>
								Purchase Date *
							</label>
							<input
								type='date'
								id='purchaseDate'
								name='purchaseDate'
								value={formData.purchaseDate}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className='expense-form-actions'>
							<Button
								type='button'
								variant='outline'
								onClick={closeForm}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								variant='green'
								loading={loading}
							>
								{editingId ? 'Update Expense' : 'Add Expense'}
							</Button>
						</div>
					</form>
				</div>
			)}

			<div className='expenses-list'>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						justifyContent: 'space-between',
					}}
				>
					<h2>Expenses</h2>
					{expenses?.length > 0 && (
						<p style={{ color: 'var(--color-lbrown)' }}>
							Total Expenses: $
							{expenses
								.reduce(
									(total, exp) =>
										total + parseFloat(exp.cost || 0),
									0
								)
								.toFixed(2)}
						</p>
					)}
					{isAdmin && (
						<Button
							onClick={async () => {
								if (hasFetchedDeleted) return;
								setHasFetchedDeleted(true);
								await getAllDeletedExpenses(
									expenses,
									setExpenses,
									setExpensesLoading,
									userEntityData,
									selectedBusinessId
								);
							}}
							variant='outline'
							size='sm'
							disabled={hasFetchedDeleted}
							loading={expensesLoading}
						>
							{hasFetchedDeleted
								? 'Deleted Expenses Included'
								: 'Include Deleted Expenses'}
						</Button>
					)}
				</div>
				{expensesLoading ? (
					<div className='centered-loader'>
						<Loader />
					</div>
				) : expenses.length === 0 ? (
					<p className='no-expenses'>No expenses found.</p>
				) : (
					<div className='expenses-grid'>
						{expenses
							.sort(
								(a, b) =>
									new Date(b.purchaseDate) -
									new Date(a.purchaseDate)
							)
							.map((expense) => (
								<div
									key={expense.expenseId}
									className='expense-card'
									style={{
										opacity: expense.deletedAt ? 0.5 : 1,
										pointerEvents: expense.deletedAt
											? 'none'
											: 'auto',
									}}
								>
									<div className='expense-info'>
										<h3>
											{expense.expenseDescription ||
												'No description'}
											{expense.deletedAt
												? ' (Deleted)'
												: ''}
										</h3>
										<p className='expense-cost'>
											$
											{expense.cost !== null &&
											expense.cost !== undefined
												? parseFloat(
														expense.cost
													).toFixed(2)
												: '0.00'}
										</p>
										<p className='expense-date'>
											{expense.purchaseDate
												? new Date(
														expense.purchaseDate
													).toLocaleDateString()
												: 'No date'}
										</p>
									</div>
									<div className='expense-actions'>
										<Button
											variant='green'
											onClick={() => handleEdit(expense)}
											aria-label='Edit expense'
										>
											<Edit2 size={18} />
										</Button>
										{/* only the admins can delete expenses, and deleted expenses cannot be deleted again */}
										{isAdmin && !expense.deletedAt && (
											<Button
												variant='outline'
												onClick={() =>
													handleDelete(
														expense.expenseId
													)
												}
												aria-label='Delete expense'
											>
												<Trash2 size={18} />
											</Button>
										)}
									</div>
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
