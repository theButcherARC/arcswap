import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/lib/providers';
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TAGLINE,
} from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VibeFlow - USDC Batch Payments on Arc',
    template: '%s | VibeFlow',
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: SITE_NAME,
    title: 'VibeFlow - USDC Batch Payments on Arc',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeFlow - USDC Batch Payments on Arc',
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What does VibeFlow cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A flat 0.2% protocol fee per batch, minimum $0.01. No subscription, no per-seat pricing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which wallet and network do I need?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MetaMask with USDC or EURC on Arc. The app auto-switches you to Arc Mainnet.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many people can I pay at once?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Up to 100 recipients in a single batch, settled with one signature and zero token approvals.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I keep custody of my funds?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. VibeFlow is non-custodial: you sign every batch from your own wallet.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} bg-[var(--bg)]`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
