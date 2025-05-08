/* --------------------------------------------------------------------------
   app/layout.tsx  –  root layout for every page
   Tailwind base styles come from globals.css
   Inter font is loaded safely; if it fails, we fall back to system sans.
--------------------------------------------------------------------------- */

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/components/auth/AuthProvider';
import VoiceAssistant from '@/components/VoiceAssistant';
import VoiceActionProvider from '@/components/voice/VoiceActionProvider';

/* Load the Inter font.
   On a cold start Next returns an object with `className`.
   In case something goes wrong, we fall back to an empty string
   so `undefined` is never accessed.
*/
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const fontClass = inter?.className ?? '';

export const metadata: Metadata = {
  title: 'Auro – Your AI Laundry Assistant',
  description: 'Smart laundry management powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* If the markup differs between SSR and CSR, ignore the mismatch. */}
      <body
        suppressHydrationWarning
        className={`${fontClass} bg-white text-black antialiased`}
      >
        <AuthProvider>
          <VoiceActionProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ml-20">{children}</main>
            </div>
            <VoiceAssistant />
          </VoiceActionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}