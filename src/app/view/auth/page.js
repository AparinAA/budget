"use client";
import { useEffect, useState } from "react";
import { getMe, authAction } from "@/shared/api/auth";
import kit from "@/shared/ui/kit.module.css";

export default function AuthWidgetPage() {
	const [me, setMe] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		getMe()
			.then(setMe)
			.catch(() => setMe(null));
	}, []);
	
	async function submit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			await authAction("login", { email, password });
			setEmail("");
			setPassword("");
			const u = await getMe();
			setMe(u);
			const target = window.parent?.location || window.location;
			target.href = "/view";
		} catch (e) {
			alert(e.message || "Ошибка авторизации");
		} finally {
			setLoading(false);
		}
	}
	
	if (me) {
		return (
			<div style={{ 
				padding: "var(--spacing-xl)", 
				maxWidth: 400, 
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "var(--spacing-lg)"
			}}>
				<div className={kit.card}>
					<div className={kit.cardTitle}>Вы авторизованы</div>
					<div style={{ marginBottom: "var(--spacing-md)" }}>
						<span className={kit.muted}>Email: </span>
						<span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
							{me.email || me.id}
						</span>
					</div>
					<button
						onClick={async () => {
							await authAction("logout");
							const target = window.parent?.location || window.location;
							target.href = "/view/auth";
						}}
						className={`${kit.button} ${kit.buttonDanger}`}
						style={{ width: "100%" }}
					>
						Выйти
					</button>
				</div>
			</div>
		);
	}
	
	return (
		<div style={{ 
			padding: "var(--spacing-xl)", 
			maxWidth: 400, 
			margin: "0 auto" 
		}}>
			<form onSubmit={submit} className={kit.card}>
				<div className={kit.cardTitle}>Авторизация</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						type="email"
						required
						className={kit.input}
					/>
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Пароль"
						type="password"
						required
						className={kit.input}
					/>
					<button 
						type="submit" 
						className={`${kit.button} ${kit.buttonSuccess}`}
						disabled={loading}
						style={{ width: "100%" }}
					>
						{loading ? "Вход..." : "Войти"}
					</button>
				</div>
			</form>
		</div>
	);
}
