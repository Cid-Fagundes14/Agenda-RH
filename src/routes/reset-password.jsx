import { createFileRoute } from "@tanstack/react-router";
import { PasswordLinkPage } from "@/components/auth/PasswordLinkPage";

export const Route = createFileRoute("/reset-password")({ ssr: false, component: () => <PasswordLinkPage flow="recovery" /> });
