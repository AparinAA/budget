export async function getMe() {
	const r = await fetch("/api/auth", { cache: "no-store" });
	return (await r.json().catch(() => null)) || null;
}

export async function authAction(action, payload) {
	const r = await fetch("/api/auth", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ action, payload }),
	});
	const data = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(data?.error || "Auth error");
	return data;
}
