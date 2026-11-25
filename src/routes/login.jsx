import { createFileRoute } from "@tanstack/react-router";
import { redirectDefaultInvitation } from "@/components/auth/invitationRedirect";
import { LoginPage } from "@/components/auth/LoginPage";

export const Route = createFileRoute("/login")({ ssr: false, beforeLoad: redirectDefaultInvitation, component: LoginPage });
