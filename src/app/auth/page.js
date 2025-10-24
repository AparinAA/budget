"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/shared/api/auth";
import styles from "./auth.module.css";
import kitStyles from "@/shared/ui/kit.module.css";

export default function AuthPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLogin, setIsLogin] = useState(true);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const fn = isLogin ? signIn : signUp;
		try {
			await fn(email, password);
			// После успешной авторизации редирект на главную
			window.location.href = "/";
		} catch (err) {
			alert(err.message || "Ошибка");
		}
	};

	return (
		<main className={styles.authPage}>
			<div className={styles.authCard}>
				<h1 className={styles.title}>{isLogin ? "Вход" : "Регистрация"}</h1>
				<form onSubmit={handleSubmit} className={styles.authForm}>
					<input
						className={kitStyles.input}
						type="text"
						placeholder="Login"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						className={kitStyles.input}
						type="password"
						placeholder="Пароль"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type="submit" className={kitStyles.button}>
						{isLogin ? "Войти" : "Зарегистрироваться"}
					</button>
				</form>
			</div>
		</main>
	);
}