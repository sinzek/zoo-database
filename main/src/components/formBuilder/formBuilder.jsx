import PropTypes from 'prop-types';
import './formBuilder.css';

/*
const loginFields = [
{
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email address",
    autoComplete: "email",
},
{
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    autoComplete: "current-password",
}
];
*/

/**
 *
 * @param {{ fields: Array<{ name: string; label: string; type: string; placeholder: string; autoComplete: string; }>; formData: object; setFormData: (formData: object) => void; isEditing: boolean; }} param0
 * @returns
 */
export function FormBuilder({
	fields,
	formData,
	setFormData,
	isEditing = true,
	style,
}) {
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	return (
		<div
			className='form-builder'
			style={style}
		>
			{fields.map((field) => (
				<div
					className='form-group'
					key={field.name}
				>
					<label htmlFor={field.name}>{field.label}</label>
					{isEditing ? (
						<input
							id={field.name}
							name={field.name}
							type={field.type}
							placeholder={field.placeholder}
							value={formData[field.name] || ''}
							onChange={handleChange}
							autoComplete={field.autoComplete || 'off'}
							disabled={field.disabled}
						/>
					) : (
						<p className='form-display-text'>
							{formData[field.name] || <em>Not set</em>}
						</p>
					)}
				</div>
			))}
		</div>
	);
}

FormBuilder.propTypes = {
	fields: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			label: PropTypes.string,
			type: PropTypes.string.isRequired,
			placeholder: PropTypes.string,
			autoComplete: PropTypes.string,
		})
	).isRequired,
	formData: PropTypes.object.isRequired,
	setFormData: PropTypes.func.isRequired,
	isEditing: PropTypes.bool,
	style: PropTypes.object,
};
