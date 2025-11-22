// ...existing code...
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../../utils/client-api-utils';
import { showToast } from '../../../components/toast/showToast';
import { Button } from '../../../components/button';
import { Loader } from '../../../components/loader/loader';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import PropTypes from 'prop-types';

export function InventoryManagementPage({ businessId }) {
	// businessId used to fetch and manage inventory for the specific business
	const [business, setBusiness] = useState(null);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		uiPhotoUrl: '',
	});

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		[]
	);

	useEffect(() => {
		if (businessId) loadItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [businessId]);

	const loadItems = async () => {
		setLoading(true);
		try {
			const res = await api('/api/item/get-n-by-business', 'POST', {
				businessId,
			});
			if (res.success) {
				setItems(res.data.items || []);
				setBusiness(res.data.business || null);
			} else {
				setItems([]);
				showToast(res.error || 'Failed to load items');
			}
		} catch (e) {
			console.error('Failed to load items', e);
			showToast(e?.message || 'Failed to load items');
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	const openCreateForm = () => {
		setEditingItem(null);
		setFormData({ name: '', description: '', price: '', uiPhotoUrl: '' });
		setShowForm(true);
	};

	const openEditForm = (item) => {
		setEditingItem(item);
		setFormData({
			name: item.name || '',
			description: item.description || '',
			price: item.price?.toString() ?? '',
			uiPhotoUrl: item.uiPhotoUrl || '',
		});
		setShowForm(true);
	};

	const closeForm = () => {
		setShowForm(false);
		setEditingItem(null);
	};

	const handleInput = (e) => {
		const { name, value } = e.target;
		setFormData((p) => ({ ...p, [name]: value }));
	};

	const handleSave = async (e) => {
		e?.preventDefault();
		// basic validation
		if (!formData.name || formData.name.trim() === '') {
			showToast('Please provide a name for the item');
			return;
		}
		const priceNum = Number(formData.price);
		if (Number.isNaN(priceNum) || priceNum < 0) {
			showToast('Please provide a valid non-negative price');
			return;
		}

		setSaving(true);
		try {
			let res;
			if (editingItem) {
				// update
				res = await api('/api/item/update', 'POST', {
					itemId: editingItem.itemId,
					name: formData.name.trim(),
					description: formData.description || null,
					price: priceNum,
					uiPhotoUrl: formData.uiPhotoUrl || null,
					businessId,
				});
			} else {
				// create
				res = await api('/api/item/create', 'POST', {
					name: formData.name.trim(),
					description: formData.description || null,
					price: priceNum,
					uiPhotoUrl: formData.uiPhotoUrl || null,
					businessId,
				});
			}

			if (res.success) {
				showToast(
					editingItem
						? 'Item updated successfully'
						: 'Item created successfully'
				);
				closeForm();
				await loadItems();
			} else {
				showToast(res.error || 'Failed to save item');
			}
		} catch (err) {
			console.error('Save error', err);
			showToast(err?.message || 'Failed to save item');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (itemId) => {
		if (!window.confirm('Delete this item?')) return;
		setLoading(true);
		try {
			const res = await api('/api/item/delete', 'POST', { itemId });
			if (res.success) {
				showToast('Item deleted');
				await loadItems();
			} else {
				showToast(res.error || 'Failed to delete item');
			}
		} catch (e) {
			console.error('Delete error', e);
			showToast(e?.message || 'Failed to delete item');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className='page inventory-management-page'
			style={{
				paddingLeft: 36,
				paddingRight: 36,
				paddingTop: 24,
				paddingBottom: 24,
			}}
		>
			<header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 18,
				}}
			>
				<h1 style={{ margin: 0, color: 'var(--color-lgreen)' }}>
					Items sold by {business ? business.name : 'Business'}
				</h1>
				<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
					<p style={{ color: 'var(--color-lgreen)' }}>
						Total Items: {items.length}
					</p>
					<Button
						variant='green'
						onClick={openCreateForm}
						size='sm'
					>
						Add Item
					</Button>
				</div>
			</header>

			{loading ? (
				<div className='centered-loader'>
					<Loader />
				</div>
			) : items.length === 0 || !items ? (
				<p>No items found for this business.</p>
			) : (
				<div style={{ display: 'grid', gap: 12 }}>
					{items.map((item) => (
						<div
							key={item.itemId}
							style={{
								display: 'flex',
								gap: 12,
								padding: 12,
								borderRadius: 12,
								background: 'var(--color-brown)',
								alignItems: 'center',
							}}
						>
							{item.uiPhotoUrl && (
								<img
									src={item.uiPhotoUrl}
									alt={item.name}
									style={{
										width: 96,
										height: 72,
										objectFit: 'cover',
										borderRadius: 8,
									}}
								/>
							)}
							<div style={{ flex: 1 }}>
								<h3
									style={{
										margin: 0,
										color: 'var(--color-lgreen)',
									}}
								>
									{item.name}
								</h3>
								<p
									style={{
										margin: '6px 0 0',
										color: 'var(--color-lbrown)',
									}}
								>
									{item.description}
								</p>
							</div>
							<div
								style={{ textAlign: 'right', marginRight: 12 }}
							>
								<div
									style={{
										fontWeight: 700,
										color: 'var(--color-green)',
									}}
								>
									{currencyFormatter.format(
										Number(item.price || 0)
									)}
								</div>
							</div>
							<div style={{ display: 'flex', gap: 6 }}>
								<Button
									variant='green'
									size='sm'
									onClick={() => openEditForm(item)}
									aria-label='Edit item'
								>
									<Edit2 size={14} />
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handleDelete(item.itemId)}
									aria-label='Delete item'
								>
									<Trash2 size={14} />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{showForm && (
				<div
					className='modal-backdrop'
					style={{ marginTop: '2rem' }}
				>
					<div className='modal-content'>
						<h2 style={{ marginTop: 0 }}>
							{editingItem ? 'Edit Item' : 'Create Item'}
						</h2>
						<form
							onSubmit={handleSave}
							style={{
								display: 'grid',
								gap: 12,
								gridTemplateColumns: '1fr',
								maxWidth: '400px',
								marginLeft: 'auto',
								marginRight: 'auto',
							}}
						>
							<label className='form-group'>
								Name
								<input
									name='name'
									value={formData.name}
									onChange={handleInput}
									required
								/>
							</label>
							<label
								style={{
									display: 'flex',
									flexDirection: 'column',
								}}
								className='form-group'
							>
								Description
								<textarea
									className='description-textarea'
									name='description'
									value={formData.description}
									onChange={handleInput}
									style={{ width: '100%' }}
								/>
							</label>
							<label className='form-group'>
								Price (USD)
								<input
									name='price'
									type='number'
									min='0'
									step='0.01'
									value={formData.price}
									onChange={handleInput}
									required
								/>
							</label>
							<label className='form-group'>
								Image URL
								<input
									name='uiPhotoUrl'
									value={formData.uiPhotoUrl}
									onChange={handleInput}
									placeholder='https://...'
								/>
							</label>

							<div
								className='form-buttons'
								style={{
									display: 'flex',
									gap: 8,
									justifyContent: 'flex-end',
								}}
							>
								<Button
									variant='outline'
									onClick={closeForm}
								>
									<X size={14} /> Cancel
								</Button>
								<Button
									type='submit'
									variant='green'
									disabled={saving}
								>
									{saving
										? 'Saving...'
										: editingItem
											? 'Save'
											: 'Create'}{' '}
									<Save size={14} />
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

InventoryManagementPage.propTypes = {
	businessId: PropTypes.string.isRequired,
};
