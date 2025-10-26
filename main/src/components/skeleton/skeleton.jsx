import PropTypes from 'prop-types';
import './skeleton.css';
import { cn } from '../../utils/cn';

export function Skeleton({ className }) {
	return <div className={cn('skeleton', className)} />;
}

Skeleton.propTypes = {
	className: PropTypes.string,
};
