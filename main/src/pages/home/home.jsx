import { ArrowUpRight, GithubIcon } from 'lucide-react';
import { Link } from '../../components/link';
import { BackgroundDots } from './components/backgroundDots';
import './home.css';

export default function HomePage() {
	return (
		<div className='page'>
			<div className='hero-container'>
				<BackgroundDots />
				<img
					className='hero-image'
					src='/images/hero-image.webp'
					alt='Zoo Hero'
				/>
				<h4 className='hero-pre-text'>Ya like animals?</h4>
				<h1 className='hero-main-text'>The Zoo™</h1>
				<p className='hero-sub-text'>
					Created by Team 10 for Professor Uma&apos;s COSC 3380
					Database Systems class at the University of Houston
				</p>
				<div className='hero-btn-list'>
					<Link
						to='/animals'
						className='btn btn-green btn-lg'
					>
						Animals
					</Link>
					<Link
						to='/habitats'
						className='btn btn-outline btn-lg'
					>
						Habitats
					</Link>
					<a
						href='https://github.com/sinzek/zoo-database'
						className='btn btn-green btn-lg'
						target='_blank'
						rel='noopener noreferrer'
					>
						<GithubIcon />
						Source Code <ArrowUpRight />
					</a>
				</div>
			</div>
			<div className='section light-bg'>
				<h1>About The Zoo™</h1>
				<p>
					The Zoo™ is a fictional zoo management system created as a
					project for a database systems class. It allows users to
					explore various animals, habitats, and attractions within
					the zoo, employees to take shifts and manage their animals,
					administrators to oversee everything, and etc.
				</p>
			</div>
		</div>
	);
}
