import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router';
import { RouterProvider } from './context/routerContext';
import { Toast } from './components/toast/toast';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<RouterProvider>
			<Router />
			<Toast />
		</RouterProvider>
	</StrictMode>
);
