import { redirect } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { redirectDefaultInvitation } from "@/components/auth/invitationRedirect";
import { authQuery } from "@/lib/AuthContext";
import { pendingPasswordSetup } from "@/lib/authLink";

export async function requireSignedIn({ context, location }) {
  redirectDefaultInvitation();
  const user = await context.queryClient.ensureQueryData(authQuery);
  if (!user) throw redirect({ to: "/login", search: { returnTo: location.href }, reloadDocument: true });
  const pending = pendingPasswordSetup(user.id);
  if (pending) throw redirect({ to: pending === "invite" ? "/register" : "/reset-password", reloadDocument: true });
  return { user };
}

export const AuthGateError = DefaultCatchBoundary;
