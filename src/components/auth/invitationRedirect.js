import { redirect } from "@tanstack/react-router";
import { readInvitationSession } from "@/lib/authLink";

export function redirectDefaultInvitation() {
  if (typeof window === "undefined") return;
  const { hash } = window.location;
  if (readInvitationSession(hash)) {
    throw redirect({ to: "/register", hash: hash.slice(1), reloadDocument: true });
  }
}
