import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const options = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Seguir o dispositivo", icon: Monitor },
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section aria-labelledby="appearance-heading" className="card-surface mt-4 p-5">
      <h2 id="appearance-heading" className="font-heading text-base font-semibold">Aparência</h2>
      <p className="mt-1 text-sm text-muted-foreground">A preferência é salva neste navegador.</p>
      <fieldset disabled={!mounted} className="mt-4 grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">Tema da Agenda</legend>
        {options.map(({ value, label, icon: Icon }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              type="radio"
              name="agenda-theme"
              value={value}
              checked={mounted && theme === value}
              onChange={() => setTheme(value)}
              className="peer sr-only"
            />
            <span className="flex min-h-12 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary peer-checked:border-ring peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
