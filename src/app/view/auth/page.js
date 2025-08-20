"use client";
import { useEffect, useState } from "react";
import { getMe, authAction } from "@/shared/api/auth";

export default function AuthWidgetPage() {
	const [me, setMe] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	useEffect(() => {
		getMe()
			.then(setMe)
			.catch(() => setMe(null));
	}, []);
	async function submit(e) {
		e.preventDefault();
		try {
			await authAction("login", { email, password });
			setEmail("");
			setPassword("");
			const u = await getMe();
			setMe(u);
			const target = window.parent?.location || window.location;
			target.href = "/view";
		} catch (e) {
			alert(e.message || "Ошибка");
		}
	}
	if (me) {
		return (
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ color: "#9fb3c8", fontSize: 14 }}>
					{me.email || me.id}
				</span>
				<button
					onClick={async () => {
						await authAction("logout");
						const target =
							window.parent?.location || window.location;
						target.href = "/view/auth";
					}}
					style={btn}
				>
					Выйти
				</button>
			</div>
		);
	}
	return (
		<form
			onSubmit={submit}
			style={{ display: "flex", gap: 8, alignItems: "center" }}
		>
			<input
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="email"
				style={inp}
			/>
			<input
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="пароль"
				type="password"
				style={inp}
			/>
			<button type="submit" style={btn}>Войти</button>
		</form>
	);
}

const inp = {
	background: "#0b1420",
	border: "1px solid #1f2a37",
	color: "#e6edf3",
	padding: "6px 8px",
	borderRadius: 6,
};
const btn = {
	background: "#1f2a37",
	color: "#e6edf3",
	border: "1px solid #2a3a4a",
	padding: "6px 10px",
	borderRadius: 6,
	cursor: "pointer",
};
