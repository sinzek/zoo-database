import PropTypes from 'prop-types';
import { Loader } from './loader/loader';

/**
 * @param {{ variant: 'lgreen' | 'brown' | 'green' | 'outline'; size: 'sm' | 'lg'; loading?: boolean; disabled?: boolean; className?: string; children: ReactNode; ...props }} param0
 */
export function Button({
	variant = 'lgreen',
	size = 'lg',
	loading = false,
	disabled = false,
	className = '',
	children,
	...props
}) {
	const variantClasses = {
		lgreen: 'btn-lgreen',
		brown: 'btn-brown',
		green: 'btn-green',
		outline: 'btn-outline',
	};

	const sizeClasses = {
		sm: 'btn-sm',
		lg: 'btn-lg',
	};

	const classes =
		`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

	return (
		<button
			type='button'
			{...props}
			disabled={loading || disabled}
			className={classes}
		>
			{loading ? (
				<>
					<Loader />
					Loading...
				</>
			) : (
				children
			)}
		</button>
	);
}

Button.propTypes = {
	variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	className: PropTypes.string,
	children: PropTypes.node,
};
