import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RpsProvider } from '@/context/RpsContext';
import { PeriodProvider } from '@/context/PeriodContext';
import { MutuProvider } from '@/context/MutuContext';
import { EvaluationProvider } from '@/context/EvaluationContext';
import { UploadConfigProvider } from '@/context/UploadConfigContext';

export const metadata = {
  title: 'SIJAMU 2.0 — Sistem Penjaminan Mutu UNIPGRI Banyuwangi',
  description: 'Platform penjaminan mutu internal yang fungsional, terstruktur, dan mudah digunakan oleh seluruh civitas akademika Universitas PGRI Banyuwangi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* AuthProvider harus di luar RpsProvider agar useAuth bisa dipakai di RpsContext */}
        <AuthProvider>
          <PeriodProvider>
            <RpsProvider>
              <UploadConfigProvider>
                <MutuProvider>
                  <EvaluationProvider>
                    {children}
                  </EvaluationProvider>
                </MutuProvider>
              </UploadConfigProvider>
            </RpsProvider>
          </PeriodProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
