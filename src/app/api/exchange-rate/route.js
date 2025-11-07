import { NextResponse } from "next/server";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const from = searchParams.get("from");

		if (!from) {
			return NextResponse.json(
				{ error: "Missing from currency" },
				{ status: 400 }
			);
		}

		// Если валюта EUR, курс всегда 1
		if (from === "EUR") {
			return NextResponse.json({ rate: 1 });
		}

		// Всегда конвертируем from -> EUR
		const response = await fetch(
			`https://www.xe.com/api/protected/statistics/?from=${from}&to=EUR`,
			{
				headers: {
					accept: "*/*",
					authorization: "Basic bG9kZXN0YXI6cHVnc25heA==",
				},
				method: "GET",
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch rate ${from} -> EUR`);
		}

		const result = await response.json();
		const rate = result.last1Days.average;

		return NextResponse.json({ rate });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch exchange rate" },
			{ status: 500 }
		);
	}
}
