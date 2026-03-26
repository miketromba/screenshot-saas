'use client'

import {
	BarChart3,
	Coins,
	CreditCard,
	Key,
	LayoutDashboard,
	LogOut,
	Menu,
	Play,
	Settings,
	X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogoIcon } from '@/components/logo'
import { useUser } from '@/hooks/use-queries'
import { createClient } from '@/lib/supabase/client'

const navigation = [
	{ name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
	{ name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
	{ name: 'Credits', href: '/dashboard/credits', icon: Coins },
	{ name: 'Usage', href: '/dashboard/usage', icon: BarChart3 },
	{ name: 'Playground', href: '/dashboard/playground', icon: Play },
	{ name: 'Settings', href: '/dashboard/settings', icon: Settings }
]

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const router = useRouter()
	const { data: user } = useUser()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [signingOut, setSigningOut] = useState(false)

	function isActive(href: string) {
		if (href === '/dashboard') return pathname === '/dashboard'
		return pathname.startsWith(href)
	}

	async function handleSignOut() {
		setSigningOut(true)
		const supabase = createClient()
		await supabase.auth.signOut()
		router.push('/sign-in')
	}

	const sidebarContent = (
		<>
			<div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-white">
					<LogoIcon className="h-4 w-4" />
				</div>
				<span className="text-sm font-medium">ScreenshotAPI</span>
			</div>

			<nav className="flex-1 space-y-1 px-3 py-4">
				{navigation.map(item => {
					const active = isActive(item.href)
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setSidebarOpen(false)}
							className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
								active
									? 'bg-sidebar-accent text-sidebar-accent-foreground'
									: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
							}`}
						>
							<item.icon className="h-4 w-4 shrink-0" />
							{item.name}
						</Link>
					)
				})}
			</nav>

			<div className="border-t border-sidebar-border p-3">
				<div className="flex items-center gap-3 rounded-lg px-3 py-2">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium uppercase text-sidebar-accent-foreground">
						{user?.email?.[0] ?? '?'}
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">
							{user?.email ?? '...'}
						</p>
					</div>
					<button
						type="button"
						onClick={handleSignOut}
						disabled={signingOut}
						className="cursor-pointer rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50"
						title="Sign out"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>
		</>
	)

	return (
		<div className="flex h-screen bg-background">
			<aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
				{sidebarContent}
			</aside>

			{sidebarOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="fixed inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setSidebarOpen(false)}
						onKeyDown={e => {
							if (e.key === 'Escape') setSidebarOpen(false)
						}}
					/>
					<aside className="fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col bg-sidebar shadow-xl">
						<div className="absolute right-2 top-2">
							<button
								type="button"
								onClick={() => setSidebarOpen(false)}
								className="cursor-pointer rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						{sidebarContent}
					</aside>
				</div>
			)}

			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="cursor-pointer rounded-md p-1.5 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
					>
						<Menu className="h-5 w-5" />
					</button>
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-white">
							<LogoIcon className="h-3.5 w-3.5" />
						</div>
						<span className="text-sm font-medium">
							ScreenshotAPI
						</span>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	)
}
