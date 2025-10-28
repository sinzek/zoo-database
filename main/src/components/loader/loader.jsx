import { cn } from '../../utils/cn';
import './loader.css';
import { LoaderCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export function Loader({ className, style }) {
	return (
		<LoaderCircle
			className={cn('loader', className)}
			style={style}
		/>
	);
}

Loader.propTypes = {
	className: PropTypes.string,
	style: PropTypes.object,
};
