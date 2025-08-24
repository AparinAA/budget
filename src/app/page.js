import { redirect } from "next/navigation";

export default function Index() {
	return redirect("/view");
}

export const dynamic = "force-static";
