import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * Root route — redirect to the Swap page.
 * This is a server component so the redirect is immediate with no client JS.
 */
export default function HomePage() {
  redirect(ROUTES.SWAP);
}
