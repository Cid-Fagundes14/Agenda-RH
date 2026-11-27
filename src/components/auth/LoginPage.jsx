import { useState } from "react";
import { getSupabase, hasSupabaseConfig, resultOf } from "@/api/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthField, AuthLink, SubmitButton } from "@/components/auth/parts";
import { safeReturnTo } from "@/lib/authReturnTo";

export function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      await resultOf(getSupabase().auth.signInWithPassword({
        email: values.get("email").trim(), password: values.get("password"),
      }));
      window.location.replace(safeReturnTo());
    } catch (failure) {
      setError(failure.code === "invalid_credentials" ? "E-mail ou senha incorretos." : "Não foi possível entrar. Tente novamente.");
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      iconSrc="/icons/agenda-rh-mark-192.png"
      title="Entrar na Agenda de RH"
      subtitle="Acesse suas tarefas, projetos e calendário."
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthError>{error || (!hasSupabaseConfig && "O Supabase ainda não foi configurado neste ambiente.")}</AuthError>
        <AuthField label="E-mail" name="email" type="email" autoComplete="username" required />
        <AuthField label="Senha" name="password" type="password" autoComplete="current-password" required />
        <SubmitButton busy={busy} disabled={!hasSupabaseConfig}>Entrar</SubmitButton>
        <p className="text-center text-sm"><AuthLink to="/forgot-password">Esqueci minha senha</AuthLink></p>
      </form>
    </AuthLayout>
  );
}
