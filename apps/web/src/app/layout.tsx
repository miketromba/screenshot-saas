import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: {
		default: 'ScreenshotAPI — Website Screenshots via API',
		template: '%s | ScreenshotAPI'
	},
	description:
		'A fast, reliable API for generating web page screenshots on demand. Flexible pricing with subscriptions and pay-as-you-go credit packs. 200 free screenshots per month.',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
	)
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col">
				<RootProvider>
					<Providers>{children}</Providers>
				</RootProvider>
			</body>
		</html>
	)
}
