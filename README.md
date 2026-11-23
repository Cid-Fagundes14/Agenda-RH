# Agenda de RH

Aplicativo web para organizar tarefas do dia a dia, treinamentos obrigatórios e ações de desenvolvimento de lideranças. Feito para uso no navegador do computador, com versão de celular completa.

## Telas

- **Hoje** — tarefas de hoje, atrasadas, concluídas de hoje e eventos do dia.
- **Tarefas** — quadro com Para iniciar, Em andamento e Finalizado, com busca e filtros.
- **Projetos** — treinamentos e ações com evento e progresso do checklist.
- **Calendário** — visão mensal com a agenda do dia selecionado.
- **Minha conta** — nome, e-mail, troca de senha e saída.

## Regras de data

Todas as datas são de calendário (`AAAA-MM-DD`), sem horário, e o "hoje" é calculado no fuso `America/Sao_Paulo`. Isso evita que uma tarefa apareça no dia errado por conversão de fuso. As regras ficam centralizadas em `src/lib/dates.js`:

- tarefa com período aparece em todos os dias do intervalo, incluindo fins de semana;
- tarefa em aberto fica atrasada a partir do dia seguinte ao prazo final;
- tarefa concluída continua visível com check em todas as datas agendadas;
- evento e prazos de tarefas são independentes: o checklist segue aberto depois do fim do evento.

## Dados e acesso

Duas entidades: `Task` (tarefas) e `Project` (projetos, que também são os eventos). Cada registro pertence a quem o criou, e as regras de acesso garantem que cada conta só lê e altera os próprios registros; administradores da conta veem tudo.

A criação de projeto com checklist acontece em uma única operação no servidor (`src/lib/server-fns.js`). Se qualquer tarefa falhar, o projeto recém-criado é removido para não deixar registro parcial.

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
```

## Convites e senhas

O cadastro público fica desligado: o primeiro acesso e os seguintes são feitos por convite.

1. Abra **App Users** e convide o e-mail da pessoa com o papel `user` (ou `admin`).
2. A pessoa recebe o convite, define a senha e cai direto na tela **Hoje**.
3. "Esqueci minha senha" envia um link temporário para redefinir a senha. Links expirados ou já usados mostram uma mensagem com a opção de pedir outro.

O envio de e-mails (convite e recuperação) usa o serviço configurado na plataforma, com o endereço de remetente do app.

## Publicação

Use o botão **Publicar** no editor. Depois de publicado, o app fica disponível no endereço da plataforma e pode receber um domínio próprio em **Domínios**.

## Observações

- O projeto está versionado no Git da plataforma; a sincronização com um repositório GitHub é feita pela integração de repositório da plataforma.
- A autenticação e o banco são os da plataforma (com as regras de acesso por conta descritas acima), não um projeto Supabase externo. Para levar o código para Supabase + Vercel seria necessário reescrever a camada de autenticação e o acesso a dados.
