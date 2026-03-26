import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'AWS Lambda Screenshot API Integration — Serverless Handlers, API Gateway & S3 Storage',
	description:
		'Capture website screenshots with AWS Lambda functions in Node.js and Python. Includes API Gateway setup, S3 storage, and production deployment patterns.'
}

export default function AWSLambdaIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'AWS Lambda' }
			]}
			title="AWS Lambda Screenshot API Integration"
			description="Deploy screenshot capture as serverless Lambda functions with API Gateway for HTTP access, S3 for persistent storage, and CloudWatch for monitoring. Examples in Node.js and Python."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'AWS Lambda Screenshot API Integration',
				description:
					'How to capture website screenshots with AWS Lambda, API Gateway, and S3.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question:
						'What is the Lambda timeout limit for screenshots?',
					answer: 'Lambda supports up to 15 minutes, but screenshot capture typically completes in 2–5 seconds. Set the timeout to 30 seconds to account for slow-loading pages.'
				},
				{
					question: 'How do I store the API key in Lambda?',
					answer: 'Use AWS Systems Manager Parameter Store or Secrets Manager. Reference the secret in your Lambda environment variables. Never hardcode API keys in function code.'
				},
				{
					question:
						'Can I return the image directly from API Gateway?',
					answer: 'Yes, but API Gateway has a 10MB response limit and requires binary media type configuration. For large screenshots, upload to S3 and return a presigned URL instead.'
				},
				{
					question: 'How do I trigger screenshots on a schedule?',
					answer: 'Use EventBridge (CloudWatch Events) to invoke your Lambda on a cron schedule. This is useful for monitoring dashboards or generating daily site previews.'
				},
				{
					question:
						'Should I use Node.js or Python for the Lambda function?',
					answer: "Both work well. Node.js has slightly faster cold starts. Python is more concise for simple functions. Choose based on your team's familiarity."
				}
			]}
			relatedPages={[
				{
					title: 'Vercel Integration',
					description:
						'Simpler serverless deployment with Vercel Edge Functions.',
					href: '/integrations/vercel'
				},
				{
					title: 'Cloudflare Workers Integration',
					description:
						'Edge-deployed screenshot functions with KV and R2.',
					href: '/integrations/cloudflare-workers'
				},
				{
					title: 'GitHub Actions Integration',
					description:
						'Trigger Lambda screenshot functions from CI/CD pipelines.',
					href: '/integrations/github-actions'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Create a Lambda function that calls ScreenshotAPI and stores
					the result in S3. No browser binaries or layers needed —
					ScreenshotAPI handles the rendering.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Store API key in Parameter Store
aws ssm put-parameter \\
  --name "/screenshotapi/key" \\
  --value "sk_live_xxxxx" \\
  --type SecureString`}
					/>
				</div>
			</section>

			{/* Node.js Handler */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Node.js Lambda handler
				</h2>
				<p className="mt-3 text-muted-foreground">
					A Lambda function in Node.js that captures a screenshot and
					returns it via API Gateway, or uploads to S3 and returns a
					presigned URL.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="handler.mjs"
						code={`import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({})
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
const BUCKET = process.env.SCREENSHOT_BUCKET

export async function handler(event) {
	const params = event.queryStringParameters ?? {}
	const url = params.url

	if (!url) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: 'Missing url parameter' })
		}
	}

	const searchParams = new URLSearchParams({
		url,
		width: params.width ?? '1440',
		height: params.height ?? '900',
		type: params.type ?? 'png',
		quality: '85',
		waitUntil: 'networkidle'
	})

	const response = await fetch(\`\${API_BASE}?\${searchParams}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY },
		signal: AbortSignal.timeout(25_000)
	})

	if (!response.ok) {
		return {
			statusCode: response.status,
			body: JSON.stringify({ error: 'Screenshot capture failed' })
		}
	}

	const buffer = Buffer.from(await response.arrayBuffer())
	const contentType = response.headers.get('content-type') ?? 'image/png'
	const ext = params.type ?? 'png'
	const key = \`screenshots/\${Date.now()}-\${encodeURIComponent(url).slice(0, 100)}.\${ext}\`

	await s3.send(new PutObjectCommand({
		Bucket: BUCKET,
		Key: key,
		Body: buffer,
		ContentType: contentType
	}))

	const presignedUrl = await getSignedUrl(
		s3,
		new GetObjectCommand({ Bucket: BUCKET, Key: key }),
		{ expiresIn: 3600 }
	)

	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			url: presignedUrl,
			key,
			size: buffer.byteLength,
			contentType
		})
	}
}`}
					/>
				</div>
			</section>

			{/* Python Handler */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python Lambda handler
				</h2>
				<p className="mt-3 text-muted-foreground">
					The same function in Python using urllib (standard library)
					and boto3 for S3. No additional layers or packages needed.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="handler.py"
						code={`import json
import os
import time
from urllib.request import Request, urlopen
from urllib.parse import urlencode

import boto3

s3 = boto3.client("s3")
BUCKET = os.environ["SCREENSHOT_BUCKET"]
API_BASE = "https://screenshotapi.to/api/v1/screenshot"
API_KEY = os.environ["SCREENSHOTAPI_KEY"]


def handler(event, context):
    params = event.get("queryStringParameters") or {}
    url = params.get("url")

    if not url:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing url parameter"}),
        }

    query = urlencode({
        "url": url,
        "width": params.get("width", "1440"),
        "height": params.get("height", "900"),
        "type": params.get("type", "png"),
        "quality": "85",
        "waitUntil": "networkidle",
    })

    req = Request(
        f"{API_BASE}?{query}",
        headers={"x-api-key": API_KEY},
    )

    with urlopen(req, timeout=25) as response:
        image_data = response.read()
        content_type = response.headers.get("content-type", "image/png")

    ext = params.get("type", "png")
    key = f"screenshots/{int(time.time())}-{url[:80]}.{ext}"

    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=image_data,
        ContentType=content_type,
    )

    presigned_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=3600,
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "url": presigned_url,
            "key": key,
            "size": len(image_data),
        }),
    }`}
					/>
				</div>
			</section>

			{/* API Gateway Setup */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					API Gateway setup
				</h2>
				<p className="mt-3 text-muted-foreground">
					Configure API Gateway to expose your Lambda function as an
					HTTP endpoint. Use a SAM or CloudFormation template for
					repeatable deployments.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title="template.yaml (SAM)"
						code={`AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Screenshot capture service

Globals:
  Function:
    Timeout: 30
    MemorySize: 256

Resources:
  ScreenshotBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "\${AWS::StackName}-screenshots"
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldScreenshots
            Status: Enabled
            ExpirationInDays: 30

  CaptureFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handler.handler
      Runtime: nodejs20.x
      Environment:
        Variables:
          SCREENSHOT_BUCKET: !Ref ScreenshotBucket
          SCREENSHOTAPI_KEY: "{{resolve:ssm:/screenshotapi/key}}"
      Policies:
        - S3CrudPolicy:
            BucketName: !Ref ScreenshotBucket
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /screenshot
            Method: GET

Outputs:
  ApiUrl:
    Value: !Sub "https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com/screenshot"`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="bash"
						title="Deploy"
						code={`sam build
sam deploy --guided`}
					/>
				</div>
			</section>

			{/* Production Tips */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production tips
				</h2>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use S3 lifecycle rules.
							</strong>{' '}
							Set an expiration policy to automatically delete old
							screenshots. Transition to Glacier or delete after
							30 days to control storage costs.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Enable CloudFront.
							</strong>{' '}
							Put a CloudFront distribution in front of your S3
							bucket to serve screenshots from edge locations
							worldwide.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set up CloudWatch alarms.
							</strong>{' '}
							Monitor function errors, duration, and throttles.
							Alert when error rates exceed 5% or duration exceeds
							10 seconds.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use provisioned concurrency.
							</strong>{' '}
							For latency-sensitive workloads, enable provisioned
							concurrency to eliminate cold starts entirely.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
