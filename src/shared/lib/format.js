export function currency(n, currencyCode = "EUR", locale = "ru-RU") {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currencyCode,
		maximumFractionDigits: 0,
	}).format(n);
}
