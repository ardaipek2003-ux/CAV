import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'CAV Farming Technologies — Cultura Ad Verticem',
  description:
    'Order fresh lettuce and tomatoes grown by CAV Farming Technologies. Track your plants in real-time across 10,000 modules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased bg-[#0A0D14] text-gray-100 min-h-screen selection:bg-emerald-500/30`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
