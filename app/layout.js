import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LeadFly AI - Intelligent Lead Generation Platform',
  description: 'Generate high-quality leads with AI-powered automation. Scale your sales with 500+ leads per month and 80% profit margins.',
  keywords: 'lead generation, AI, sales automation, B2B leads, DropFly',
  authors: [{ name: 'DropFly Technologies' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    title: 'LeadFly AI - Intelligent Lead Generation Platform',
    description: 'Generate high-quality leads with AI-powered automation',
    url: 'https://leadflyai.com',
    siteName: 'LeadFly AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LeadFly AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadFly AI - Intelligent Lead Generation',
    description: 'Generate high-quality leads with AI-powered automation',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}