"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, authAction } from "@/shared/api/auth";
import styles from "./styles.module.css";

export function MobileNavigation() {
	const [me, setMe] = useState(null);
	const [loading, setLoading] = useState(true);
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		let mounted = true;
		getMe()
			.then((user) => {
				if (mounted) {
					setMe(user);
					setLoading(false);
				}
			})
			.catch(() => {
				if (mounted) {
					setMe(null);
					setLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	const handleLogout = async () => {
		try {
			await authAction("logout");
		} catch {}
		router.push("/auth");
	};

	if (loading) {
		return null;
	}

	// Если пользователь не авторизован - показываем большую кнопку Login
	if (!me) {
		return (
			<nav className={styles.mobileNav}>
				<button
					className={styles.loginButton}
					onClick={() => router.push("/auth")}
				>
					Войти
				</button>
			</nav>
		);
	}

	// Если авторизован - показываем меню из 3 кнопок
	return (
		<nav className={styles.mobileNav}>
			<button
				className={`${styles.navButton} ${pathname === "/budgets" ? styles.active : ""}`}
				onClick={() => router.push("/budgets")}
			>
				<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
					<path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
				</svg>
				<span>Бюджеты</span>
			</button>
			<button
				className={`${styles.navButton} ${pathname === "/" ? styles.active : ""}`}
				onClick={() => router.push("/")}
			>
				<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
					<path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
				</svg>
				<span>Текущий</span>
			</button>
			<button
				className={styles.navButton}
				onClick={handleLogout}
			>
				<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
					<path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
					<path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
				</svg>
				<span>Выйти</span>
			</button>
		</nav>
	);
}
