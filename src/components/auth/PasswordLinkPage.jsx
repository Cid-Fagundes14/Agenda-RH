import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabase, hasSupabaseConfig, resultOf } from "@/api/supabase";
import { clearPasswordSetup, pendingPasswordSetup, readInvitationSession, readPasswordSetup, rememberPasswordSetup, stripAuthToken } from "@/lib/authLink";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthField, AuthLink, SubmitButton } from "@/components/auth/parts";

export function PasswordLinkPage({ flow }) {
  const invite = flow === "invite";
  const [token, setToken] = useState(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("token_hash"));
  const [invitationSession, setInvitationSession] = useState(() =>
    invite && typeof window !== "undefined" ? readInvitationSession(window.location.hash) : null
  );
  const hasLink = Boolean(token || invitationSession);
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLink || !hasSupabaseConfig || readPasswordSetup()?.flow !== flow) return;
    let active = true;
    resultOf(getSupabase().auth.getUser())
      .then(({ user: visitor }) => {
        if (active && visitor && pendingPasswordSetup(visitor.id) === flow) setUser(visitor);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [flow, hasLink]);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const auth = getSupabase().auth;
      if (!user) {
        const { user: verifiedUser } = token
          ? await resultOf(auth.verifyOtp({ token_hash: token, type: flow }))
          : await resultOf(auth.setSession(invitationSession));
        if (!verifiedUser) throw new Error("Não foi possível validar o link.");
        rememberPasswordSetup(verifiedUser.id, flow);
        stripAuthToken();
        setUser(verifiedUser);
        setToken(null);
        setInvitationSession(null);
        return;
      }

      const { user: currentUser } = await resultOf(auth.getUser());
      if (currentUser?.id !== user.id || pendingPasswordSetup(user.id) !== flow) {
        throw new Error("Essa sessão expirou. Use um novo link.");
      }
      const password = values.get("password");
      const fullName = values.get("name")?.trim();
      if (password !== values.get("confirm")) throw new Error("A confirmação da senha não confere.");
      if (invite && !fullName) throw new Error("Informe o nome completo.");
      await resultOf(auth.updateUser({ password, ...(invite ? { data: { full_name: fullName } } : {}) }));
      clearPasswordSetup();
      if (!invite) await resultOf(auth.signOut({ scope: "local" }));
      window.location.replace(invite ? "/" : "/login");
    } catch (failure) {
      if (failure.code === "otp_expired" || failure.code === "validation_failed" ||
          (invitationSession && ["bad_jwt", "session_not_found", "refresh_token_not_found",
            "refresh_token_already_used", "no_authorization"].includes(failure.code))) {
        stripAuthToken();
        setToken(null);
        setInvitationSession(null);
        setError("O link é inválido ou expirou.");
      } else if (failure.code === "same_password" || failure.code === "weak_password") {
        setError("Use uma nova senha que atenda às exigências de segurança.");
      } else {
        setError(failure.code ? "Não foi possível concluir. Tente novamente." : failure.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout icon={KeyRound} title={invite ? "Concluir cadastro" : "Definir nova senha"}>
      {!hasSupabaseConfig ? <AuthError>O Supabase ainda não foi configurado neste ambiente.</AuthError>
        : user || hasLink ? (
          <form onSubmit={submit} className="space-y-4">
            {user ? <>
              {invite && <>
                <AuthField label="E-mail do convite" value={user.email || ""} readOnly />
                <AuthField label="Nome completo" name="name" autoComplete="name" maxLength={120} required />
              </>}
              <AuthField label={invite ? "Senha" : "Nova senha"} name="password" type="password" minLength={8} autoComplete="new-password" required />
              <AuthField label="Confirmar senha" name="confirm" type="password" minLength={8} autoComplete="new-password" required />
            </> : <p className="text-sm">Clique em continuar para validar o link enviado ao seu e-mail.</p>}
            <AuthError>{error}</AuthError>
            <SubmitButton busy={busy}>{user ? (invite ? "Concluir cadastro" : "Salvar nova senha") : "Continuar"}</SubmitButton>
          </form>
        ) : <AuthError>{error || (invite ? "Abra o link de convite enviado ao seu e-mail." : "Abra um link de recuperação válido.")}</AuthError>}
      <p className="mt-4 text-center text-sm">
        {invite ? <AuthLink to="/login">Voltar ao login</AuthLink> : <AuthLink to="/forgot-password">Solicitar novo link</AuthLink>}
      </p>
    </AuthLayout>
  );
}
