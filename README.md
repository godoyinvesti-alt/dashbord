# X1 Control

Painel completo (SaaS) para gestão de vendas 1 a 1 pelo WhatsApp — leads, funil de
vendas, follow-ups, pagamentos, produtos, campanhas, chips/números, metas,
financeiro, equipe e relatórios. Toda a interface é em português do Brasil.

> **X1 Control** é um nome temporário e pode ser trocado facilmente: a marca fica
> centralizada em `src/lib/constants.ts` (`APP_NAME`) e no componente
> `src/components/brand/logo.tsx`.

## Sumário

- [Stack utilizada](#stack-utilizada)
- [Como instalar](#como-instalar)
- [Como configurar o Supabase](#como-configurar-o-supabase)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar as migrações](#como-rodar-as-migrações)
- [Como inserir dados de demonstração](#como-inserir-dados-de-demonstração)
- [Como iniciar o projeto](#como-iniciar-o-projeto)
- [Como funciona o sistema de alerta de chips](#como-funciona-o-sistema-de-alerta-de-chips)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações conhecidas](#limitações-conhecidas)

## Stack utilizada

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + componentes no padrão shadcn/ui (escritos localmente, sem
  depender do registro externo do shadcn)
- **Lucide** para ícones
- **Supabase** (Postgres + Auth + Row Level Security) para banco de dados e
  autenticação
- **Recharts** para gráficos
- **React Hook Form** + **Zod** para formulários e validação
- **date-fns** com locale `pt-BR` e fuso horário `America/Sao_Paulo`
- **dnd-kit** para o quadro Kanban do funil
- **jsPDF** para exportação de relatórios em PDF

## Como instalar

```bash
npm install
```

## Como configurar o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a **Project URL** e a chave **anon
   public**.
3. Em **Project Settings → API**, copie também a chave **service_role** (usada
   apenas pelo script de seed, nunca no navegador).
4. Rode as migrações SQL (veja a seção abaixo) usando o SQL Editor do Supabase
   ou a CLI do Supabase.
5. Em **Authentication → URL Configuration**, adicione a URL da sua aplicação
   (ex.: `http://localhost:3000`) e o redirect
   `http://localhost:3000/auth/callback`.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Como rodar as migrações

As migrações estão em `supabase/migrations/`, em ordem:

1. `0001_schema.sql` — todas as tabelas, tipos enumerados e triggers de
   `updated_at`.
2. `0002_rls.sql` — Row Level Security: cada usuário só acessa dados dos
   workspaces aos quais pertence (via tabela `workspace_members`).
3. `0003_functions.sql` — funções de negócio: criação de workspace com etapas
   de funil padrão, atualização automática de chips ao registrar recarga ou
   incidente, histórico automático de mudança de etapa do lead e log de
   atividades.

**Opção A — SQL Editor do Supabase:** abra cada arquivo, cole o conteúdo no SQL
Editor do painel do Supabase e execute na ordem acima.

**Opção B — Supabase CLI:**

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Todas as migrações foram validadas rodando-as em sequência em um Postgres
local (incluindo a criação de workspace, o registro de recargas e de
incidentes de chip), garantindo que apliquem sem erros.

## Como inserir dados de demonstração

Com as migrações aplicadas e as variáveis de ambiente configuradas (incluindo
`SUPABASE_SERVICE_ROLE_KEY`), rode:

```bash
npm run seed
```

O script `scripts/seed.ts`:

- Cria (ou reaproveita) o usuário `demo@x1control.com.br` / senha `demo123456`.
- Cria o workspace **"Loja Demo X1"** com as etapas padrão do funil.
- Popula produtos, atendentes, campanhas/criativos, **12 chips cobrindo todos
  os estados de alerta** (recarregado recentemente, entre 21–30 dias, mais de
  30 dias, sem histórico de recarga, bloqueado, banido, com múltiplos
  incidentes, sem responsável), ~90 leads distribuídos pelas etapas do funil,
  follow-ups, vendas (incluindo upsells e reembolsos), despesas e metas.

Depois do seed, faça login com o e-mail e senha acima.

## Como iniciar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado
para `/login`. Crie uma conta em **/registrar** (ou use o usuário de
demonstração) — no primeiro acesso sem workspace, você será levado para
**/onboarding** para criar seu workspace.

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run lint    # eslint
npm run seed    # popular dados de demonstração
```

## Como funciona o sistema de alerta de chips

O módulo **Chips e Números** monitora dinamicamente a última recarga de cada
chip:

```
dias_desde_recarga = differenceInCalendarDays(hoje, last_recharge_date)
```

O cálculo usa o fuso horário `America/Sao_Paulo` e é sempre relativo à data
atual — nenhum número de dias é fixo no código, o nível de alerta é
recalculado a cada carregamento da página com base nos limites configurados
em **Configurações → Chips**:

| Nível | Condição padrão | Cor |
|---|---|---|
| Em dia | recarga há menos de 21 dias | verde |
| Atenção | recarga entre 21 e 30 dias | amarelo |
| Atrasado | recarga há mais de 30 dias | vermelho |
| Crítico | nenhuma recarga registrada | vermelho escuro |

Quando um chip está atrasado ou crítico, a linha da tabela fica destacada, um
ícone de alerta é exibido com a mensagem "Chip há mais de 30 dias sem
recarga." (ou "Nenhuma recarga registrada" quando aplicável) e uma
notificação é gerada automaticamente no sino de notificações.

Ao clicar em **Registrar recarga**, a data e o valor da última recarga do chip
são atualizados automaticamente (via trigger no banco de dados,
`chip_recharges` → `chips`), um registro de histórico é criado e o alerta de
atraso desaparece imediatamente. Da mesma forma, **Registrar queda** cria um
incidente, incrementa o contador de quedas do chip e pode alterar seu status —
tudo via trigger (`chip_incidents` → `chips`), garantindo consistência mesmo
que o registro seja feito por diferentes telas.

Os limites (21/30 dias, número de incidentes) são configuráveis por workspace
em **Configurações → Chips**.

## Estrutura do projeto

```
src/
  app/
    (rotas públicas)      login, registrar, recuperar-senha, redefinir-senha, onboarding
    dashboard/            layout protegido + uma pasta por seção do menu lateral
  components/
    ui/                   componentes base no padrão shadcn/ui (button, card, dialog...)
    layout/               shell do app (sidebar, topbar, notificações)
    <módulo>/              componentes específicos de cada seção (leads, chips, vendas...)
  lib/
    supabase/              clientes Supabase (browser, server, middleware)
    data/                  camada de acesso a dados (consultas Supabase)
    actions/                Server Actions (mutações: criar, atualizar, excluir)
    validations/            schemas Zod usados nos formulários e nas actions
    types.ts                modelos TypeScript de todas as entidades
    constants.ts             rótulos em português, opções de enum, navegação
    chip-alerts.ts           lógica do sistema de alerta de chips
    goal-calc.ts              cálculos de metas e projeções
supabase/
  migrations/               esquema SQL, RLS e funções de negócio
scripts/
  seed.ts                    script de dados de demonstração
```

## Limitações conhecidas

- **Sem worker agendado:** notificações automáticas (chips, follow-ups
  atrasados, pagamentos pendentes) são geradas sob demanda ao carregar a
  Visão Geral, com deduplicação de ~20h por tipo — em produção o ideal é
  mover essa geração para uma Supabase Edge Function agendada (cron).
- **Ambiente de build sem acesso a um projeto Supabase real:** o código foi
  validado com `next build`/`tsc --noEmit` e as migrações foram testadas em
  um Postgres local; a verificação end-to end em um projeto Supabase real
  (login, RLS em produção, e-mails de recuperação de senha) deve ser feita
  após a configuração das variáveis de ambiente.
- **Exportação em PDF** usa uma tabela simples (jsPDF); para relatórios com
  identidade visual mais elaborada, considere um serviço de geração de PDF
  dedicado.
