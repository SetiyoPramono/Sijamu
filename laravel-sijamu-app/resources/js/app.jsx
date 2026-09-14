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

const defaultAppName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        const settings = window.APP_SETTINGS || {};
        const instName = settings.institution_name || defaultAppName;
        const slogan = settings.institution_slogan || '';
        const suffix = slogan ? `${instName} | ${slogan}` : instName;
        return `${title} - ${suffix}`;
    },
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialUser = props.initialPage.props.auth?.user || null;
        const appSettings = props.initialPage.props.appSettings || {};
        
        // Expose settings globally for the title callback
        window.APP_SETTINGS = appSettings;

        // Update favicon dynamically
        if (appSettings.institution_logo) {
            let favicon = document.querySelector("link[rel~='icon']");
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = appSettings.institution_logo;
        }

        // Apply global CSS variables
        const globalStyle = {
            '--color-primary': appSettings.primary_color || '#057A55',
        };

        root.render(
            <div style={globalStyle} className="h-full w-full">
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
            </div>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
