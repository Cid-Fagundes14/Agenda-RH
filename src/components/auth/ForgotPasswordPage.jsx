import { Mail } from "lucide-react";
import { useState } from "react";
import { getSupabase, hasSupabaseConfig, resultOf } from "@/api/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthField, AuthLink, SubmitButton } from "@/components/auth/parts";

export function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await resultOf(getSupabase().auth.resetPasswordForEmail(values.get("email").trim(), {
        redirectTo: new URL("/reset-password", window.location.origin).href,
      }));
      setSent(true);
    } catch {
      setError("Não foi possível solicitar o link agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout icon={Mail} title="Recuperar senha" subtitle="Informe o e-mail cadastrado.">
      {sent ? (
        <p role="status" className="text-sm">Se houver uma conta associada a esse e-mail, você receberá um link para redefinir a senha.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AuthError>{error || (!hasSupabaseConfig && "O Supabase ainda não foi configurado neste ambiente.")}</AuthError>
          <AuthField label="E-mail" name="email" type="email" autoComplete="email" required />
          <SubmitButton busy={busy} disabled={!hasSupabaseConfig}>Enviar link</SubmitButton>
        </form>
      )}
      <p className="mt-4 text-center text-sm"><AuthLink to="/login">Voltar ao login</AuthLink></p>
    </AuthLayout>
  );
}
