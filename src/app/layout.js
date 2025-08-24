export const metadata = {
	title: "Семейный бюджет",
	description: "Планирование и контроль расходов",
};

export default function RootLayout({ children }) {
	return (
		<html lang="ru">
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
