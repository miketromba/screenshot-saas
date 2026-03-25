import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Terms of Service — ScreenshotAPI',
	description:
		'Terms of Service for ScreenshotAPI, a screenshot-as-a-service API.'
}

export default function TermsPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-16">
			<article className="wysiwyg wysiwyg-neutral dark:wysiwyg-invert max-w-none">
				<h1>Terms of Service</h1>
				<p>
					<strong>Effective Date:</strong> March 24, 2026
				</p>
				<p>
					<strong>Last Updated:</strong> March 24, 2026
				</p>

				<p>
					Welcome to ScreenshotAPI. These Terms of Service
					(&quot;Terms&quot;) constitute a legally binding agreement
					between you (&quot;User,&quot; &quot;you,&quot; or
					&quot;your&quot;) and ScreenshotAPI (&quot;we,&quot;
					&quot;us,&quot; or &quot;our&quot;), operated by an
					individual developer, governing your access to and use of
					the ScreenshotAPI website located at{' '}
					<a href="https://screenshotapi.dev">
						https://screenshotapi.dev
					</a>{' '}
					and the ScreenshotAPI application programming interface
					(collectively, the &quot;Service&quot;).
				</p>

				<p>
					By creating an account, accessing, or using the Service, you
					acknowledge that you have read, understood, and agree to be
					bound by these Terms. If you are using the Service on behalf
					of an organization, you represent and warrant that you have
					the authority to bind that organization to these Terms. If
					you do not agree to these Terms, you must not use the
					Service.
				</p>

				<h2>1. Definitions</h2>
				<ul>
					<li>
						<strong>&quot;Service&quot;</strong> means the
						ScreenshotAPI website, API, documentation, and all
						related services.
					</li>
					<li>
						<strong>&quot;API&quot;</strong> means the ScreenshotAPI
						application programming interface that generates
						screenshots of web pages on demand.
					</li>
					<li>
						<strong>&quot;API Key&quot;</strong> means the unique
						authentication credential issued to you for accessing
						the API.
					</li>
					<li>
						<strong>&quot;Credit&quot;</strong> means the unit of
						usage consumed when making an API request that generates
						a screenshot. One screenshot equals one Credit.
					</li>
					<li>
						<strong>&quot;Credit Pack&quot;</strong> means a
						pre-purchased bundle of Credits available at the prices
						listed on our pricing page.
					</li>
					<li>
						<strong>&quot;Auto Top-Up&quot;</strong> means the
						optional feature that automatically purchases a
						designated Credit Pack when your Credit balance falls
						below a threshold you configure.
					</li>
					<li>
						<strong>&quot;Content&quot;</strong> means any data,
						text, images, or other materials transmitted to or from
						the Service.
					</li>
					<li>
						<strong>&quot;User Content&quot;</strong> means any
						URLs, parameters, or configuration you provide to the
						Service in connection with generating screenshots.
					</li>
				</ul>

				<h2>2. Eligibility</h2>
				<p>
					You must be at least 18 years of age (or the age of majority
					in your jurisdiction, whichever is greater) to use the
					Service. By using the Service, you represent and warrant
					that you meet this eligibility requirement. We do not
					knowingly provide the Service to anyone under 18 years of
					age.
				</p>

				<h2>3. Account Registration and Security</h2>
				<h3>3.1 Account Creation</h3>
				<p>
					To use the Service, you must create an account by providing
					a valid email address and password, or by authenticating
					through a supported third-party OAuth provider. You agree to
					provide accurate, current, and complete information during
					registration and to update such information as necessary.
				</p>

				<h3>3.2 Account Security</h3>
				<p>
					You are solely responsible for maintaining the
					confidentiality of your account credentials and API Keys.
					You must not share your account credentials or API Keys with
					any third party. You are responsible for all activities that
					occur under your account, whether or not authorized by you.
					You must notify us immediately at{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>{' '}
					if you become aware of any unauthorized use of your account
					or API Keys.
				</p>

				<h3>3.3 API Key Management</h3>
				<p>
					API Keys are confidential credentials. You may create
					multiple API Keys and revoke them at any time through your
					account dashboard. We store only a hashed version of your
					API Keys. If you believe an API Key has been compromised,
					you should revoke it immediately and generate a new one.
				</p>

				<h2>4. The Service</h2>
				<h3>4.1 Service Description</h3>
				<p>
					ScreenshotAPI is a screenshot-as-a-service API that
					generates web page screenshots on demand. You submit a URL
					and optional rendering parameters through the API, and the
					Service returns a screenshot image. Screenshots are
					generated in real time and returned directly to you; they
					are not stored on our servers after delivery.
				</p>

				<h3>4.2 Free Credits</h3>
				<p>
					Upon creating an account, you receive 5 free Credits. These
					Credits are subject to the same terms as purchased Credits
					and may not be transferred or exchanged for cash.
				</p>

				<h3>4.3 Service Modifications</h3>
				<p>
					We reserve the right to modify, suspend, or discontinue the
					Service (or any part thereof) at any time, with or without
					notice. We will make commercially reasonable efforts to
					notify you of material changes. We shall not be liable to
					you or any third party for any modification, suspension, or
					discontinuance of the Service.
				</p>

				<h2>5. Credit-Based Pricing and Payment</h2>
				<h3>5.1 Credit Packs</h3>
				<p>
					The Service operates on a credit-based pricing model. You
					pre-purchase Credit Packs to use the API. Current Credit
					Pack options and pricing are listed on our pricing page.
					Credit Pack prices are denominated in U.S. dollars and are
					subject to change. We will notify you of any price changes
					before they take effect, and changes will not affect Credits
					already purchased.
				</p>

				<h3>5.2 Credit Usage</h3>
				<p>
					Each successful API request that generates a screenshot
					consumes one Credit from your balance. Credits are deducted
					at the time a screenshot is successfully generated. Failed
					requests do not consume Credits. Credits do not expire.
				</p>

				<h3>5.3 Auto Top-Up</h3>
				<p>
					If you enable the Auto Top-Up feature, you authorize us to
					automatically charge your stored payment method for the
					designated Credit Pack when your Credit balance falls below
					the threshold you configure. You may enable, disable, or
					modify your Auto Top-Up settings at any time through your
					account dashboard. You are responsible for ensuring your
					payment method remains valid. We are not liable for any
					service interruption caused by a failed Auto Top-Up charge.
				</p>

				<h3>5.4 Payment Processing</h3>
				<p>
					All payments are processed securely through Stripe, our
					third-party payment processor. By making a purchase, you
					agree to Stripe&apos;s{' '}
					<a
						href="https://stripe.com/legal"
						target="_blank"
						rel="noopener noreferrer"
					>
						Terms of Service
					</a>
					. We do not directly store your credit card numbers or
					banking information. Payment information is collected and
					processed by Stripe in accordance with the Payment Card
					Industry Data Security Standards (PCI DSS).
				</p>

				<h3>5.5 Taxes</h3>
				<p>
					All prices are exclusive of applicable taxes, levies, or
					duties imposed by taxing authorities. You are responsible
					for paying all such taxes, levies, or duties associated with
					your purchases, excluding taxes based on our net income.
				</p>

				<h3>5.6 Refunds</h3>
				<p>
					Credit purchases are generally non-refundable. We may, at
					our sole discretion, provide refunds or credits on a
					case-by-case basis. If you believe you are entitled to a
					refund due to a technical issue with the Service, please
					contact us at{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>{' '}
					within 30 days of the purchase.
				</p>

				<h2>6. Acceptable Use Policy</h2>
				<p>You agree not to use the Service to:</p>
				<ul>
					<li>
						Violate any applicable local, state, national, or
						international law or regulation.
					</li>
					<li>
						Capture screenshots of web pages containing illegal
						content, including but not limited to child sexual abuse
						material, content that violates intellectual property
						rights, or content that facilitates illegal activities.
					</li>
					<li>
						Engage in any activity that could be used for phishing,
						fraud, impersonation, or social engineering attacks.
					</li>
					<li>
						Generate screenshots for the purpose of harassment,
						defamation, stalking, or intimidation of any person.
					</li>
					<li>
						Attempt to gain unauthorized access to the Service,
						other accounts, computer systems, or networks connected
						to the Service.
					</li>
					<li>
						Interfere with or disrupt the Service or the servers or
						networks providing the Service, including through
						denial-of-service attacks or excessive API requests
						designed to degrade performance.
					</li>
					<li>
						Reverse engineer, decompile, disassemble, or otherwise
						attempt to derive the source code of the Service.
					</li>
					<li>
						Use the Service to monitor, scrape, or index web pages
						in violation of those pages&apos; terms of service or
						robots.txt directives.
					</li>
					<li>
						Resell, redistribute, or sublicense access to the
						Service or your API Key without our prior written
						consent.
					</li>
					<li>
						Use automated means to create multiple accounts or to
						circumvent usage limits.
					</li>
				</ul>
				<p>
					We reserve the right to investigate and take appropriate
					action against anyone who, in our sole discretion, violates
					this Acceptable Use Policy, including suspending or
					terminating the offending User&apos;s account without refund
					and reporting the activity to law enforcement authorities.
				</p>

				<h2>7. Intellectual Property</h2>
				<h3>7.1 Our Intellectual Property</h3>
				<p>
					The Service, including all software, APIs, documentation,
					designs, text, graphics, logos, and trademarks, is owned by
					ScreenshotAPI and is protected by applicable intellectual
					property laws. Nothing in these Terms grants you any right,
					title, or interest in the Service other than the limited
					right to use the Service in accordance with these Terms.
				</p>

				<h3>7.2 Your Content</h3>
				<p>
					You retain ownership of the URLs and parameters you submit
					to the Service and the resulting screenshot images. By using
					the Service, you grant us a limited, non-exclusive,
					royalty-free, worldwide license to process your User Content
					solely for the purpose of providing the Service to you
					(i.e., rendering the requested web page and generating the
					screenshot).
				</p>

				<h3>7.3 Third-Party Content</h3>
				<p>
					Screenshots generated by the Service depict third-party web
					pages. You are solely responsible for ensuring that your use
					of the generated screenshots complies with the intellectual
					property rights and terms of service of the depicted web
					pages. We make no representations regarding your right to
					capture, store, or distribute screenshots of third-party
					content.
				</p>

				<h2>8. Privacy</h2>
				<p>
					Your use of the Service is also governed by our{' '}
					<a href="/privacy">Privacy Policy</a>, which is incorporated
					into these Terms by reference. Please review the Privacy
					Policy to understand how we collect, use, and protect your
					information.
				</p>

				<h2>9. Third-Party Services</h2>
				<p>
					The Service integrates with third-party services, including
					but not limited to Stripe (payment processing) and Supabase
					(authentication and database infrastructure). Your use of
					these third-party services is subject to their respective
					terms of service and privacy policies. We are not
					responsible for the availability, accuracy, or content of
					third-party services, and we do not endorse or assume any
					liability for them.
				</p>

				<h2>10. Warranty Disclaimer</h2>
				<p>
					THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
					AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND,
					EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED
					BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT
					NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
					FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY
					WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF
					TRADE.
				</p>
				<p>
					WITHOUT LIMITING THE FOREGOING, WE DO NOT WARRANT THAT: (A)
					THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR
					ERROR-FREE; (B) THE RESULTS OBTAINED FROM THE SERVICE WILL
					BE ACCURATE, COMPLETE, OR RELIABLE; (C) THE SCREENSHOTS
					GENERATED WILL ACCURATELY REFLECT THE CURRENT STATE OF ANY
					WEB PAGE; (D) ANY DEFECTS OR ERRORS IN THE SERVICE WILL BE
					CORRECTED; OR (E) THE SERVICE WILL BE COMPATIBLE WITH ANY
					PARTICULAR HARDWARE, SOFTWARE, OR NETWORK CONFIGURATION.
				</p>

				<h2>11. Limitation of Liability</h2>
				<p>
					TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO
					EVENT SHALL SCREENSHOTAPI, ITS OPERATOR, AFFILIATES, OR
					SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
					SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT
					NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR
					OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION
					WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, WHETHER
					BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE),
					STATUTE, OR ANY OTHER LEGAL THEORY, REGARDLESS OF WHETHER WE
					HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
				</p>
				<p>
					OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING
					FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER
					OF (A) THE AMOUNTS YOU PAID TO US IN THE TWELVE (12) MONTHS
					PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE
					HUNDRED U.S. DOLLARS ($100.00).
				</p>
				<p>
					SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION
					OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE
					LIMITATIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, OUR
					LIABILITY SHALL BE LIMITED TO THE FULLEST EXTENT PERMITTED
					BY LAW.
				</p>

				<h2>12. Indemnification</h2>
				<p>
					You agree to indemnify, defend, and hold harmless
					ScreenshotAPI, its operator, and any affiliates or service
					providers from and against any and all claims, liabilities,
					damages, losses, costs, and expenses (including reasonable
					attorneys&apos; fees) arising from or related to: (a) your
					use of the Service; (b) your violation of these Terms; (c)
					your violation of any rights of a third party, including
					intellectual property rights; (d) the URLs you submit to the
					Service or the screenshots you generate; or (e) any
					misrepresentation made by you.
				</p>

				<h2>13. Term and Termination</h2>
				<h3>13.1 Term</h3>
				<p>
					These Terms are effective as of the date you first access or
					use the Service and continue until terminated by either
					party.
				</p>

				<h3>13.2 Termination by You</h3>
				<p>
					You may terminate your account at any time by contacting us
					at{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>
					. Termination of your account does not entitle you to a
					refund of any purchased but unused Credits.
				</p>

				<h3>13.3 Termination by Us</h3>
				<p>
					We may suspend or terminate your access to the Service at
					any time, with or without cause, and with or without notice.
					We may terminate your account immediately if you breach
					these Terms or engage in activity that we determine, in our
					sole discretion, is harmful to the Service, other users, or
					third parties.
				</p>

				<h3>13.4 Effect of Termination</h3>
				<p>
					Upon termination, your right to use the Service ceases
					immediately. Any unused Credits in your account at the time
					of termination are forfeited unless we determine otherwise
					at our sole discretion. Sections that by their nature should
					survive termination shall survive, including but not limited
					to Sections 7 (Intellectual Property), 10 (Warranty
					Disclaimer), 11 (Limitation of Liability), 12
					(Indemnification), 14 (Dispute Resolution), and 15
					(Governing Law).
				</p>

				<h2>14. Dispute Resolution</h2>
				<h3>14.1 Informal Resolution</h3>
				<p>
					Before initiating any formal proceeding, you agree to first
					contact us at{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>{' '}
					and attempt to resolve any dispute informally for at least
					30 days.
				</p>

				<h3>14.2 Binding Arbitration</h3>
				<p>
					If the dispute is not resolved informally, you and
					ScreenshotAPI agree that any dispute, claim, or controversy
					arising out of or relating to these Terms or the Service
					shall be resolved through binding arbitration administered
					by the American Arbitration Association (&quot;AAA&quot;) in
					accordance with its Consumer Arbitration Rules. The
					arbitration shall be conducted in English and shall take
					place in the State of Delaware, United States, or at a
					location mutually agreed upon by the parties. The
					arbitrator&apos;s decision shall be final and binding.
				</p>

				<h3>14.3 Class Action Waiver</h3>
				<p>
					YOU AND SCREENSHOTAPI AGREE THAT EACH MAY BRING CLAIMS
					AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY,
					AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED
					CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. THE
					ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON&apos;S
					CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF
					REPRESENTATIVE OR CLASS PROCEEDING.
				</p>

				<h3>14.4 Small Claims Exception</h3>
				<p>
					Notwithstanding the above, either party may bring an
					individual action in small claims court for disputes within
					the jurisdictional limits of that court.
				</p>

				<h2>15. Governing Law and Venue</h2>
				<p>
					These Terms shall be governed by and construed in accordance
					with the laws of the State of Delaware, United States,
					without regard to its conflict of law provisions. For any
					disputes not subject to arbitration, you consent to the
					exclusive jurisdiction and venue of the state and federal
					courts located in the State of Delaware.
				</p>

				<h2>16. Force Majeure</h2>
				<p>
					We shall not be liable for any failure or delay in
					performance of the Service resulting from causes beyond our
					reasonable control, including but not limited to acts of
					God, natural disasters, war, terrorism, riots, embargoes,
					pandemics, epidemics, acts of governmental authorities,
					power failures, internet or telecommunications outages,
					equipment failures, strikes, or other labor disruptions.
				</p>

				<h2>17. Modifications to Terms</h2>
				<p>
					We reserve the right to modify these Terms at any time. If
					we make material changes, we will notify you by posting the
					updated Terms on this page with a new &quot;Last
					Updated&quot; date and, where feasible, by sending notice to
					the email address associated with your account. Your
					continued use of the Service after such changes constitutes
					your acceptance of the modified Terms. If you do not agree
					to the modified Terms, you must stop using the Service and
					terminate your account.
				</p>

				<h2>18. General Provisions</h2>
				<h3>18.1 Entire Agreement</h3>
				<p>
					These Terms, together with the Privacy Policy and any other
					legal notices published on the Service, constitute the
					entire agreement between you and ScreenshotAPI with respect
					to the Service and supersede all prior or contemporaneous
					agreements, understandings, and communications, whether
					written or oral.
				</p>

				<h3>18.2 Severability</h3>
				<p>
					If any provision of these Terms is found to be unlawful,
					void, or unenforceable, that provision shall be enforced to
					the maximum extent permissible, and the remaining provisions
					shall remain in full force and effect.
				</p>

				<h3>18.3 Waiver</h3>
				<p>
					No waiver of any provision of these Terms shall be deemed a
					further or continuing waiver of that provision or any other
					provision. Our failure to exercise or enforce any right or
					provision of these Terms shall not constitute a waiver of
					such right or provision.
				</p>

				<h3>18.4 Assignment</h3>
				<p>
					You may not assign or transfer these Terms or your rights
					under these Terms without our prior written consent. We may
					assign these Terms without restriction.
				</p>

				<h3>18.5 Notices</h3>
				<p>
					Notices to you may be made via the email address associated
					with your account. Notices to us should be sent to{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>
					.
				</p>

				<h2>19. Contact Information</h2>
				<p>
					If you have any questions about these Terms, please contact
					us at:
				</p>
				<p>
					ScreenshotAPI
					<br />
					Email:{' '}
					<a href="mailto:support@screenshotapi.dev">
						support@screenshotapi.dev
					</a>
					<br />
					Website:{' '}
					<a href="https://screenshotapi.dev">
						https://screenshotapi.dev
					</a>
				</p>

				<hr />
				<p className="text-sm text-neutral-500">
					These Terms of Service were last updated on March 24, 2026.
					This document is provided for informational purposes and
					should be reviewed by qualified legal counsel before
					publication.
				</p>
			</article>
		</div>
	)
}
