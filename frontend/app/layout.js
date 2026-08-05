import { Sora, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import Navbar from '../components/Navbar';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata = {
  title: 'Scholario',
  description: 'Assignment & Submission Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
