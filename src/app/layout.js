import Script from "next/script";
export const metadata = {
	title: "Семейный бюджет",
	description: "Планирование и контроль расходов",
};

export default function RootLayout({ children }) {
	return (
		<html lang="ru">
			<Script
				src="https://telegram.org/js/telegram-web-app.js?59"
				strategy="beforeInteractive"
			/>
			<Script id="tg-init" strategy="afterInteractive">
				{`
				(function(){
				  if (typeof window === 'undefined') return;
				  const tg = window.Telegram && window.Telegram.WebApp;
				  if (!tg) return;
				  try {
				    tg.ready();
				    tg.expand();
				  } catch {}
				})();
				`}
			</Script>
			<body
				style={{
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
					fontSize: 14,
					background: "#0b0f14",
					color: "#e6edf3",
				}}
			>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "24px",
					}}
				>
					<header
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: 24,
						}}
					>
						<h1 style={{ fontSize: 24, fontWeight: 600 }}>
							Семейный бюджет
						</h1>
						<AuthWidget />
					</header>
					{children}
				</div>
			</body>
		</html>
	);
}

function AuthWidget() {
	return (
		<iframe
			src="/view/auth"
			style={{
				border: "none",
				background: "transparent",
				height: 36,
				width: 420,
			}}
			title="auth"
		/>
	);
}
