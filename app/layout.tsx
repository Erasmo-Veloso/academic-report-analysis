import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatProvider } from '@/lib/chat-context'
import { ChatSidebar } from '@/components/chat-sidebar'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Analisador de Relatórios Acadêmicos',
  description: 'Análise de relatórios acadêmicos com inteligência artificial - Feedback detalhado, configurações únicas e suporte para PDF, DOCX e TXT',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ChatProvider>
          <div className="flex h-screen bg-background">
            <ChatSidebar />
            {children}
          </div>
        </ChatProvider>
        <Analytics />
      </body>
    </html>
  )
}
