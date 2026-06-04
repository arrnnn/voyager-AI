import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import '../styles/globals.css';

export const metadata = {
  title: 'Voyager AI — Luxury Travel Planner',
  description: 'Generate personalized travel plans with AI in seconds',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="min-h-screen text-white" style={{ fontFamily: 'var(--font-body)' }}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}