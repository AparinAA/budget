export function ShareIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle
				cx="3.5"
				cy="8"
				r="1.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle
				cx="12.5"
				cy="4"
				r="1.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle
				cx="12.5"
				cy="12"
				r="1.5"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<line
				x1="5"
				y1="7.2"
				x2="11"
				y2="4.8"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<line
				x1="5"
				y1="8.8"
				x2="11"
				y2="11.2"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

export function MenuIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<line
				x1="2"
				y1="5"
				x2="14"
				y2="5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="2"
				y1="8"
				x2="14"
				y2="8"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="2"
				y1="11"
				x2="14"
				y2="11"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function TrashIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v4M10 7v4M4 4h8l-.5 8.5a1 1 0 0 1-1 .95H5.5a1 1 0 0 1-1-.95L4 4z"
				stroke="currentColor"
				strokeWidth="1.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function SendIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M13 4L6 11L3 8"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function CloseIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 4L4 12M4 4L12 12"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function RefreshIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M14 8c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6c1.657 0 3.157.671 4.243 1.757L14 5.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14 2v3.5h-3.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ListIcon({ size = 16, ...props }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="2"
				y="3"
				width="12"
				height="2"
				rx="0.5"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<rect
				x="2"
				y="7"
				width="12"
				height="2"
				rx="0.5"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<rect
				x="2"
				y="11"
				width="12"
				height="2"
				rx="0.5"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
		</svg>
	);
}
