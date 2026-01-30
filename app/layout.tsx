import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/env-validation' // Validate environment variables on startup

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Peggy Portfolio | YouTuber & Artist',
  description: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai!',
  keywords: ['Peggy', 'YouTuber', 'Artist', 'Content Creator', 'Digital Art'],
  authors: [{ name: 'Peggy' }],
  openGraph: {
    title: 'Peggy Portfolio | YouTuber & Artist',
    description: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai!',
    url: 'https://peggy-portfolio.vercel.app',
    siteName: 'Peggy Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Peggy Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peggy Portfolio | YouTuber & Artist',
    description: 'Creative YouTuber aur Artist jo apne art se duniya ko inspire karti hai!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}





