import '../css/app.css';
import './Pages/Sijamu/globals.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from './context/AuthContext';
import { RpsProvider } from './context/RpsContext';
import { PeriodProvider } from './context/PeriodContext';
import { MutuProvider } from './context/MutuContext';
import { EvaluationProvider } from './context/EvaluationContext';
import { UploadConfigProvider } from './context/UploadConfigContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialUser = props.initialPage.props.auth?.user || null;

        root.render(
            <AuthProvider initialUser={initialUser}>
                <PeriodProvider>
                    <RpsProvider>
                        <UploadConfigProvider>
                            <MutuProvider>
                                <EvaluationProvider>
                                    <App {...props} />
                                </EvaluationProvider>
                            </MutuProvider>
                        </UploadConfigProvider>
                    </RpsProvider>
                </PeriodProvider>
            </AuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
