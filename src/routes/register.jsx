import { createFileRoute } from "@tanstack/react-router";
import { PasswordLinkPage } from "@/components/auth/PasswordLinkPage";

export const Route = createFileRoute("/register")({ ssr: false, component: () => <PasswordLinkPage flow="invite" /> });
