import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './router';
import { RouterProvider } from './context/routerContext';
import { Toast } from './components/toast/toast';
import { UserDataProvider } from './context/userDataContext';
import { AccessWrapper } from './components/accessWrapper';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<RouterProvider>
			<UserDataProvider>
				<AccessWrapper>
					<Router />
				</AccessWrapper>
			</UserDataProvider>
			<Toast />
		</RouterProvider>
	</StrictMode>
);
