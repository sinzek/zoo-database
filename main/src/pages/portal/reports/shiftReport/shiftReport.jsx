/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { useUserData } from '../../../../context/userDataContext';
import { hasMinAccessLvl } from '../../../../utils/access';
import { api } from '../../../../utils/client-api-utils';
import { showToast } from '../../../../components/toast/showToast';
import { Loader } from '../../../../components/loader/loader';
import { Button } from '../../../../components/button';
import './shiftReport.css';
import { ArrowRight } from 'lucide-react';

export function ShiftReportPage() {
	const { userEntityData } = useUserData();
	const isManager = hasMinAccessLvl('manager', userEntityData);
	const isExecutive = hasMinAccessLvl('manager', userEntityData);

	const [businesses, setBusinesses] = useState([]);
	const [employees, setEmployees] = useState([]);

	const [fetchingEmployees, setFetchingEmployees] = useState(false);

	const [businessId, setBusinessId] = useState('');
	const [employeeIds, setEmployeeIds] = useState([]);
	const [startDate, setStartDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 7);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
			.toISOString()
			.slice(0, 16); // yyyy-MM-ddTHH:mm for datetime-local
	});
	const [endDate, setEndDate] = useState(() => {
		const d = new Date();
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
			.toISOString()
			.slice(0, 16);
	});

	const [loading, setLoading] = useState(false);
	const [reportType, setReportType] = useState('full'); // 'full' | 'summary' | 'aggregated'
	const [reportData, setReportData] = useState(null);

	useEffect(() => {
		let ignore = false;
		(async () => {
			const res = await api('/api/business/get-all', 'POST');
			if (!res.success) {
				showToast(
					`Failed to load businesses: ${res.error || 'Unknown error'}`
				);
				return;
			}
			if (!ignore) setBusinesses(res.data || []);
		})();
		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		let ignore = false;
		setEmployees([]);
		setEmployeeIds([]);
		if (!businessId) return;
		(async () => {
			setFetchingEmployees(true);
			const res = await api('/api/employee/get-n-by-business', 'POST', {
				businessId,
			});
			if (!res.success) {
				showToast(
					`Failed to load employees: ${res.error || 'Unknown error'}`
				);
				setFetchingEmployees(false);
				return;
			}
			if (!ignore) setEmployees(res.data || []);
			setFetchingEmployees(false);
		})();
		return () => {
			ignore = true;
		};
	}, [businessId]);

	const selectedBusiness = useMemo(
		() => businesses.find((b) => b.businessId === businessId),
		[businessId, businesses]
	);

	const formatCurrency = (v) =>
		typeof v === 'number'
			? v.toLocaleString(undefined, {
					style: 'currency',
					currency: 'USD',
				})
			: '-';

	const formatDateTime = (iso) =>
		iso
			? new Date(iso).toLocaleString([], {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				})
			: '-';

	const sumHours = (shifts) =>
		shifts.reduce(
			(acc, s) => acc + (parseFloat(s.employee?.totalHours) || 0),
			0
		);

	const sumLaborCost = (shifts) =>
		shifts.reduce((acc, s) => {
			const hrs = parseFloat(s.employee?.totalHours) || 0;
			const rate = parseFloat(s.employee?.hourlyWage) || 0;
			return acc + hrs * rate;
		}, 0);

	const uniqueEmployeeCount = (shifts) =>
		new Set(shifts.map((s) => s.employee?.employeeId)).size;

	const payload = useMemo(() => {
		const p = {};
		if (businessId) p.businessId = businessId;
		if (employeeIds?.length) p.employeeIds = employeeIds;
		if (startDate) p.startDate = new Date(startDate).toISOString();
		if (endDate) p.endDate = new Date(endDate).toISOString();
		return p;
	}, [businessId, employeeIds, startDate, endDate]);

	const generateReport = async (type) => {
		if (!isManager) {
			showToast('You do not have permission to generate reports.');
			return;
		}
		if (type === 'aggregated' && !isExecutive) {
			showToast('Aggregated report requires executive access.');
			return;
		}

		setReportType(type);
		setReportData(null);
		setLoading(true);
		try {
			const endpoint =
				type === 'full'
					? '/api/reports/shift/full'
					: type === 'summary'
						? '/api/reports/shift/summary'
						: '/api/reports/shift/aggregated';

			const res = await api(endpoint, 'POST', payload);
			if (!res.success) {
				showToast(
					`Failed to generate report: ${res.error || 'Unknown error'}`
				);
				return;
			}
			setReportData(res.data);
		} catch (e) {
			showToast(`Error generating report: ${e.message || e.toString()}`);
		} finally {
			setLoading(false);
		}
	};

	const isEmpSelected = (empId) => {
		return employeeIds.includes(empId);
	};

	const Filters = () => (
		<div
			style={{
				display: 'grid',
				gap: 16,
				gridTemplateColumns: 'repeat(12, 1fr)',
				alignItems: 'start',
				background: 'var(--color-brown)',
				border: '1px solid var(--color-lbrown)',
				borderRadius: 12,
				padding: 16,
			}}
		>
			<div style={{ gridColumn: 'span 4' }}>
				<label className='label'>Business</label>
				<select
					className='input'
					value={businessId}
					onChange={(e) => setBusinessId(e.target.value)}
				>
					<option value=''>All Businesses</option>
					{businesses.map((b) => (
						<option
							key={b.businessId}
							value={b.businessId}
						>
							{b.name} ({b.type})
						</option>
					))}
				</select>
			</div>

			<div style={{ gridColumn: 'span 4' }}>
				<label className='label'>
					Employees {businessId ? '' : '(select a business)'}
					{businessId && employees.length > 0 && (
						<span style={{ marginLeft: 8, fontSize: 12 }}>
							<button
								type='button'
								onClick={() =>
									setEmployeeIds(
										employees.map((x) => x.employeeId)
									)
								}
								style={{
									background: 'transparent',
									color: 'var(--color-green)',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
									marginRight: 8,
								}}
							>
								Select all
							</button>
							<button
								type='button'
								onClick={() => setEmployeeIds([])}
								style={{
									background: 'transparent',
									color: 'var(--color-lgreen)',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}
							>
								Clear
							</button>
						</span>
					)}
				</label>
				<select
					multiple
					className='input'
					disabled={!businessId}
					value={employeeIds}
					// keep onChange for keyboard accessibility (Shift/Arrow selection)
					onChange={(e) => {
						if (!e.target.options) return;
						const selectedOptions = Array.from(e.target.options);
						const selectedValues = selectedOptions
							.filter((option) => option.selected)
							.map((option) => option.value);
						setEmployeeIds(selectedValues);
					}}
					// show several rows to make selection easier
					size={Math.min(10, Math.max(6, employees.length))}
					style={{ minHeight: 120 }}
				>
					{!fetchingEmployees &&
						employees.map((emp) => (
							<option
								key={emp.employeeId}
								value={emp.employeeId}
								// Enable single-click toggle without Cmd/Ctrl
								onMouseDown={(ev) => {
									ev.preventDefault(); // prevents native selection change
									setEmployeeIds((prev) =>
										prev.includes(emp.employeeId)
											? prev.filter(
													(id) =>
														id !== emp.employeeId
												)
											: [...prev, emp.employeeId]
									);
								}}
								style={{
									fontWeight: isEmpSelected(emp.employeeId)
										? 'bold'
										: 'normal',
								}}
							>
								{emp.firstName} {emp.lastName} — {emp.jobTitle}
							</option>
						))}
					{fetchingEmployees && (
						<option disabled>
							<Loader /> Loading employees...
						</option>
					)}
					{!fetchingEmployees && employees.length === 0 && (
						<option disabled>No employees found.</option>
					)}
				</select>
			</div>

			<div style={{ gridColumn: 'span 4' }}>
				<div
					style={{ display: 'flex', gap: 8, flexDirection: 'column' }}
				>
					<label className='label'>Start</label>
					<input
						type='datetime-local'
						className='input'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div
					style={{
						marginTop: '10px',
						display: 'flex',
						gap: 8,
						flexDirection: 'column',
					}}
				>
					<label className='label'>End</label>
					<input
						type='datetime-local'
						className='input'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
			</div>

			<div style={{ gridColumn: 'span 12', display: 'flex', gap: 8 }}>
				<Button
					variant='green'
					onClick={() => generateReport('full')}
					disabled={loading || !isManager}
				>
					{loading && reportType === 'full' ? <Loader /> : null} Full
					Report
				</Button>
				<Button
					variant='outline'
					onClick={() => generateReport('summary')}
					disabled={loading || !isManager}
				>
					{loading && reportType === 'summary' ? <Loader /> : null}{' '}
					Summary
				</Button>
				<Button
					variant='outline'
					onClick={() => generateReport('aggregated')}
					disabled={loading || !isExecutive}
				>
					{loading && reportType === 'aggregated' ? <Loader /> : null}{' '}
					Aggregated
				</Button>
			</div>
		</div>
	);

	const ReportMeta = () => (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 1fr)',
				gap: 12,
				marginTop: 12,
				color: 'var(--color-lgreen)',
				fontSize: 14,
			}}
		>
			<div>
				<strong>Report:</strong> {reportType}
			</div>
			<div>
				<strong>Business:</strong>{' '}
				{selectedBusiness ? selectedBusiness.name : 'All'}
			</div>
			<div>
				<strong>Employees Filtered:</strong>{' '}
				{employeeIds?.length ? employeeIds.length : 'All'}
			</div>
			<div>
				<strong>Date Range:</strong>{' '}
				{startDate
					? formatDateTime(new Date(startDate).toISOString())
					: 'Any'}{' '}
				→{' '}
				{endDate
					? formatDateTime(new Date(endDate).toISOString())
					: 'Any'}
			</div>
			<div style={{ gridColumn: 'span 4' }}>
				<strong>Ordering & Matching:</strong> Grouped by business,
				shifts ordered by start time descending; clock times matched
				within ±6 hours around shift window.
			</div>
		</div>
	);

	const FullReportView = ({ data }) => {
		if (!Array.isArray(data) || data.length === 0) {
			return <div className='centered-page'>No results.</div>;
		}
		return (
			<div style={{ display: 'grid', gap: 24 }}>
				{data.map((biz) => {
					const totalHrs = sumHours(biz.shifts);
					const totalCost = sumLaborCost(biz.shifts);
					const uniq = uniqueEmployeeCount(biz.shifts);
					return (
						<section
							key={biz.businessId}
							style={{
								border: '1px solid var(--color-lbrown)',
								borderRadius: 12,
								overflow: 'hidden',
							}}
						>
							<header
								style={{
									background: 'var(--color-brown)',
									padding: 16,
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									flexWrap: 'wrap',
									gap: 8,
								}}
							>
								<div>
									<h2 style={{ margin: 0 }}>
										{biz.businessName}
									</h2>
									<div
										style={{ color: 'var(--color-lgreen)' }}
									>
										{biz.businessType} • {biz.shifts.length}{' '}
										shifts • {uniq} employees
									</div>
								</div>
								<div style={{ textAlign: 'right' }}>
									<div>
										<strong>Total Assigned Hours:</strong>{' '}
										{totalHrs.toFixed(2)}
									</div>
									<div>
										<strong>Total Est. Labor Cost:</strong>{' '}
										{formatCurrency(totalCost)}
									</div>
								</div>
							</header>

							<div style={{ padding: 16 }}>
								<div
									style={{
										overflowX: 'auto',
										border: '1px solid var(--color-lbrown)',
										borderRadius: 8,
									}}
								>
									<table
										style={{
											width: '100%',
											borderCollapse: 'collapse',
											minWidth: 1000,
										}}
									>
										<thead>
											<tr
												style={{
													background:
														'var(--color-dbrown)',
												}}
											>
												<th
													style={{
														padding: 8,
														textAlign: 'left',
													}}
												>
													When
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'left',
													}}
												>
													Employee
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'left',
													}}
												>
													Job Title
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'right',
													}}
												>
													Rate
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'right',
													}}
												>
													Hours
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'right',
													}}
												>
													Est. Labor Cost
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'left',
													}}
												>
													Location
												</th>
												<th
													style={{
														padding: 8,
														textAlign: 'left',
													}}
												>
													Clock Times
												</th>
											</tr>
										</thead>
										<tbody>
											{biz.shifts.map((s) => {
												const hrs =
													parseFloat(
														s.employee?.totalHours
													) || 0;
												const rate =
													parseFloat(
														s.employee?.hourlyWage
													) || 0;
												const cost = hrs * rate;
												const loc = s.location
													? `${s.location.attractionName} (${s.location.attractionLocation})`
													: '—';
												return (
													<tr
														key={s.shiftId}
														style={{
															borderTop:
																'1px solid var(--color-lbrown)',
														}}
													>
														<td
															style={{
																padding: 8,
															}}
														>
															<div>
																{formatDateTime(
																	s.shiftStart
																)}
															</div>
															<div
																style={{
																	color: 'var(--color-lgreen)',
																}}
															>
																<span>
																	<ArrowRight
																		size={
																			14
																		}
																		style={{
																			verticalAlign:
																				'middle',
																		}}
																	/>
																</span>
																{formatDateTime(
																	s.shiftEnd
																)}
															</div>
														</td>
														<td
															style={{
																padding: 8,
															}}
														>
															<div>
																{
																	s.employee
																		?.firstName
																}{' '}
																{
																	s.employee
																		?.lastName
																}
															</div>
														</td>
														<td
															style={{
																padding: 8,
															}}
														>
															{
																s.employee
																	?.jobTitle
															}
														</td>
														<td
															style={{
																padding: 8,
																textAlign:
																	'right',
															}}
														>
															{formatCurrency(
																rate
															)}
														</td>
														<td
															style={{
																padding: 8,
																textAlign:
																	'right',
															}}
														>
															{hrs.toFixed(2)}
														</td>
														<td
															style={{
																padding: 8,
																textAlign:
																	'right',
															}}
														>
															{formatCurrency(
																cost
															)}
														</td>
														<td
															style={{
																padding: 8,
															}}
														>
															{loc}
														</td>
														<td
															style={{
																padding: 8,
															}}
														>
															{s.clockTimes
																?.length ? (
																<div
																	style={{
																		display:
																			'grid',
																		gap: 4,
																		fontSize: 12,
																	}}
																>
																	{s.clockTimes.map(
																		(
																			ct
																		) => (
																			<div
																				key={
																					ct.clockTimeId
																				}
																			>
																				{formatDateTime(
																					ct.clockIn
																				)}{' '}
																				→{' '}
																				{formatDateTime(
																					ct.clockOut
																				)}
																			</div>
																		)
																	)}
																</div>
															) : (
																<span
																	style={{
																		color: '#ff6b6b',
																	}}
																>
																	No clock
																	times
																	matched
																</span>
															)}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</section>
					);
				})}
			</div>
		);
	};

	const SummaryReportView = ({ data }) => {
		if (!Array.isArray(data) || data.length === 0) {
			return <div className='centered-page'>No results.</div>;
		}
		return (
			<div
				style={{
					border: '1px solid var(--color-lbrown)',
					borderRadius: 12,
					overflow: 'hidden',
				}}
			>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ background: 'var(--color-dbrown)' }}>
							<th style={{ padding: 8, textAlign: 'left' }}>
								Business
							</th>
							<th style={{ padding: 8, textAlign: 'left' }}>
								Type
							</th>
							<th style={{ padding: 8, textAlign: 'right' }}>
								Shifts
							</th>
							<th style={{ padding: 8, textAlign: 'right' }}>
								Unique Employees
							</th>
							<th style={{ padding: 8, textAlign: 'right' }}>
								Total Hours
							</th>
						</tr>
					</thead>
					<tbody>
						{data.map((r) => (
							<tr
								key={r.businessId}
								style={{
									borderTop: '1px solid var(--color-lbrown)',
								}}
							>
								<td style={{ padding: 8 }}>{r.businessName}</td>
								<td style={{ padding: 8 }}>{r.businessType}</td>
								<td style={{ padding: 8, textAlign: 'right' }}>
									{r.totalShifts}
								</td>
								<td style={{ padding: 8, textAlign: 'right' }}>
									{r.uniqueEmployees}
								</td>
								<td style={{ padding: 8, textAlign: 'right' }}>
									{Number(r.totalHours || 0).toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	const AggregatedReportView = ({ data }) => {
		if (!data || typeof data !== 'object') {
			return <div className='centered-page'>No results.</div>;
		}
		const {
			totalShifts,
			totalHours,
			totalEmployees,
			businessCount,
			businessDetails,
		} = data;
		return (
			<div style={{ display: 'grid', gap: 16 }}>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 16,
						background: 'var(--color-brown)',
						border: '1px solid var(--color-lbrown)',
						borderRadius: 12,
						padding: 16,
					}}
				>
					<div>
						<strong>Total Shifts:</strong> {totalShifts}
					</div>
					<div>
						<strong>Total Hours:</strong>{' '}
						{Number(totalHours || 0).toFixed(2)}
					</div>
					<div>
						<strong>Total Employees:</strong> {totalEmployees}
					</div>
					<div>
						<strong>Businesses:</strong> {businessCount}
					</div>
				</div>

				<div
					style={{
						border: '1px solid var(--color-lbrown)',
						borderRadius: 12,
						overflow: 'hidden',
					}}
				>
					<table
						style={{ width: '100%', borderCollapse: 'collapse' }}
					>
						<thead>
							<tr style={{ background: 'var(--color-dbrown)' }}>
								<th style={{ padding: 8, textAlign: 'left' }}>
									Business
								</th>
								<th style={{ padding: 8, textAlign: 'left' }}>
									Type
								</th>
								<th style={{ padding: 8, textAlign: 'right' }}>
									Shifts
								</th>
							</tr>
						</thead>
						<tbody>
							{(businessDetails || []).map((b) => (
								<tr
									key={b.businessId}
									style={{
										borderTop:
											'1px solid var(--color-lbrown)',
									}}
								>
									<td style={{ padding: 8 }}>
										{b.businessName}
									</td>
									<td style={{ padding: 8 }}>
										{b.businessType}
									</td>
									<td
										style={{
											padding: 8,
											textAlign: 'right',
										}}
									>
										{b.totalShifts}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	return (
		<div
			className='page shift-report-page'
			style={{
				padding: '96px 24px 48px',
				color: 'var(--color-foreground)',
			}}
		>
			<div
				style={{
					maxWidth: 1200,
					margin: '0 auto',
					display: 'grid',
					gap: 24,
				}}
			>
				<header
					style={{
						display: 'grid',
						gap: 8,
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<h1
						style={{
							margin: 0,
							fontSize: '2.25rem',
							color: 'var(--color-green)',
						}}
					>
						Shift Reports
					</h1>
					<p style={{ margin: 0, color: 'var(--color-lgreen)' }}>
						Use filters below to generate reports. Full, Aggregated,
						and Summary require manager access.
					</p>
				</header>

				<Filters />

				{loading && (
					<div
						className='centered-page'
						style={{
							display: 'flex',
							gap: 8,
							alignItems: 'center',
						}}
					>
						<Loader />
						<span>Generating report...</span>
					</div>
				)}

				{!loading && reportData && (
					<div
						style={{
							display: 'grid',
							gap: 12,
							alignItems: 'start',
							justifyContent: 'center',
						}}
					>
						<ReportMeta />
						{reportType === 'full' && (
							<FullReportView data={reportData} />
						)}
						{reportType === 'summary' && (
							<SummaryReportView data={reportData} />
						)}
						{reportType === 'aggregated' && (
							<AggregatedReportView data={reportData} />
						)}
					</div>
				)}
			</div>
		</div>
	);
}
