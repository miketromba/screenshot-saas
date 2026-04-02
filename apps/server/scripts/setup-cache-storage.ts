/**
 * Sets up the Supabase Storage bucket for screenshot caching.
 * Run with: bun scripts/setup-cache-storage.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'screenshot-cache'

function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		console.error(`Missing required env var: ${name}`)
		process.exit(1)
	}
	return value
}

async function main() {
	const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
	const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

	console.log(`Connecting to Supabase: ${supabaseUrl}`)
	const supabase = createClient(supabaseUrl, serviceRoleKey)

	console.log(`\nChecking if bucket "${BUCKET_NAME}" exists...`)
	const { data: buckets, error: listError } =
		await supabase.storage.listBuckets()

	if (listError) {
		console.error('Failed to list buckets:', listError.message)
		process.exit(1)
	}

	const exists = buckets?.some(b => b.name === BUCKET_NAME)

	if (exists) {
		console.log(`Bucket "${BUCKET_NAME}" already exists.`)
	} else {
		console.log(`Creating bucket "${BUCKET_NAME}"...`)
		const { error: createError } = await supabase.storage.createBucket(
			BUCKET_NAME,
			{
				public: false,
				fileSizeLimit: 10 * 1024 * 1024,
				allowedMimeTypes: [
					'image/png',
					'image/jpeg',
					'image/webp',
					'application/pdf'
				]
			}
		)

		if (createError) {
			console.error('Failed to create bucket:', createError.message)
			process.exit(1)
		}

		console.log(`Bucket "${BUCKET_NAME}" created successfully.`)
	}

	console.log('\nVerifying bucket access...')
	const { data: files, error: verifyError } = await supabase.storage
		.from(BUCKET_NAME)
		.list('', { limit: 1 })

	if (verifyError) {
		console.error('Bucket verification failed:', verifyError.message)
		process.exit(1)
	}

	console.log(`Bucket accessible. Current files: ${files?.length ?? 0}`)

	console.log('\n--- Environment Checklist ---')
	const checks = [
		['NEXT_PUBLIC_SUPABASE_URL', !!process.env.NEXT_PUBLIC_SUPABASE_URL],
		['SUPABASE_SERVICE_ROLE_KEY', !!process.env.SUPABASE_SERVICE_ROLE_KEY],
		['CACHE_CLEANUP_SECRET', !!process.env.CACHE_CLEANUP_SECRET],
		['DATABASE_URL', !!process.env.DATABASE_URL]
	] as const

	for (const [name, present] of checks) {
		console.log(`  ${present ? '✓' : '✗'} ${name}`)
	}

	const missing = checks.filter(([, present]) => !present)
	if (missing.length > 0) {
		console.log(
			`\n⚠ ${missing.length} env var(s) missing. Set them before deploying.`
		)
	} else {
		console.log('\n✓ All required env vars are set.')
	}

	console.log('\n--- Next Steps ---')
	console.log('1. Run `bun db:migrate` to apply the schema migration')
	console.log(
		'2. Set CACHE_CLEANUP_SECRET and wire POST /api/cache/cleanup to a daily cron'
	)
	console.log('3. Deploy')
}

main()
