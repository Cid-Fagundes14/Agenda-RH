# Agenda de RH

Agenda de tarefas, treinamentos e eventos, com as telas Hoje, Tarefas, Projetos e Calendário. Esta versão usa React e TanStack Start, Supabase Auth e Postgres, com deploy na Vercel via Nitro.

## Primeiro deploy

### 1. Criar o banco e habilitar os convites

1. Crie um projeto no painel do Supabase.
2. Abra **SQL Editor → New query**, aplique os arquivos de `supabase/migrations/` em ordem de nome, uma vez cada no banco novo. Em um banco existente, aplique apenas as migrações pendentes, na mesma ordem.
3. Em **Authentication**, mantenha e-mail e senha habilitados e desative **Allow new users to sign up**. O administrador convida cada pessoa pelo painel. Configure o serviço SMTP para receber os convites e a recuperação em endereços externos à equipe do Supabase.
4. Na opção **Connect** do projeto, copie a **Project URL** e a **Publishable key**. A chave administrativa, identificada como **Secret** ou **service_role**, fica no Supabase.

### 2. Importar o GitHub na Vercel

1. Abra **Add New → Project**, importe o repositório **Agenda-RH** e confira o preset **TanStack Start** e o diretório raiz do projeto. Mantenha as configurações automáticas de build e saída.
2. Em **Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Project URL do Supabase |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key do Supabase |

3. Clique em **Deploy**. Use a URL final da Vercel na configuração de autenticação do passo seguinte.

### 3. Configurar os e-mails de acesso

No Supabase, abra **Authentication → URL Configuration**. Defina **Site URL** como o domínio da Vercel, sem barra no final. Em **Redirect URLs**, adicione a URL completa de recuperação, como `https://seu-app.vercel.app/reset-password`. Para desenvolvimento, use outro ambiente Supabase com seu próprio Site URL.

O convite funciona com o modelo padrão do Supabase. Deixe o **Site URL** apontando para a raiz da Agenda. Quando o Supabase retorna o convite para a Agenda, o app abre a tela de cadastro. Para usar os modelos personalizados abaixo, configure o SMTP próprio e edite o conteúdo em **Authentication → Email Templates**. O token é verificado quando a pessoa clica em **Continuar**.

**Invite user**

```html
<h2>Convite para a Agenda de RH</h2>
<p><a href="{{ .SiteURL }}/register?token_hash={{ .TokenHash }}">Concluir cadastro</a></p>
```

**Reset password**

```html
<h2>Redefina sua senha da Agenda de RH</h2>
<p><a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}">Definir nova senha</a></p>
```

Em **Authentication → Users → Add user → Send invitation**, envie um convite. A pessoa confirma o próprio e-mail pelo link e cadastra nome completo e senha. Teste convite, saída, login, recuperação e troca de senha com dados fictícios antes de começar a usar o app no trabalho.

## Configurar os anexos

A migração `supabase/migrations/202611250001_attachments.sql` configura o Storage.
Depois de aplicá-la, em **Storage → Buckets**, confira se `agenda-anexos` está privado,
com limite de 10 MB por arquivo e tipos PDF, XLS e XLSX. Mantenha o limite
global do Storage em pelo menos 10 MB para aplicar o limite do app.

Publique a versão da Agenda que contém a seção **Anexos**. Teste com um
documento fictício e, se possível, duas contas diferentes. A exclusão do evento
pode manter as tarefas e seus anexos ou apagar todo o conjunto, conforme a
opção marcada na confirmação.

## Convocações e certificados

A migração `202611260001_training_convocations.sql` acrescenta o histórico de
convocações às solicitações existentes e usa o bucket privado `agenda-anexos`
para guardar um PDF de certificado de até 10 MB por solicitação. A data de
treinamento cadastrada anteriormente é preservada. Na lista e nas exportações,
a data prevista do treinamento na convocação mais recente tem prioridade quando já existe histórico.

## Executar no computador

Use Node.js 24. Copie `.env.example` para `.env.local`, preencha as duas variáveis e rode:

```bash
npm install
npm run dev
npm run build
```

Cada conta acessa somente as próprias tarefas e projetos. A criação de projeto com tarefas usa uma única transação do Postgres. O banco novo começa vazio. Registros já existentes no Base44 precisam de uma migração separada, a partir dos CSVs exportados, com remapeamento de projetos, tarefas e proprietários. As contas precisam de novos convites no Supabase.
