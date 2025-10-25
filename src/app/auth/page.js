"use client";
import { useEffect, useState, useRef } from "react";
import { getMe, authAction } from "@/shared/api/auth";
import kit from "@/shared/ui/kit.module.css";

export default function AuthPage() {
	const [me, setMe] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isTelegram, setIsTelegram] = useState(false);
	const emailRef = useRef(email);
	const passwordRef = useRef(password);
	
	useEffect(() => {
		emailRef.current = email;
	}, [email]);
	
	useEffect(() => {
		passwordRef.current = password;
	}, [password]);
	
	useEffect(() => {
		// Проверяем, запущено ли в Telegram Mini App
		setIsTelegram(!!window.Telegram?.WebApp?.initData);
		
		getMe()
			.then(setMe)
			.catch(() => setMe(null));
		
		// Блокируем скролл на странице авторизации
		document.body.style.overflow = "hidden";
		
		return () => {
			document.body.style.overflow = "";
		};
	}, []);
	
	// MainButton для формы входа (только в Telegram)
	useEffect(() => {
		if (me || !isTelegram) return; // Если авторизован или не Telegram, не показываем MainButton
		
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			mainButton.setText("Войти");
			mainButton.show();
			
			const handleMainButtonClick = async () => {
				const currentEmail = emailRef.current;
				const currentPassword = passwordRef.current;
				
				if (!currentEmail || !currentPassword) {
					setError("Заполните все поля");
					if (window.Telegram?.WebApp?.HapticFeedback) {
						window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
					}
					return;
				}
				
				mainButton.showProgress();
				mainButton.disable();
				setError("");
				
				try {
					await authAction("login", { email: currentEmail, password: currentPassword });
					const u = await getMe();
					setMe(u);
					
					if (window.Telegram?.WebApp?.HapticFeedback) {
						window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
					}
					
					mainButton.hideProgress();
					mainButton.hide();
					
					const target = window.parent?.location || window.location;
					target.href = "/";
				} catch (e) {
					setError(e.message || "Ошибка авторизации");
					
					if (window.Telegram?.WebApp?.HapticFeedback) {
						window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
					}
					
					mainButton.hideProgress();
					mainButton.enable();
				}
			};
			
			mainButton.onClick(handleMainButtonClick);
			
			return () => {
				mainButton.offClick(handleMainButtonClick);
				mainButton.hide();
			};
		}
	}, [me, isTelegram]);
	
	// Управление состоянием MainButton в зависимости от заполненности полей (только в Telegram)
	useEffect(() => {
		if (me || !isTelegram) return;
		
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			
			if (!email || !password) {
				mainButton.disable();
			} else {
				mainButton.enable();
			}
		}
	}, [email, password, me, isTelegram]);
	
	// Обработчик для обычной кнопки (не Telegram)
	const handleLogin = async () => {
		if (!email || !password) {
			setError("Заполните все поля");
			return;
		}
		
		setError("");
		
		try {
			await authAction("login", { email, password });
			const u = await getMe();
			setMe(u);
			
			const target = window.parent?.location || window.location;
			target.href = "/";
		} catch (e) {
			setError(e.message || "Ошибка авторизации");
		}
	};
	
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
							target.href = "/auth";
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
			margin: "0 auto",
			height: "100vh",
			display: "flex",
			alignItems: "center",
			overflow: "hidden"
		}}>
			<div className={kit.card} style={{ width: "100%" }}>
				<div className={kit.cardTitle}>Авторизация</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
					<input
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setError("");
						}}
						placeholder="Email"
						type="email"
						required
						className={kit.input}
						autoFocus
					/>
					<input
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							setError("");
						}}
						placeholder="Пароль"
						type="password"
						required
						className={kit.input}
					/>
					{error && (
						<div style={{ 
							color: "var(--danger)", 
							fontSize: 14,
							padding: "8px 12px",
							background: "var(--bg-primary)",
							borderRadius: "var(--radius-md)",
							border: "1px solid var(--danger)"
						}}>
							{error}
						</div>
					)}
					{!isTelegram && (
						<button
							onClick={handleLogin}
							disabled={!email || !password}
							className={kit.button}
							style={{ width: "100%", marginTop: "var(--spacing-sm)" }}
						>
							Войти
						</button>
					)}
				</div>
			</div>
		</div>
	);
}