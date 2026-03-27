import {
	ALL_FEATURES,
	COMPETITORS,
	type CompetitorKey,
	CREDIT_PACK_TIERS,
	FREE_TIER_CTA,
	FREE_TIER_DESCRIPTION,
	PRICING_SUMMARY,
	SUBSCRIPTION_TIERS
} from '@screenshot-saas/config'

function formatNumber(n: number): string {
	return n.toLocaleString('en-US')
}

export function ScreenshotAPIPricing({
	showCreditPacks = false
}: {
	showCreditPacks?: boolean
}) {
	const paidTiers = SUBSCRIPTION_TIERS.filter(t => t.monthlyPrice > 0)

	return (
		<>
			<table>
				<thead>
					<tr>
						<th>Plan</th>
						<th>Monthly price</th>
						<th>Screenshots/month</th>
						<th>Per screenshot</th>
					</tr>
				</thead>
				<tbody>
					{paidTiers.map(tier => (
						<tr key={tier.slug}>
							<td>
								<strong>{tier.name}</strong>
							</td>
							<td>${tier.monthlyPrice}/mo</td>
							<td>{formatNumber(tier.screenshotsPerMonth)}</td>
							<td>{tier.perScreenshot}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p>
				{FREE_TIER_DESCRIPTION} — no credit card required.{' '}
				{showCreditPacks
					? 'Credit packs are also available for one-time purchases:'
					: 'Credit packs are also available for pay-as-you-go usage.'}
			</p>
			{showCreditPacks && <CreditPackTable />}
		</>
	)
}

export function CreditPackTable() {
	return (
		<table>
			<thead>
				<tr>
					<th>Pack</th>
					<th>Credits</th>
					<th>Price</th>
					<th>Per screenshot</th>
				</tr>
			</thead>
			<tbody>
				{CREDIT_PACK_TIERS.map(pack => (
					<tr key={pack.name}>
						<td>
							<strong>{pack.name}</strong>
						</td>
						<td>{formatNumber(pack.credits)}</td>
						<td>${pack.price}</td>
						<td>{pack.perScreenshot}</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

export function FreeTierBanner() {
	return (
		<p>
			<strong>{FREE_TIER_CTA}</strong>{' '}
			<a href="/sign-up">Sign up free →</a>
		</p>
	)
}

export function FeatureList() {
	return (
		<ul>
			{ALL_FEATURES.map(feature => (
				<li key={feature}>{feature}</li>
			))}
		</ul>
	)
}

export function CompetitorComparison({
	competitor
}: {
	competitor: CompetitorKey
}) {
	const them = COMPETITORS[competitor]
	if (!them) return null

	const ourTiers = SUBSCRIPTION_TIERS.filter(t => t.monthlyPrice > 0)

	return (
		<>
			<table>
				<thead>
					<tr>
						<th />
						<th>ScreenshotAPI</th>
						<th>{them.name}</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<strong>Free tier</strong>
						</td>
						<td>{FREE_TIER_DESCRIPTION}</td>
						<td>{them.freeCredits}</td>
					</tr>
					{ourTiers.map((ours, i) => {
						const theirs = them.plans[i]
						return (
							<tr key={ours.slug}>
								<td>
									<strong>
										~
										{formatNumber(ours.screenshotsPerMonth)}
										/mo
									</strong>
								</td>
								<td>
									${ours.monthlyPrice}/mo (
									{formatNumber(ours.screenshotsPerMonth)}{' '}
									screenshots)
								</td>
								<td>
									{theirs
										? `$${theirs.price}/mo (${formatNumber(theirs.screenshots ?? 0)} screenshots)`
										: '—'}
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<p>
				<strong>Our advantages:</strong>
			</p>
			<ul>
				<li>
					{FREE_TIER_DESCRIPTION} free tier (vs {them.freeCredits})
				</li>
				<li>Flexible credit packs for pay-as-you-go usage</li>
				{them.weaknesses.map(w => (
					<li key={w}>
						{them.name}: {w}
					</li>
				))}
			</ul>
		</>
	)
}

export function PricingSummary() {
	return <p>{PRICING_SUMMARY}</p>
}
