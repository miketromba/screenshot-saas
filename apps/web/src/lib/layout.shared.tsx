import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { LogoMark } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<div className="flex items-center gap-2">
					<LogoMark size="sm" />
					<span className="font-medium">ScreenshotAPI</span>
				</div>
			),
			children: <ThemeToggle />
		},
		themeSwitch: { enabled: false }
	}
}
