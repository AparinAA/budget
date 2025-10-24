import Script from "next/script";
import styles from "./layout.module.css";
import "@/shared/ui/variables.css";
import { MobileNavigation } from "@/shared/ui/MobileNavigation";

export const metadata = {
	title: "Семейный бюджет",
	description: "Планирование и контроль расходов",
};

export default function RootLayout({ children }) {
	return (
		<html lang="ru">
			<head>
				<title>Семейный бюджет</title>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
				/>
				<Script
					src="https://telegram.org/js/telegram-web-app.js?59"
					strategy="beforeInteractive"
				/>
			</head>
			<Script id="tg-init" strategy="afterInteractive">
				{`
				(function(){
				  if (typeof window === 'undefined') return;
				  const tg = window.Telegram && window.Telegram.WebApp;
				  if (!tg) return;
				  
				  try {
				    // Инициализация и расширение на весь экран

				    // tg?.ready();
				    // tg?.expand();

				    // // Включаем полноэкранный режим
				    // if (tg.requestFullscreen) {
				    //   tg.requestFullscreen();
				    // }
				    
				    // Применяем цвета темы Telegram к CSS переменным
				    const root = document.documentElement;
				    if (tg.themeParams) {
				      const theme = tg.themeParams;
				      if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
				      if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
				      if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
				      if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
				      if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
				      if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
				      if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
				    }
				    
				    // Устанавливаем safe area для полноэкранного режима
				    if (tg.safeAreaInset) {
				      root.style.setProperty('--tg-safe-area-inset-top', tg.safeAreaInset.top + 'px');
				      root.style.setProperty('--tg-safe-area-inset-bottom', tg.safeAreaInset.bottom + 'px');
				    }
				    
				    // Включаем закрытие приложения при свайпе вниз
				    // tg.enableClosingConfirmation();
				    
				  } catch (e) {
				    console.error('Telegram WebApp init error:', e);
				  }
				})();
				`}
			</Script>
			<body
				style={{
					fontFamily:
						"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
					fontSize: 14,
					background: "var(--bg-primary)",
					color: "var(--text-primary)",
					margin: 0,
					padding: 0,
					paddingTop: "env(safe-area-inset-top)",
					paddingBottom: "env(safe-area-inset-bottom)",
				}}
			>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "calc(var(--tg-safe-area-inset-top, 0px) + var(--spacing-lg)) 1px var(--spacing-lg) 1px",
						paddingBottom: "calc(80px + env(safe-area-inset-bottom))", // Отступ снизу для мобильной навигации + safe area
					}}
				>
					<header className={styles.header}>
						<h1 className={styles.title}>
							Семейный бюджет
						</h1>
					</header>
					{children}
				</div>
				<MobileNavigation />
			</body>
		</html>
	);
}
