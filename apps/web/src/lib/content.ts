import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface ContentFrontmatter {
	title: string
	description: string
	lastUpdated: string
	breadcrumbs: { label: string; href?: string }[]
	faq?: { question: string; answer: string }[]
	relatedPages?: { title: string; description: string; href: string }[]
	jsonLd?: Record<string, unknown>
}

export interface ContentPage {
	slug: string
	frontmatter: ContentFrontmatter
	content: string
}

const contentRoot = path.join(process.cwd(), 'content')

export function getContentPage(
	section: string,
	slug: string
): ContentPage | null {
	const mdxPath = path.join(contentRoot, section, `${slug}.mdx`)
	const mdPath = path.join(contentRoot, section, `${slug}.md`)
	const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath
	if (!fs.existsSync(filePath)) return null

	const raw = fs.readFileSync(filePath, 'utf-8')
	const { data, content } = matter(raw)

	return {
		slug,
		frontmatter: data as ContentFrontmatter,
		content
	}
}

export function getAllContentPages(section: string): ContentPage[] {
	const dir = path.join(contentRoot, section)
	if (!fs.existsSync(dir)) return []

	return fs
		.readdirSync(dir)
		.filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
		.map(f => {
			const slug = f.replace(/\.mdx?$/, '')
			return getContentPage(section, slug)
		})
		.filter((p): p is ContentPage => p !== null)
		.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
}

export function getAllSlugs(section: string): string[] {
	const dir = path.join(contentRoot, section)
	if (!fs.existsSync(dir)) return []

	return fs
		.readdirSync(dir)
		.filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
		.map(f => f.replace(/\.mdx?$/, ''))
}
