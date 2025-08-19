export async function fetchSnapshot(year, month) {
	try {
		const res = await fetch(`/api/budget?year=${year}&month=${month}`, {
			cache: "no-store",
		});
		if (res.status === 401) {
			if (typeof window !== "undefined")
				window.location.href = "/view/auth";
			throw new Error("Unauthorized");
		}
		if (!res.ok) throw new Error("failed");
		return await res.json();
	} catch {
		return {
			income: 0,
			currencyCode: "EUR",
			categories: [
				{ id: "food-local", name: "Еда", percent: 30, spent: 0 },
				{ id: "rent-local", name: "Аренда", percent: 40, spent: 0 },
				{
					id: "transport-local",
					name: "Транспорт",
					percent: 10,
					spent: 0,
				},
				{ id: "fun-local", name: "Развлечения", percent: 10, spent: 0 },
			],
		};
	}
}

export async function postAction(action, payload) {
	try {
		const res = await fetch("/api/budget", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action, payload }),
		});
		if (res.status === 401) {
			if (typeof window !== "undefined")
				window.location.href = "/view/auth";
			throw new Error("Unauthorized");
		}
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			const msg = data?.error || "Ошибка";
			alert(msg);
			throw new Error(msg);
		}
		return data;
	} catch (e) {
		if (!String(e?.message || "").includes("Сумма процентов")) {
			alert("Сервер временно недоступен. Проверьте подключение к БД.");
		}
		throw e;
	}
}

export async function fetchStats() {
	const r = await fetch("/api/budget/stats");
	if (r.status === 401) {
		if (typeof window !== "undefined") window.location.href = "/view/auth";
		throw new Error("Unauthorized");
	}
	const d = await r.json().catch(() => []);
	return Array.isArray(d) ? d : [];
}

export async function fetchSavings() {
	const r = await fetch("/api/budget/savings");
	if (r.status === 401) {
		if (typeof window !== "undefined") window.location.href = "/view/auth";
		throw new Error("Unauthorized");
	}
	return (
		(await r.json().catch(() => null)) || { totalBank: 0, transfers: [] }
	);
}
