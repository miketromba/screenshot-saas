import { llms } from 'fumadocs-core/source'
import { source } from '@/lib/source'

export const revalidate = false

export function GET() {
	const content = `# ScreenshotAPI

> ScreenshotAPI is a fast, reliable API for capturing web page screenshots on demand. Send a URL, get back an image — PNG, JPEG, or WebP.

Docs: https://screenshotapi.to/docs
Full docs for LLMs: https://screenshotapi.to/llms-full.txt
Full docs (alt): https://screenshotapi.to/docs/llms.txt
Individual page markdown: append .md to any /docs/* URL

## Documentation

${llms(source).index()}
`

	return new Response(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
