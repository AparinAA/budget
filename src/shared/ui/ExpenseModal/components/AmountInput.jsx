import kit from "@/shared/ui/kit.module.css";

const CURRENCIES = [
	{ value: "RSD", label: "RSD" },
	{ value: "EUR", label: "EUR" },
	{ value: "USD", label: "USD" },
	{ value: "RUB", label: "RUB" },
];

export function AmountInput({
	amount,
	selectedCurrency,
	exchangeRates,
	isSubmitting,
	loadingRates,
	onAmountChange,
	onCurrencyChange,
}) {
	return (
		<>
			<label className={kit.label}>Сумма расхода</label>
			<div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
				<input
					type="number"
					min="0"
					step="0.01"
					value={amount}
					onChange={onAmountChange}
					placeholder="Введите сумму"
					className={kit.input}
					disabled={isSubmitting}
					autoFocus
					style={{ flex: 1 }}
				/>
				<select
					value={selectedCurrency}
					onChange={onCurrencyChange}
					className={kit.input}
					disabled={isSubmitting || loadingRates}
					style={{ width: "100px" }}
				>
					{CURRENCIES.map((currency) => (
						<option key={currency.value} value={currency.value}>
							{currency.label}
						</option>
					))}
				</select>
			</div>
			
			{selectedCurrency !== "EUR" && exchangeRates && (
				<div style={{ 
					fontSize: 12, 
					color: "var(--text-secondary)", 
					marginTop: "var(--spacing-xs)" 
				}}>
					1 {selectedCurrency} = {(1 / (exchangeRates[selectedCurrency] || 1)).toFixed(4)} EUR
					{amount && Number(amount) > 0 && (
						<> • {amount} {selectedCurrency} ≈ {(Number(amount) / (exchangeRates[selectedCurrency] || 1)).toFixed(2)} EUR</>
					)}
				</div>
			)}
		</>
	);
}
