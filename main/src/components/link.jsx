import { useRouter } from '../context/routerContext';
import PropTypes from 'prop-types';
import { cn } from '../utils/cn';

export function Link({ to, children, className, ...props }) {
	const { navigate } = useRouter();

	return (
		<a
			href={to}
			onClick={(e) => {
				e.preventDefault();
				navigate(to);
			}}
			className={cn('link', className)}
			{...props}
		>
			{children}
		</a>
	);
}

Link.propTypes = {
	to: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};
