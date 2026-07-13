# Controle X1

Painel completo para gestão de operações de chips: chips e aquecimento, ativos de
contingência, vendas, financeiro e alertas operacionais. Toda a interface é em
português do Brasil.

## Sumário

- [Stack utilizada](#stack-utilizada)
- [Como instalar](#como-instalar)
- [Como configurar o Supabase](#como-configurar-o-supabase)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar as migrações](#como-rodar-as-migrações)
- [Como inserir dados de demonstração](#como-inserir-dados-de-demonstração)
- [Como iniciar o projeto](#como-iniciar-o-projeto)
- [Como funciona o sistema de alertas](#como-funciona-o-sistema-de-alertas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações conhecidas](#limitações-conhecidas)

## Stack utilizada

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + componentes no padrão shadcn/ui (escritos localmente, sem
  depender do registro externo do shadcn)
- **Lucide** para ícones
- **Supabase** (Postgres + Auth + Row Level Security) para banco de dados e
  autenticação — cada usuário só acessa os próprios dados (`owner_id = auth.uid()`)
- **Recharts** para gráficos
- **React Hook Form** + **Zod** para formulários e validação
- **next-themes** para tema claro/escuro/sistema
- **date-fns** com locale `pt-BR`

## Como instalar

```bash
npm install
```

## Como configurar o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a **Project URL** e a chave **anon
   public**.
3. Copie também a chave **service_role** (usada apenas pelo script de seed,
   nunca no navegador).
4. Rode as migrações SQL (veja a seção abaixo).
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

1. `0001_schema.sql` — tabelas, tipos enumerados e triggers de `updated_at`,
   além do trigger que cria `profiles`/`settings` automaticamente no cadastro.
2. `0002_rls.sql` — Row Level Security: cada usuário só acessa as próprias
   linhas (`owner_id = auth.uid()`) em todas as tabelas.
3. `0003_functions.sql` — funções RPC usadas pelas ações rápidas de chips:
   registrar recarga, alterar status, registrar banimento e registrar
   recuperação (cada uma atualiza o chip e grava o histórico numa única
   transação).

**Opção A — SQL Editor do Supabase:** abra cada arquivo, cole o conteúdo no SQL
Editor do painel do Supabase e execute na ordem acima.

**Opção B — Supabase CLI:**

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

## Como inserir dados de demonstração

Com as migrações aplicadas e as variáveis de ambiente configuradas (incluindo
`SUPABASE_SERVICE_ROLE_KEY`), rode:

```bash
npm run seed
```

O script `scripts/seed.ts`:

- Cria (ou reaproveita) o usuário `demo@controlex1.com.br` / senha `demo123456`.
- Popula **17 chips cobrindo todos os status** (novo, em aquecimento, aquecido,
  ativo, em observação, instável, banido, em recuperação, inativo, descartado)
  e todos os cenários de alerta de recarga (em dia, atenção, atrasado, crítico),
  com histórico de recargas, banimentos (incluindo recuperados e não
  recuperados) e mudanças de status.
- Popula ~24 ativos de contingência cobrindo todos os tipos e status.
- Cria ~130 vendas distribuídas nos últimos 45 dias, despesas em todas as
  categorias e a meta do mês atual.

Depois do seed, faça login com o e-mail e senha acima.

## Como iniciar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado
para `/login`. Crie uma conta em **/registrar** (ou use o usuário de
demonstração) — o perfil e as configurações padrão são criados automaticamente
no cadastro (trigger `handle_new_user`).

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run lint    # eslint
npm run seed    # popular dados de demonstração
```

## Como funciona o sistema de alertas

A cada carregamento do painel (`/dashboard`), o servidor roda
`generateAlerts()` (`src/lib/alerts/generate.ts`), que verifica, para o usuário
autenticado:

| Alerta | Condição |
|---|---|
| Chip sem recarga | dias desde a última recarga > `dias_alerta_recarga` (padrão 30) |
| Aquecimento concluído | dias de aquecimento ≥ meta do chip, status ainda "Em aquecimento" |
| Chip banido | status do chip é "Banido" |
| Banimentos repetidos | chip com 3 ou mais banimentos no histórico |
| Poucos chips ativos | total de chips com status "Ativo" abaixo do mínimo configurado |
| Meta atrasada | faturamento do mês abaixo do ritmo necessário para a meta configurada |
| Despesas acima do limite | despesas do mês acima do limite configurado |

Cada verificação evita duplicar um alerta já aberto (não resolvido) do mesmo
tipo para a mesma entidade. Os alertas aparecem no sino de notificações, na
seção **Atenção necessária** do dashboard e na página **Alertas**, com níveis
Informativo/Atenção/Importante/Crítico. Os limites usados (dias de aquecimento,
dias de alerta de recarga, mínimo de chips ativos, limite de despesas, metas
mensais) são configuráveis em **Configurações**.

Em produção, o ideal é mover essa verificação para uma Supabase Edge Function
agendada (cron) em vez de rodar a cada carregamento do dashboard — veja
limitações conhecidas.

## Estrutura do projeto

```
src/
  app/
    (rotas públicas)      login, registrar, recuperar-senha, redefinir-senha
    dashboard/            layout protegido (sidebar desktop + bottom nav mobile)
      chips/               lista + detalhe (aquecimento, recargas, banimentos, histórico)
      contingencia/         ativos de contingência
      vendas/               registro rápido de vendas
      financeiro/           despesas, resumo financeiro e progresso de metas
      alertas/              lista de alertas operacionais
      configuracoes/        negócio, chips/alertas, metas, notificações, tema
  components/
    ui/                   componentes base no padrão shadcn/ui
    layout/               shell do app (sidebar, bottom nav, sino de alertas)
    <módulo>/              componentes específicos de cada seção
  lib/
    supabase/              clientes Supabase (browser, server, middleware)
    data/                  camada de acesso a dados (consultas Supabase)
    actions/                Server Actions (mutações)
    validations/            schemas Zod
    types.ts                modelos TypeScript de todas as entidades
    constants.ts             rótulos em português, opções de enum, navegação
    chip-calc.ts             cálculos de aquecimento e alerta de recarga
    goal-calc.ts              cálculos de metas e projeções
    alerts/generate.ts        geração automática de alertas
supabase/
  migrations/               esquema SQL, RLS e funções RPC
scripts/
  seed.ts                    script de dados de demonstração
```

## Limitações conhecidas

- **Sem worker agendado:** alertas automáticos são gerados sob demanda ao
  carregar o Dashboard — em produção o ideal é mover essa geração para uma
  Supabase Edge Function agendada (cron).
- **Ambiente de build sem acesso a um projeto Supabase real:** o código foi
  validado com `next build`/`tsc --noEmit`; a verificação end-to-end em um
  projeto Supabase real (login, RLS em produção, e-mails de recuperação de
  senha) deve ser feita após a configuração das variáveis de ambiente.
