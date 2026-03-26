export function FAQSection({
	items
}: {
	items: { question: string; answer: string }[]
}) {
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	}

	return (
		<section className="mt-16">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>
			<h2 className="text-2xl font-bold tracking-tight">
				Frequently asked questions
			</h2>
			<div className="mt-8 space-y-6">
				{items.map(item => (
					<div key={item.question}>
						<h3 className="font-semibold">{item.question}</h3>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{item.answer}
						</p>
					</div>
				))}
			</div>
		</section>
	)
}
