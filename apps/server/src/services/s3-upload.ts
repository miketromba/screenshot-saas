import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export interface S3UploadConfig {
	accessKeyId: string
	secretAccessKey: string
	region: string
	bucket: string
	path?: string
}

export async function uploadToS3({
	config,
	buffer,
	contentType,
	filename
}: {
	config: S3UploadConfig
	buffer: Buffer
	contentType: string
	filename: string
}): Promise<{ url: string; key: string }> {
	const client = new S3Client({
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		}
	})

	const key = config.path ? `${config.path}/${filename}` : filename

	await client.send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType,
			CacheControl: 'public, max-age=31536000'
		})
	)

	const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`
	return { url, key }
}
