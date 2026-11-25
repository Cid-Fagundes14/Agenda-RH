import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId, useState } from "react";

export function AuthError({ children }) {
  return children ? <p role="alert" className="rounded-md agenda-danger-surface p-3 text-sm">{children}</p> : null;
}

export function AuthLink({ to, children }) {
  return <Link to={to} className="font-medium agenda-link hover:underline">{children}</Link>;
}

export function SubmitButton({ busy, busyLabel = "Aguarde…", children, disabled = false }) {
  return <Button type="submit" disabled={busy || disabled} className="min-h-11 w-full">{busy ? busyLabel : children}</Button>;
}

export function AuthField({ label, name, type = "text", ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={id} name={name} type={show ? "text" : type} className="min-h-11" {...props} />
        {type === "password" && (
          <button type="button" className="min-h-11 text-xs agenda-link" onClick={() => setShow(!show)} aria-pressed={show}>
            {show ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
    </div>
  );
}
