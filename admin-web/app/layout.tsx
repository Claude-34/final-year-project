import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pothole Authority Console',
  description: 'Admin dashboard for pothole detection and triage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
