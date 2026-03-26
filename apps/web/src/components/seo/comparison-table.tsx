export function ComparisonTable({
	headers,
	rows
}: {
	headers: string[]
	rows: { feature: string; values: (string | boolean)[] }[]
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-border">
						<th className="px-4 py-3 text-left font-semibold">
							Feature
						</th>
						{headers.map(h => (
							<th
								key={h}
								className="px-4 py-3 text-left font-semibold"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
						<tr
							key={row.feature}
							className="border-b border-border/50 transition-colors hover:bg-muted/30"
						>
							<td className="px-4 py-3 font-medium">
								{row.feature}
							</td>
							{row.values.map((val, i) => (
								<td
									key={`${row.feature}-${headers[i]}`}
									className="px-4 py-3"
								>
									{typeof val === 'boolean' ? (
										val ? (
											<svg
												className="h-5 w-5 text-green-600"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={2}
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M4.5 12.75l6 6 9-13.5"
												/>
											</svg>
										) : (
											<svg
												className="h-5 w-5 text-muted-foreground/40"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={2}
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										)
									) : (
										<span className="text-muted-foreground">
											{val}
										</span>
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
