import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #1f2937, #030712)',
				borderRadius: 6
			}}
		>
			<svg
				width="22"
				height="22"
				viewBox="0 0 22 22"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M1 7V2.5A1.5 1.5 0 012.5 1H7"
					stroke="white"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M15 1h4.5A1.5 1.5 0 0121 2.5V7"
					stroke="white"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M21 15v4.5a1.5 1.5 0 01-1.5 1.5H15"
					stroke="white"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M7 21H2.5A1.5 1.5 0 011 19.5V15"
					stroke="white"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<circle cx="11" cy="11" r="2.5" fill="white" />
			</svg>
		</div>,
		{ ...size }
	)
}
