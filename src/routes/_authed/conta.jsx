import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, resultOf } from "@/api/supabase";
import ThemeSettings from "@/components/layout/ThemeSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/conta")({
  head: () => ({ meta: [{ title: "Minha conta · Agenda de RH" }] }),
  component: ContaPage,
});

function ContaPage() {
  const { user, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (next.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("A confirmação não confere com a nova senha.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await resultOf(getSupabase().auth.updateUser({ password: next, current_password: current }));
      toast.success("Senha alterada.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError("Não foi possível alterar a senha. Confira a senha atual e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <header className="mb-5">
        <p className="meta-label">Perfil</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[2.25rem] sm:leading-tight">
          Minha conta
        </h1>
      </header>

      <section className="card-surface p-5">
        <dl className="space-y-4">
          <div>
            <dt className="meta-label">Nome</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{user?.full_name || "Não informado"}</dd>
          </div>
          <div>
            <dt className="meta-label">E-mail</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <ThemeSettings />

      <section className="card-surface mt-4 p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Alterar senha</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className="min-h-11"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              className="min-h-11"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="min-h-11"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border agenda-danger-surface px-3 py-2 text-xs font-medium">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--agenda-button-hover)] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </section>

      <button
        type="button"
        onClick={() => logout()}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
