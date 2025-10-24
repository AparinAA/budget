import Script from "next/script";
import styles from "./layout.module.css";
import "@/shared/ui/variables.css";

export const metadata = {
	title: "Семейный бюджет",
	description: "Планирование и контроль расходов",
};

export default function RootLayout({ children }) {
	return (
		<html lang="ru">
			<Script id="tg-init" strategy="afterInteractive">
				{`
				(function(){
				  if (typeof window === 'undefined') return;
				  const tg = window.Telegram && window.Telegram.WebApp;
				  if (!tg) return;
				  try {
				    tg.ready();
				    tg.expand();
					tg.requestFullscreen();
				  } catch {}
				})();
				`}
			</Script>
			<body
				style={{
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
					fontSize: 14,
					background: "var(--bg-primary)",
					color: "var(--text-primary)",
					margin: 0,
					padding: 0,
				}}
			>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "var(--spacing-lg)",
					}}
				>
					<header className={styles.header}>
						<h1 className={styles.title}>
							Семейный бюджет
						</h1>
					</header>
					{children}
				</div>
			</body>
		</html>
	);
}
