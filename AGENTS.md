# Agenda de RH

A aplicação usa TanStack Start com React e JavaScript, hospedagem Vercel e Supabase para autenticação e Postgres.

- Mantenha as rotas em `src/routes/` e os componentes existentes. `src/routeTree.gen.ts` é gerado pelo TanStack e não deve ser versionado.
- Use `src/api/supabase.js` para inicializar o SDK no navegador, `src/api/agenda.js` para tarefas e projetos e `src/lib/dates.js` para regras de data.
- As páginas privadas ficam sob `src/routes/_authed/` e são renderizadas no cliente. A autorização efetiva para ler ou escrever dados é aplicada pelo RLS do Postgres.
- Versione alterações de banco em `supabase/migrations/`. Preserve os dados e vínculos já existentes. Nunca inclua chaves administrativas no navegador ou no Git.
- O código em `base44/` é uma referência histórica ao esquema de origem. O app em execução usa o esquema do Supabase.
- Rode `npm run build` para validar mudanças no app. O README descreve a configuração da Vercel e do Supabase.
