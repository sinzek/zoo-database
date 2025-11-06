import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../../../context/userDataContext';
import { Button } from '../../../components/button';
import { showToast } from '../../../components/toast/showToast';
import { Loader } from '../../../components/loader/loader';
import {
	fetchEmployees,
	createEmployee,
	updateEmployee,
	fetchBusinesses,
	fetchSupervisors,
	fetchAnimals,           // New
    updateAssignedAnimals,   // New

} from './utils';
import { Plus, Edit2, Save, X, Briefcase, CalendarOff } from 'lucide-react';
import './employees.css';

const ACCESS_LEVELS = [
	'zookeeper',
	'manager',
	'db_admin',
];
const REQUIRED_ACCESS_LEVEL = 'manager';

export function PortalEmployeesPage() {
	const { userEntityData, userEntityType } = useUserData();
	const [employees, setEmployees] = useState([]);
	const [businesses, setBusinesses] = useState([]);
	const [supervisors, setSupervisors] = useState([]);

	const [animals, setAnimals] = useState([]);                     // New
    const [assignedAnimalIds, setAssignedAnimalIds] = useState([]);    // New

	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState(null);

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		middleInitial: '',
		jobTitle: '',
		accessLevel: 'zookeeper',
		hourlyWage: '',
		ssn: '',
		sex: 'male',
		addressStreet: '',
		addressCity: '',
		addressState: '',
		addressPostalCode: '',
		phone: '',
		birthDate: '',
		hireDate: new Date().toISOString().split('T')[0],
		terminationDate: '',
		businessId: '', //FK
		supervisorId: '', //FK (can be null)
		userId: '', //FK (can be null if not linked to a login)
		email: '',
		password: '',

		payInfoAccountNum: '',
		payInfoRoutingNum: '',
		payInfoPaymentMethod: 'check',
	});

	//Permission check based on logged-in user's access level
	const hasPermission = useMemo(() => {
		if (userEntityType !== 'employee' || !userEntityData?.accessLevel)
			return false;
		const userLevelIndex = ACCESS_LEVELS.indexOf(
			userEntityData.accessLevel
		);
		const requiredLevelIndex = ACCESS_LEVELS.indexOf(REQUIRED_ACCESS_LEVEL);
		return userLevelIndex >= requiredLevelIndex;
	}, [userEntityData, userEntityType]);

	useEffect(() => {
		// Only load data with permission
		if (hasPermission) {
			loadData();
		} else {
			setLoading(false); //Stop loading if no permission
		}
	}, [hasPermission]); //Reload for permission change

	const loadData = async () => {
		setLoading(true);

		const [employeesData, businessesData, supervisorsData, animalsData] =
			await Promise.all([
				fetchEmployees(),
				fetchBusinesses(),
				fetchSupervisors(),
				fetchAnimals(), // New
			]);
		setEmployees(employeesData);
		setBusinesses(businessesData);
		setAnimals(animalsData); // New:

		setSupervisors(
			supervisorsData.filter((emp) => emp.employeeId !== editingId)
		);
		setLoading(false);
	};

	const formatDateForInput = (dateString) => {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);

			return isNaN(date.getTime())
				? ''
				: date.toISOString().split('T')[0];
		} catch (error) {
			console.error('Error formatting date:', dateString, error);
			return '';
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.jobTitle ||
			!formData.businessId ||
			!formData.hourlyWage
		) {
			showToast('Error: Please fill in all required fields (*).');
			return;
		}
		if (parseFloat(formData.hourlyWage) <= 0) {
			showToast('Error: Hourly wage must be positive.');
			return;
		}

		const employeeData = {
			...formData,
            middleInitial: formData.middleInitial || null,
            hourlyWage: parseFloat(formData.hourlyWage),
            supervisorId: formData.supervisorId || null, //Allow null supervisor
            terminationDate: formData.terminationDate || null,
            // Only include sensitive data if necessary and handled securely by API
            ssn: formData.ssn, 
            payInfoAccountNum: formData.payInfoAccountNum || null,
            payInfoRoutingNum: formData.payInfoRoutingNum || null,
            userId: null,
		};
		if (!editingId) {
			delete employeeData.employeeId;
		}

		const result = editingId
			? await updateEmployee(editingId, employeeData)
			: await createEmployee(employeeData);

		if (result.success && result.data?.employeeId) {
            const employeeId = editingId || result.data.employeeId; 
            
            //New: API for animal assignments
            const assignResult = await updateAssignedAnimals(employeeId, assignedAnimalIds);

            if (!assignResult.success) {
                
                showToast(`Warning: Employee updated, but failed to update animal assignments: ${assignResult.error}`);
            }
        }

		if (result.success) {
			setShowAddForm(false);
			setEditingId(null);
			resetForm();
			loadData();
		}
	};

	//Reset form
	const resetForm = () => {
		setFormData({
			firstName: '',
			lastName: '',
			middleInitial: '',
			jobTitle: '',
			accessLevel: 'zookeeper',
			hourlyWage: '',
			ssn: '',
			sex: 'male',
			addressStreet: '',
			addressCity: '',
			addressState: '',
			addressPostalCode: '',
			phone: '',
			birthDate: '',
			hireDate: new Date().toISOString().split('T')[0],
			terminationDate: '',
			businessId: '',
			supervisorId: '',
			userId: '',
			payInfoAccountNum: '',
			payInfoRoutingNum: '',
			payInfoPaymentMethod: 'check',
		});
		setAssignedAnimalIds([]);
	};

	const handleEdit = (employee) => {
		setEditingId(employee.employeeId);

		setFormData({
			firstName: employee.firstName || '',
			lastName: employee.lastName || '',
			middleInitial: employee.middleInitial || '',
			jobTitle: employee.jobTitle || '',
			accessLevel: employee.accessLevel || 'zookeeper',
			hourlyWage: employee.hourlyWage || '',
			ssn: employee.ssn || '', //
			sex: employee.sex || 'male',
			addressStreet: employee.addressStreet || '',
			addressCity: employee.addressCity || '',
			addressState: employee.addressState || '',
			addressPostalCode: employee.addressPostalCode || '',
			phone: employee.phone || '',
			birthDate: formatDateForInput(employee.birthDate) || '',
			hireDate: formatDateForInput(employee.hireDate) || '',
			terminationDate: formatDateForInput(employee.terminationDate) || '',
			businessId: employee.businessId || '',
			supervisorId: employee.supervisorId || '',
			userId: employee.userId || '',
			payInfoAccountNum: employee.payInfoAccountNum || '', //Sensitive
			payInfoRoutingNum: employee.payInfoRoutingNum || '', //Sensitive
			payInfoPaymentMethod: employee.payInfoPaymentMethod || 'check',
		});
		setShowAddForm(true);

		// New
		const currentAssignedIds = (employee.assignedAnimals || [])
			.map(a => (a.animalId ? a.animalId : a).toString());
		setAssignedAnimalIds(currentAssignedIds);

		setSupervisors(
			employees.filter((emp) => emp.employeeId !== employee.employeeId)
		);

		setTimeout(() => {
			const formElement = document.querySelector(
				'.employee-form-container'
			);
			if (formElement) {
				formElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}
		}, 0);
	};

	const handleCancel = () => {
		setShowAddForm(false);
		setEditingId(null);
		resetForm();
	};

	// New
	const handleAnimalSelection = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setAssignedAnimalIds(selectedOptions);
    };

	if (loading) {
		return (
			<div className='portal-employees-page'>
				<div className='centered-loader'>
					{' '}
					<Loader />{' '}
				</div>
			</div>
		);
	}

	if (!hasPermission) {
		return (
			<div className='portal-employees-page'>
				<p className='error-message'>
					Access Denied. You do not have permission to manage
					employees.
				</p>
			</div>
		);
	}

	return (
		<div className='portal-employees-page'>
			<div className='form-container'>
				<div className='employees-header'>
					<h1>Employee Management</h1>
					<Button
						onClick={() => {
							setShowAddForm(!showAddForm);
							if (showAddForm) handleCancel();
							else setEditingId(null);
						}}
						className='btn-green'
						aria-expanded={showAddForm}
					>
						{showAddForm ? (
							<>
								<X size={18} /> Cancel
							</>
						) : (
							<>
								<Plus size={18} /> Add Employee
							</>
						)}
					</Button>
				</div>

				{showAddForm && (
					<div className='employee-form-container'>
						<form
							onSubmit={handleSubmit}
							className='employee-form'
						>
							<h2>
								{editingId
									? 'Edit Employee'
									: 'Add New Employee'}
							</h2>
							<div className='form-grid'>
								{!editingId && (
									<>
										<div className='form-group'>
											<label htmlFor='email'>
												Email *
											</label>
											<input
												id='email'
												type='email'
												value={formData.email}
												onChange={(e) =>
													setFormData({
														...formData,
														email: e.target.value,
													})
												}
												placeholder='Employee email'
												required
											/>
										</div>
										<div className='form-group'>
											<label htmlFor='password'>
												Password *
											</label>
											<input
												id='password'
												type='password'
												value={formData.password}
												onChange={(e) =>
													setFormData({
														...formData,
														password:
															e.target.value,
													})
												}
												required
												placeholder='Account password'
											/>
										</div>
									</>
								)}
								<div className='form-group'>
									<label htmlFor='firstName'>
										First Name *
									</label>
									<input
										id='firstName'
										type='text'
										value={formData.firstName}
										onChange={(e) =>
											setFormData({
												...formData,
												firstName: e.target.value,
											})
										}
										required
										placeholder='Given name'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='lastName'>
										Last Name *
									</label>
									<input
										id='lastName'
										type='text'
										value={formData.lastName}
										onChange={(e) =>
											setFormData({
												...formData,
												lastName: e.target.value,
											})
										}
										required
										placeholder='Family name'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='middleInitial'>
										Middle Initial
									</label>
									<input
										id='middleInitial'
										type='text'
										maxLength='1'
										value={formData.middleInitial}
										onChange={(e) =>
											setFormData({
												...formData,
												middleInitial: e.target.value,
											})
										}
										placeholder='M'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='sex'>Sex *</label>
									<select
										id='sex'
										value={formData.sex}
										onChange={(e) =>
											setFormData({
												...formData,
												sex: e.target.value,
											})
										}
										required
									>
										<option value='male'>Male</option>
										<option value='female'>Female</option>
									</select>
								</div>
								<div className='form-group'>
									<label htmlFor='birthDate'>
										Birth Date *
									</label>
									<input
										id='birthDate'
										type='date'
										value={formData.birthDate}
										onChange={(e) =>
											setFormData({
												...formData,
												birthDate: e.target.value,
											})
										}
										required
									/>
								</div>
                                {/* SSN */}
                                <div className='form-group'>
									<label htmlFor="ssn">SSN *</label>
									<input id="ssn" type='text' pattern="\d{9}" title="SSN must be 9 digits" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required />
								</div> 

								{/* Job Info */}
								<div className='form-group'>
									<label htmlFor='jobTitle'>
										Job Title *
									</label>
									<input
										id='jobTitle'
										type='text'
										value={formData.jobTitle}
										onChange={(e) =>
											setFormData({
												...formData,
												jobTitle: e.target.value,
											})
										}
										required
										placeholder='e.g., Zookeeper Staff'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='accessLevel'>
										Access Level *
									</label>
									<select
										id='accessLevel'
										value={formData.accessLevel}
										onChange={(e) =>
											setFormData({
												...formData,
												accessLevel: e.target.value,
											})
										}
										required
										placeholder='zookeeper, manager, etc.'
									>
										{ACCESS_LEVELS.map((level) => (
											<option
												key={level}
												value={level}
											>
												{level}
											</option>
										))}
									</select>
								</div>
								<div className='form-group'>
									<label htmlFor='hourlyWage'>
										Hourly Wage *
									</label>
									<input
										id='hourlyWage'
										type='number'
										step='0.01'
										min='0.01'
										value={formData.hourlyWage}
										onChange={(e) =>
											setFormData({
												...formData,
												hourlyWage: e.target.value,
											})
										}
										required
										placeholder='e.g., 15.00'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='businessId'>
										Business/Department *
									</label>
									<select
										id='businessId'
										value={formData.businessId}
										onChange={(e) =>
											setFormData({
												...formData,
												businessId: e.target.value,
											})
										}
										required
									>
										<option value=''>
											Select Business
										</option>
										{businesses.map((business) => (
											<option
												key={business.businessId}
												value={business.businessId}
											>
												{business.name}
											</option>
										))}
									</select>
								</div>
								<div className='form-group'>
									<label htmlFor='supervisorId'>
										Supervisor
									</label>
									<select
										id='supervisorId'
										value={formData.supervisorId}
										onChange={(e) =>
											setFormData({
												...formData,
												supervisorId: e.target.value,
											})
										}
									>
										<option value=''>
											Select Supervisor (Optional)
										</option>
										{supervisors.map((emp) => (
											<option
												key={emp.employeeId}
												value={emp.employeeId}
											>
												{emp.firstName} {emp.lastName}
											</option>
										))}
									</select>
								</div>
								<div className='form-group'>
									<label htmlFor='hireDate'>
										Hire Date *
									</label>
									<input
										id='hireDate'
										type='date'
										value={formData.hireDate}
										onChange={(e) =>
											setFormData({
												...formData,
												hireDate: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='terminationDate'>
										Termination Date
									</label>
									<input
										id='terminationDate'
										type='date'
										value={formData.terminationDate}
										onChange={(e) =>
											setFormData({
												...formData,
												terminationDate: e.target.value,
											})
										}
									/>
								</div>


								{/*New: Animal Assignment*/}
                                <div className='form-group full-width'>
                                    <label htmlFor="assignedAnimals">Assigned Animals (Hold CTRL/CMD to select multiple)</label>
                                    <select 
                                        id="assignedAnimals" 
                                        multiple 
                                        size={6} 
                                        value={assignedAnimalIds} 
                                        onChange={handleAnimalSelection} 
                                    >
                                        {animals.length === 0 ? (
                                            <option disabled>No animals available</option>
                                        ) : (
                                            animals.map(animal => (
                                               	<option key={animal.animalId} value={animal.animalId.toString()}>
                                                    {animal.name} ({animal.species})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                

								{/*Contact Info  */}
								<div className='form-group'>
									<label htmlFor='phone'>Phone *</label>
									<input
										id='phone'
										type='tel'
										value={formData.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
										required
										placeholder='e.g., 5551234567'
									/>
								</div>
								<div className='form-group full-width'>
									<label htmlFor='addressStreet'>
										Street Address *
									</label>
									<input
										id='addressStreet'
										type='text'
										value={formData.addressStreet}
										onChange={(e) =>
											setFormData({
												...formData,
												addressStreet: e.target.value,
											})
										}
										required
										placeholder='e.g., 123 Zoo St'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='addressCity'>City *</label>
									<input
										id='addressCity'
										type='text'
										value={formData.addressCity}
										onChange={(e) =>
											setFormData({
												...formData,
												addressCity: e.target.value,
											})
										}
										required
										placeholder='e.g., Zouston'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='addressState'>State</label>
									<input
										id='addressState'
										type='text'
										value={formData.addressState}
										onChange={(e) =>
											setFormData({
												...formData,
												addressState: e.target.value,
											})
										}
										placeholder='e.g., Zoohio'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='addressPostalCode'>
										Postal Code *
									</label>
									<input
										id='addressPostalCode'
										type='text'
										value={formData.addressPostalCode}
										onChange={(e) =>
											setFormData({
												...formData,
												addressPostalCode:
													e.target.value,
											})
										}
										required
										placeholder='e.g., 12345'
									/>
								</div>

								{/* Payment Info*/}
								<div className='form-group'>
									<label htmlFor='payInfoPaymentMethod'>
										Payment Method *
									</label>
									<select
										id='payInfoPaymentMethod'
										value={formData.payInfoPaymentMethod}
										onChange={(e) =>
											setFormData({
												...formData,
												payInfoPaymentMethod:
													e.target.value,
											})
										}
										required
									>
										<option value='check'>Check</option>
										<option value='direct_deposit'>
											Direct Deposit
										</option>
									</select>
								</div>
								{formData.payInfoPaymentMethod ===
									'direct_deposit' && (
									<>
										<div className='form-group'>
											<label htmlFor='payInfoAccountNum'>
												Account Number
											</label>
											<input
												id='payInfoAccountNum'
												type='text'
												value={
													formData.payInfoAccountNum
												}
												onChange={(e) =>
													setFormData({
														...formData,
														payInfoAccountNum:
															e.target.value,
													})
												}
												placeholder='e.g., 000123456789'
											/>
										</div>
										<div className='form-group'>
											<label htmlFor='payInfoRoutingNum'>
												Routing Number
											</label>
											<input
												id='payInfoRoutingNum'
												type='text'
												value={
													formData.payInfoRoutingNum
												}
												onChange={(e) =>
													setFormData({
														...formData,
														payInfoRoutingNum:
															e.target.value,
													})
												}
												placeholder='e.g., 110000000'
											/>
										</div>
									</>
								)}

								{/* Link User Account (??) */}
								{/* You might need a separate mechanism to find/link user IDs */}
								{/* <div className='form-group'>
									<label htmlFor="userId">User Account ID (Optional)</label>
									<input id="userId" type='text' value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} />
								</div> */}
							</div>

							<div className='form-actions'>
								<Button
									type='button'
									onClick={handleCancel}
									variant='outline'
								>
									Cancel
								</Button>
								<Button
									type='submit'
									className='btn-green'
								>
									<Save size={18} />{' '}
									{editingId ? 'Update' : 'Create'} Employee
								</Button>
							</div>
						</form>
					</div>
				)}
			</div>

			<div className='employees-list'>
				<h2>All Employees</h2>
				{employees.length === 0 ? (
					<p className='no-employees'>No employees found.</p>
				) : (
					<div className='employees-grid'>
						{employees.map((emp) => (
							<div
								key={emp.employeeId}
								className='employee-card'
							>
								<div className='employee-header'>
									<div>
										<h3>
											{emp.firstName} {emp.lastName}
										</h3>
										<span>{emp.jobTitle}</span>
									</div>
									<div className='employee-actions'>
										<span
											className={`status-badge ${emp.terminationDate ? 'terminated' : 'active'}`}
										>
											{emp.terminationDate ? (
												<CalendarOff size={14} />
											) : (
												<Briefcase size={14} />
											)}
											{emp.terminationDate
												? 'Terminated'
												: 'Active'}
										</span>
										<Button
											onClick={() => handleEdit(emp)}
											className='btn-icon'
											aria-label={`Edit ${emp.firstName}`}
										>
											{' '}
											<Edit2 size={16} />{' '}
										</Button>
									</div>
								</div>

								<div className='employee-info'>
									<strong>Access:</strong>
									<p>{emp.accessLevel}</p>
									<strong>Phone:</strong>
									<p>{emp.phone}</p>

									<strong>Business:</strong>
									<p>
										{businesses.find(
											(b) =>
												b.businessId === emp.businessId
										)?.name || 'N/A'}
									</p>

									<strong>Supervisor:</strong>
									<p>
										{employees.find(
											(sup) =>
												sup.employeeId ===
												emp.supervisorId
										)
											? `${employees.find((sup) => sup.employeeId === emp.supervisorId).firstName} ${employees.find((sup) => sup.employeeId === emp.supervisorId).lastName}`
											: 'None'}
									</p>
									<strong>Hire Date:</strong>
									<p>{formatDateForInput(emp.hireDate)}</p>
									{emp.terminationDate && (
										<>
											<strong>Term. Date:</strong>
											<p className='termination-date-info'>
												{formatDateForInput(
													emp.terminationDate
												)}
											</p>
										</>
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
