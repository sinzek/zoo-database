import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router';
import { RouterProvider } from './context/routerContext';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<RouterProvider>
			<Router />
		</RouterProvider>
	</StrictMode>
);
