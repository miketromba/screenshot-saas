import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy — ScreenshotAPI',
	description:
		'Privacy Policy for ScreenshotAPI. Learn how we collect, use, and protect your data.'
}

export default function PrivacyPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-16">
			<article className="wysiwyg wysiwyg-neutral dark:wysiwyg-invert max-w-none">
				<h1>Privacy Policy</h1>
				<p>
					<strong>Effective Date:</strong> March 24, 2026
				</p>
				<p>
					<strong>Last Updated:</strong> March 24, 2026
				</p>

				<p>
					ScreenshotAPI (&quot;we,&quot; &quot;us,&quot; or
					&quot;our&quot;) operates the website at{' '}
					<a href="https://screenshotapi.to">
						https://screenshotapi.to
					</a>{' '}
					and the ScreenshotAPI application programming interface
					(collectively, the &quot;Service&quot;). This Privacy Policy
					describes how we collect, use, disclose, and protect your
					personal information when you use the Service.
				</p>
				<p>
					By accessing or using the Service, you agree to the
					collection and use of information in accordance with this
					Privacy Policy. If you do not agree with this Privacy
					Policy, please do not use the Service.
				</p>

				<h2>1. Information We Collect</h2>

				<h3>1.1 Information You Provide Directly</h3>
				<table>
					<thead>
						<tr>
							<th>Data Category</th>
							<th>Examples</th>
							<th>When Collected</th>
							<th>Purpose</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Account Information</td>
							<td>Email address, display name</td>
							<td>Account registration</td>
							<td>
								Account creation, authentication, communication
							</td>
						</tr>
						<tr>
							<td>Authentication Credentials</td>
							<td>Password (hashed), OAuth provider tokens</td>
							<td>Account registration and login</td>
							<td>Authentication and account security</td>
						</tr>
						<tr>
							<td>Payment Information</td>
							<td>Credit card details, billing address</td>
							<td>Credit Pack purchase or Auto Top-Up setup</td>
							<td>Payment processing</td>
						</tr>
						<tr>
							<td>Support Communications</td>
							<td>Email content, attachments</td>
							<td>When you contact support</td>
							<td>Responding to your inquiries</td>
						</tr>
					</tbody>
				</table>

				<h3>1.2 Information Collected Automatically</h3>
				<table>
					<thead>
						<tr>
							<th>Data Category</th>
							<th>Examples</th>
							<th>Purpose</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>API Usage Logs</td>
							<td>
								URLs submitted for screenshots, request
								timestamps, response status (success/failure),
								rendering duration, API Key used, screenshot
								options/parameters
							</td>
							<td>
								Service delivery, usage tracking, debugging,
								abuse prevention
							</td>
						</tr>
						<tr>
							<td>Credit Transaction Records</td>
							<td>
								Credit purchases, usage deductions, refunds,
								signup bonuses, Auto Top-Up charges
							</td>
							<td>Billing, account management, audit trail</td>
						</tr>
						<tr>
							<td>Server Logs</td>
							<td>
								IP address, request headers, user agent,
								timestamps
							</td>
							<td>Security, performance monitoring, debugging</td>
						</tr>
					</tbody>
				</table>

				<h3>1.3 Information We Do Not Collect</h3>
				<ul>
					<li>
						<strong>Screenshot image data:</strong> Screenshots are
						generated on demand and returned directly to you in the
						API response. We do not store, cache, or retain the
						screenshot images after delivery.
					</li>
					<li>
						<strong>Web page content:</strong> We do not store the
						HTML, CSS, JavaScript, or other content of the web pages
						you screenshot. Page content is rendered transiently
						during the screenshot process and discarded immediately.
					</li>
					<li>
						<strong>Cookies for tracking or advertising:</strong> We
						do not use tracking cookies, advertising pixels, or
						third-party analytics services.
					</li>
				</ul>

				<h2>2. How We Use Your Information</h2>
				<p>We use the information we collect to:</p>
				<ul>
					<li>
						<strong>Provide the Service:</strong> Process your API
						requests, generate screenshots, manage your account, and
						maintain your credit balance.
					</li>
					<li>
						<strong>Process payments:</strong> Facilitate Credit
						Pack purchases and Auto Top-Up charges through our
						payment processor.
					</li>
					<li>
						<strong>Communicate with you:</strong> Send
						service-related notifications, respond to support
						requests, and inform you of material changes to the
						Service or these policies.
					</li>
					<li>
						<strong>Ensure security:</strong> Detect, prevent, and
						respond to fraud, abuse, unauthorized access, and other
						harmful activities.
					</li>
					<li>
						<strong>Improve the Service:</strong> Analyze usage
						patterns in aggregate to improve performance,
						reliability, and features.
					</li>
					<li>
						<strong>Comply with legal obligations:</strong> Fulfill
						legal requirements, respond to lawful requests, and
						protect our rights.
					</li>
				</ul>

				<h2>3. Legal Basis for Processing (GDPR)</h2>
				<p>
					If you are located in the European Economic Area (EEA) or
					the United Kingdom, we process your personal data under the
					following legal bases:
				</p>
				<table>
					<thead>
						<tr>
							<th>Processing Activity</th>
							<th>Legal Basis</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Account creation and authentication</td>
							<td>Performance of contract (Terms of Service)</td>
						</tr>
						<tr>
							<td>Payment processing</td>
							<td>Performance of contract</td>
						</tr>
						<tr>
							<td>
								API request processing and screenshot generation
							</td>
							<td>Performance of contract</td>
						</tr>
						<tr>
							<td>Security and abuse prevention</td>
							<td>Legitimate interest</td>
						</tr>
						<tr>
							<td>
								Service improvement through aggregated analytics
							</td>
							<td>Legitimate interest</td>
						</tr>
						<tr>
							<td>Legal compliance</td>
							<td>Legal obligation</td>
						</tr>
						<tr>
							<td>Service-related communications</td>
							<td>
								Performance of contract / Legitimate interest
							</td>
						</tr>
					</tbody>
				</table>

				<h2>4. How We Share Your Information</h2>
				<p>
					We do not sell, rent, or trade your personal information. We
					share your information only in the following circumstances:
				</p>

				<h3>4.1 Third-Party Service Providers</h3>
				<p>
					We use the following third-party services that process your
					data on our behalf:
				</p>
				<table>
					<thead>
						<tr>
							<th>Service</th>
							<th>Purpose</th>
							<th>Data Shared</th>
							<th>Privacy Policy</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Polar</td>
							<td>Payment processing</td>
							<td>
								Email, payment details, transaction metadata
							</td>
							<td>
								<a
									href="https://polar.sh/legal/privacy"
									target="_blank"
									rel="noopener noreferrer"
								>
									polar.sh/legal/privacy
								</a>
							</td>
						</tr>
						<tr>
							<td>Supabase</td>
							<td>Authentication and database hosting</td>
							<td>
								Account data, authentication credentials, all
								database records
							</td>
							<td>
								<a
									href="https://supabase.com/privacy"
									target="_blank"
									rel="noopener noreferrer"
								>
									supabase.com/privacy
								</a>
							</td>
						</tr>
						<tr>
							<td>Vercel</td>
							<td>Application hosting (serverless)</td>
							<td>Server logs, IP addresses, request data</td>
							<td>
								<a
									href="https://vercel.com/legal/privacy-policy"
									target="_blank"
									rel="noopener noreferrer"
								>
									vercel.com/legal/privacy-policy
								</a>
							</td>
						</tr>
					</tbody>
				</table>
				<p>
					These service providers are contractually obligated to
					process your data only as necessary to provide their
					services to us and in accordance with applicable data
					protection laws.
				</p>

				<h3>4.2 Legal Requirements</h3>
				<p>
					We may disclose your information if required to do so by law
					or in response to valid legal process, such as a subpoena,
					court order, or government request.
				</p>

				<h3>4.3 Protection of Rights</h3>
				<p>
					We may disclose your information when we believe it is
					necessary to protect our rights, your safety, the safety of
					others, investigate fraud, or respond to a government
					request.
				</p>

				<h3>4.4 Business Transfer</h3>
				<p>
					In the event of a merger, acquisition, reorganization, or
					sale of assets, your information may be transferred as part
					of that transaction. We will notify you via email or a
					prominent notice on our website of any change in ownership
					or uses of your personal information.
				</p>

				<h2>5. Data Retention</h2>
				<table>
					<thead>
						<tr>
							<th>Data Category</th>
							<th>Retention Period</th>
							<th>Rationale</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Account information</td>
							<td>
								Duration of account plus 30 days after deletion
							</td>
							<td>
								Service delivery and reasonable deletion window
							</td>
						</tr>
						<tr>
							<td>API usage logs</td>
							<td>24 months from creation</td>
							<td>
								Debugging, abuse prevention, usage analytics
							</td>
						</tr>
						<tr>
							<td>Credit transaction records</td>
							<td>7 years</td>
							<td>Financial record-keeping and tax compliance</td>
						</tr>
						<tr>
							<td>Payment records (via Polar)</td>
							<td>As required by Polar and applicable law</td>
							<td>Financial compliance and dispute resolution</td>
						</tr>
						<tr>
							<td>Server logs</td>
							<td>90 days</td>
							<td>Security monitoring and debugging</td>
						</tr>
						<tr>
							<td>Support communications</td>
							<td>24 months from last communication</td>
							<td>Quality assurance and reference</td>
						</tr>
					</tbody>
				</table>
				<p>
					When data reaches the end of its retention period, it is
					deleted or anonymized. We may retain anonymized, aggregated
					data indefinitely for analytical purposes.
				</p>

				<h2>6. Data Security</h2>
				<p>
					We implement commercially reasonable technical and
					organizational measures to protect your personal
					information, including:
				</p>
				<ul>
					<li>
						All data transmitted between your browser or application
						and our Service is encrypted using TLS (HTTPS).
					</li>
					<li>
						API Keys are stored as SHA-256 hashes; the original key
						values are never stored on our servers.
					</li>
					<li>
						Passwords are managed by Supabase Auth, which uses
						industry-standard bcrypt hashing.
					</li>
					<li>
						Payment information is processed and stored by Polar,
						our merchant of record.
					</li>
					<li>
						Database access is restricted and requires authenticated
						connections.
					</li>
					<li>
						Our application infrastructure is hosted on Vercel and
						Supabase, both of which maintain SOC 2 compliance.
					</li>
				</ul>
				<p>
					No method of transmission over the Internet or electronic
					storage is 100% secure. While we strive to protect your
					personal information, we cannot guarantee its absolute
					security. You are responsible for maintaining the security
					of your account credentials and API Keys.
				</p>

				<h2>7. Cookies and Tracking Technologies</h2>
				<p>
					We use only essential cookies that are strictly necessary
					for the operation of the Service:
				</p>
				<table>
					<thead>
						<tr>
							<th>Cookie</th>
							<th>Purpose</th>
							<th>Duration</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Authentication session cookie</td>
							<td>
								Maintains your logged-in session via Supabase
								Auth
							</td>
							<td>Session / up to 7 days</td>
						</tr>
					</tbody>
				</table>
				<p>
					We do not use advertising cookies, tracking pixels,
					third-party analytics services, or social media widgets that
					track your activity across websites. We do not participate
					in cross-site tracking or behavioral advertising.
				</p>

				<h2>8. Your Rights and Choices</h2>
				<p>
					Depending on your location, you may have certain rights
					regarding your personal information:
				</p>

				<h3>8.1 All Users</h3>
				<ul>
					<li>
						<strong>Access:</strong> You can access your account
						information, API usage history, and credit transaction
						records through your account dashboard at any time.
					</li>
					<li>
						<strong>Correction:</strong> You can update your email
						address and display name through your account settings.
					</li>
					<li>
						<strong>Deletion:</strong> You can request deletion of
						your account and associated personal data by contacting
						us at{' '}
						<a href="mailto:support@screenshotapi.to">
							support@screenshotapi.to
						</a>
						. We will process your request within 30 days, subject
						to any legal retention obligations.
					</li>
					<li>
						<strong>API Key Revocation:</strong> You can revoke any
						API Key at any time through your account dashboard.
					</li>
					<li>
						<strong>Auto Top-Up Control:</strong> You can enable,
						disable, or modify Auto Top-Up settings at any time.
					</li>
				</ul>

				<h3>8.2 European Economic Area and United Kingdom Residents</h3>
				<p>
					If you are located in the EEA or UK, you have additional
					rights under the General Data Protection Regulation (GDPR):
				</p>
				<ul>
					<li>
						<strong>Right of Access:</strong> You may request a copy
						of the personal data we hold about you.
					</li>
					<li>
						<strong>Right to Rectification:</strong> You may request
						correction of inaccurate or incomplete personal data.
					</li>
					<li>
						<strong>Right to Erasure:</strong> You may request
						deletion of your personal data, subject to legal
						retention requirements.
					</li>
					<li>
						<strong>Right to Restrict Processing:</strong> You may
						request that we limit processing of your personal data
						in certain circumstances.
					</li>
					<li>
						<strong>Right to Data Portability:</strong> You may
						request that we provide your personal data in a
						structured, commonly used, machine-readable format.
					</li>
					<li>
						<strong>Right to Object:</strong> You may object to
						processing based on legitimate interest.
					</li>
					<li>
						<strong>Right to Lodge a Complaint:</strong> You may
						file a complaint with your local supervisory authority
						if you believe your data protection rights have been
						violated.
					</li>
				</ul>
				<p>
					To exercise any of these rights, please contact us at{' '}
					<a href="mailto:support@screenshotapi.to">
						support@screenshotapi.to
					</a>
					. We will respond to your request within 30 days (or sooner
					if required by applicable law).
				</p>

				<h3>8.3 California Residents</h3>
				<p>
					If you are a California resident, you have rights under the
					California Consumer Privacy Act (CCPA) and the California
					Privacy Rights Act (CPRA):
				</p>
				<ul>
					<li>
						<strong>Right to Know:</strong> You have the right to
						know what personal information we collect, how it is
						used, and with whom it is shared.
					</li>
					<li>
						<strong>Right to Delete:</strong> You have the right to
						request deletion of your personal information, subject
						to certain exceptions.
					</li>
					<li>
						<strong>Right to Correct:</strong> You have the right to
						request correction of inaccurate personal information.
					</li>
					<li>
						<strong>Right to Non-Discrimination:</strong> We will
						not discriminate against you for exercising your privacy
						rights.
					</li>
				</ul>
				<p>
					<strong>
						Categories of personal information collected:
					</strong>{' '}
					Identifiers (email, name, IP address), commercial
					information (purchase history, credit transactions),
					internet activity (API usage logs, server logs).
				</p>
				<p>
					<strong>Sale of personal information:</strong> We do not
					sell your personal information. We do not share your
					personal information for cross-context behavioral
					advertising.
				</p>
				<p>
					To exercise your CCPA rights, contact us at{' '}
					<a href="mailto:support@screenshotapi.to">
						support@screenshotapi.to
					</a>
					. We will verify your identity before processing your
					request.
				</p>

				<h2>9. International Data Transfers</h2>
				<p>
					The Service is operated from the United States. If you are
					accessing the Service from outside the United States, please
					be aware that your information may be transferred to,
					stored, and processed in the United States and other
					countries where our service providers operate.
				</p>
				<p>
					For transfers of personal data from the EEA or UK to the
					United States, we rely on:
				</p>
				<ul>
					<li>
						Standard Contractual Clauses (SCCs) approved by the
						European Commission, where applicable.
					</li>
					<li>
						The data protection commitments of our service providers
						(Supabase, Polar, and Vercel each maintain appropriate
						data transfer mechanisms).
					</li>
				</ul>
				<p>
					By using the Service, you consent to the transfer of your
					information to the United States and other jurisdictions as
					described in this Privacy Policy.
				</p>

				<h2>10. Children&apos;s Privacy</h2>
				<p>
					The Service is not directed to individuals under the age of
					18. We do not knowingly collect personal information from
					children under 18. If we become aware that we have collected
					personal information from a child under 18, we will take
					steps to promptly delete such information. If you believe we
					have inadvertently collected information from a child under
					18, please contact us at{' '}
					<a href="mailto:support@screenshotapi.to">
						support@screenshotapi.to
					</a>
					.
				</p>

				<h2>11. Third-Party Links</h2>
				<p>
					The Service may contain links to third-party websites or
					services. The screenshots you generate depict third-party
					web pages. We are not responsible for the privacy practices
					of these third parties. We encourage you to read the privacy
					policies of any third-party websites you visit.
				</p>

				<h2>12. Changes to This Privacy Policy</h2>
				<p>
					We may update this Privacy Policy from time to time. If we
					make material changes, we will notify you by posting the
					updated Privacy Policy on this page with a new &quot;Last
					Updated&quot; date and, where feasible, by sending notice to
					the email address associated with your account at least 15
					days before the changes take effect.
				</p>
				<p>
					Your continued use of the Service after the effective date
					of any changes constitutes your acceptance of the updated
					Privacy Policy. If you do not agree to the changes, you must
					stop using the Service and request deletion of your account.
				</p>

				<h2>13. Contact Us</h2>
				<p>
					If you have any questions, concerns, or requests regarding
					this Privacy Policy or our data practices, please contact us
					at:
				</p>
				<p>
					ScreenshotAPI
					<br />
					Email:{' '}
					<a href="mailto:support@screenshotapi.to">
						support@screenshotapi.to
					</a>
					<br />
					Website:{' '}
					<a href="https://screenshotapi.to">
						https://screenshotapi.to
					</a>
				</p>
				<p>
					For privacy-specific inquiries, including GDPR and CCPA
					requests, please include &quot;Privacy Request&quot; in the
					subject line of your email to ensure prompt handling.
				</p>

				<hr />
				<p className="text-sm text-neutral-500">
					This Privacy Policy was last updated on March 24, 2026. This
					document is provided for informational purposes and should
					be reviewed by qualified legal counsel before publication.
				</p>
			</article>
		</div>
	)
}
