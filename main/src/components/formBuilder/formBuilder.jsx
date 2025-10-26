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
 * @param {{ fields: Array<{ name: string; label: string; type: string; placeholder: string; autoComplete: string; }>; formData: object; setFormData: (formData: object) => void; }} param0
 * @returns
 */
export function FormBuilder({ fields, formData, setFormData }) {
	return (
		<div className='form'>
			{fields.map((field) => (
				<div
					className='form-group'
					key={`form-group-${field.name}-${field.placeholder}`}
				>
					{field.label && (
						<label htmlFor={field.name}>{field.label}</label>
					)}

					<input
						id={field.name}
						type={field.type || 'text'}
						placeholder={field.placeholder}
						value={formData[field.name]}
						onChange={(e) =>
							setFormData({
								...formData,
								[field.name]: e.target.value,
							})
						}
						autoComplete={field.autoComplete}
					/>
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
};
