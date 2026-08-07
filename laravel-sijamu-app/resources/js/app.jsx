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

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AuthProvider>
                <PeriodProvider>
                    <RpsProvider>
                        <MutuProvider>
                            <EvaluationProvider>
                                <App {...props} />
                            </EvaluationProvider>
                        </MutuProvider>
                    </RpsProvider>
                </PeriodProvider>
            </AuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
