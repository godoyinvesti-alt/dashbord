/**
 * Script de seed de dados de demonstração para o X1 Control.
 *
 * Uso:
 *   npm run seed
 *
 * Requer as variáveis de ambiente (arquivo .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * O script cria (ou reaproveita) um usuário de demonstração, um
 * workspace de exemplo e popula todas as tabelas com dados realistas
 * em português, incluindo os cenários de alerta de chips necessários
 * para validar as cores verde/amarelo/vermelho/vermelho-escuro.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local antes de rodar o seed."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@x1control.com.br";
const DEMO_SENHA = "demo123456";
const DEMO_SLUG = "loja-demo-x1";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NOMES = [
  "Ana Souza", "Bruno Almeida", "Carla Ferreira", "Diego Santos", "Elaine Costa",
  "Fábio Lima", "Gabriela Rocha", "Henrique Melo", "Isabela Martins", "João Pereira",
  "Karina Duarte", "Lucas Barbosa", "Mariana Ribeiro", "Nathan Carvalho", "Otávio Nunes",
  "Patrícia Gomes", "Rafael Teixeira", "Sabrina Dias", "Thiago Correia", "Vanessa Moura",
  "William Cardoso", "Yasmin Freitas", "Zeca Monteiro", "Beatriz Andrade", "Caio Vieira",
  "Débora Farias", "Eduardo Pinto", "Fernanda Azevedo", "Gustavo Reis", "Helena Batista",
];

async function upsertDemoUser(): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log(`Usuário de demonstração já existe: ${DEMO_EMAIL}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_SENHA,
    email_confirm: true,
    user_metadata: { nome: "Usuário Demonstração" },
  });

  if (error || !data.user) {
    throw new Error(`Não foi possível criar o usuário de demonstração: ${error?.message}`);
  }
  console.log(`Usuário de demonstração criado: ${DEMO_EMAIL} / senha: ${DEMO_SENHA}`);
  return data.user.id;
}

async function upsertWorkspace(userId: string): Promise<string> {
  const { data: existing } = await supabase.from("workspaces").select("id").eq("slug", DEMO_SLUG).maybeSingle();
  if (existing) {
    console.log("Workspace de demonstração já existe, reutilizando.");
    return existing.id;
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ nome: "Loja Demo X1", slug: DEMO_SLUG, meta_faturamento_mensal: 30000 })
    .select("id")
    .single();
  if (error || !workspace) throw new Error(`Erro ao criar workspace: ${error?.message}`);

  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    papel: "administrador",
  });

  const stageNames = [
    "Lead recebido", "Primeira mensagem enviada", "Lead respondeu",
    "Apresentação enviada", "Oferta apresentada", "PIX enviado",
    "Aguardando pagamento", "Pagamento confirmado", "Produto entregue",
    "Upsell oferecido", "Upsell comprado",
  ];
  await supabase.from("funnel_stages").insert(
    stageNames.map((nome, i) => ({ workspace_id: workspace.id, nome, ordem: i, padrao: true }))
  );

  await supabase.from("settings").insert({ workspace_id: workspace.id });

  console.log("Workspace de demonstração criado.");
  return workspace.id;
}

async function seed() {
  console.log("Iniciando seed de dados de demonstração...\n");

  const userId = await upsertDemoUser();
  const workspaceId = await upsertWorkspace(userId);

  const { data: stages } = await supabase
    .from("funnel_stages")
    .select("id, nome, ordem")
    .eq("workspace_id", workspaceId)
    .order("ordem");
  if (!stages || stages.length === 0) throw new Error("Etapas do funil não encontradas.");

  // ---------------------------------------------------------------------
  // Produtos
  // ---------------------------------------------------------------------
  const produtosSeed = [
    { nome: "Curso Vendas no WhatsApp", categoria: "Curso", preco: 97, custo: 8 },
    { nome: "Ebook Copywriting Persuasivo", categoria: "Ebook", preco: 47, custo: 3 },
    { nome: "Mentoria em Grupo - Tráfego Pago", categoria: "Mentoria", preco: 497, custo: 40 },
    { nome: "Pack de Templates de Anúncios", categoria: "Template", preco: 27, custo: 2 },
    { nome: "Curso Avançado de Funis de Venda", categoria: "Curso", preco: 197, custo: 15 },
    { nome: "Consultoria Individual 1h", categoria: "Consultoria", preco: 350, custo: 0 },
  ];
  const { data: produtos } = await supabase
    .from("products")
    .insert(
      produtosSeed.map((p) => ({
        workspace_id: workspaceId,
        nome: p.nome,
        categoria: p.categoria,
        descricao: `${p.nome} — produto digital de demonstração.`,
        preco_principal: p.preco,
        custo: p.custo,
        status: "ativo",
        link_entrega: "https://exemplo.com/entrega",
      }))
    )
    .select("id, nome, preco_principal");
  if (!produtos) throw new Error("Falha ao inserir produtos.");
  console.log(`✔ ${produtos.length} produtos criados`);

  // ---------------------------------------------------------------------
  // Agentes
  // ---------------------------------------------------------------------
  const agentesSeed = [
    { nome: "Camila Rodrigues", papel: "gestor" as const },
    { nome: "Pedro Alves", papel: "atendente" as const },
    { nome: "Juliana Castro", papel: "atendente" as const },
    { nome: "Marcos Vinícius", papel: "atendente" as const },
    { nome: "Renata Silva", papel: "financeiro" as const },
  ];
  const { data: agentes } = await supabase
    .from("agents")
    .insert(
      agentesSeed.map((a) => ({
        workspace_id: workspaceId,
        nome: a.nome,
        email: `${a.nome.split(" ")[0].toLowerCase()}@lojademo.com.br`,
        whatsapp: `55119${randomInt(70000000, 99999999)}`,
        papel: a.papel,
        status: "ativo",
      }))
    )
    .select("id, nome");
  if (!agentes) throw new Error("Falha ao inserir agentes.");
  console.log(`✔ ${agentes.length} atendentes criados`);

  // ---------------------------------------------------------------------
  // Campanhas, conjuntos de anúncios e criativos
  // ---------------------------------------------------------------------
  const campanhasSeed = [
    { nome: "Campanha Black Friday", plataforma: "meta_ads" as const, investido: 3500 },
    { nome: "Campanha Lançamento Curso", plataforma: "meta_ads" as const, investido: 2200 },
    { nome: "Campanha TikTok Alcance", plataforma: "tiktok_ads" as const, investido: 1400 },
    { nome: "Campanha Google Pesquisa", plataforma: "google_ads" as const, investido: 900 },
  ];
  const { data: campanhas } = await supabase
    .from("campaigns")
    .insert(
      campanhasSeed.map((c) => ({
        workspace_id: workspaceId,
        nome: c.nome,
        plataforma: c.plataforma,
        valor_investido: c.investido,
        data_inicio: isoDate(daysAgo(45)),
        data_fim: isoDate(daysAgo(1)),
      }))
    )
    .select("id, nome");
  if (!campanhas) throw new Error("Falha ao inserir campanhas.");
  console.log(`✔ ${campanhas.length} campanhas criadas`);

  const criativosSeed = [
    { nome: "Criativo 01 - Depoimento", hook: "Veja como triplicamos as vendas em 30 dias" },
    { nome: "Criativo 02 - Oferta direta", hook: "Só hoje: 50% de desconto" },
    { nome: "Criativo 03 - Dor do cliente", hook: "Cansado de vender pouco no WhatsApp?" },
    { nome: "Criativo 04 - Prova social", hook: "Mais de 3.000 alunos satisfeitos" },
    { nome: "Criativo 05 - Curiosidade", hook: "O segredo que ninguém te conta sobre tráfego" },
  ];
  const criativosRows: { workspace_id: string; campaign_id: string; nome: string; hook: string; valor_investido: number }[] = [];
  for (const c of criativosSeed) {
    criativosRows.push({
      workspace_id: workspaceId,
      campaign_id: pick(campanhas).id,
      nome: c.nome,
      hook: c.hook,
      valor_investido: randomInt(200, 1200),
    });
  }
  const { data: criativos } = await supabase.from("creatives").insert(criativosRows).select("id, nome, campaign_id");
  if (!criativos) throw new Error("Falha ao inserir criativos.");
  console.log(`✔ ${criativos.length} criativos criados`);

  // ---------------------------------------------------------------------
  // Chips — cobrindo todos os estados de alerta
  // ---------------------------------------------------------------------
  interface ChipSeed {
    name: string;
    status: "ativo" | "em_aquecimento" | "bloqueado" | "banido" | "em_recuperacao" | "desativado";
    diasUltimaRecarga: number | null;
    agentIndex: number | null;
    incidentes: number;
  }
  const chipsSeed: ChipSeed[] = [
    { name: "Vendas 01", status: "ativo", diasUltimaRecarga: 4, agentIndex: 1, incidentes: 0 },
    { name: "Vendas 02", status: "ativo", diasUltimaRecarga: 2, agentIndex: 2, incidentes: 0 },
    { name: "Vendas 03", status: "ativo", diasUltimaRecarga: 25, agentIndex: 1, incidentes: 1 },
    { name: "Vendas 04", status: "ativo", diasUltimaRecarga: 28, agentIndex: 3, incidentes: 0 },
    { name: "Vendas 05", status: "ativo", diasUltimaRecarga: 37, agentIndex: 2, incidentes: 1 },
    { name: "Vendas 06", status: "em_aquecimento", diasUltimaRecarga: 45, agentIndex: null, incidentes: 2 },
    { name: "Vendas 07", status: "em_aquecimento", diasUltimaRecarga: null, agentIndex: 3, incidentes: 0 },
    { name: "Suporte 01", status: "bloqueado", diasUltimaRecarga: 12, agentIndex: 1, incidentes: 2 },
    { name: "Suporte 02", status: "banido", diasUltimaRecarga: 50, agentIndex: 2, incidentes: 3 },
    { name: "Recuperação 01", status: "em_recuperacao", diasUltimaRecarga: 18, agentIndex: 3, incidentes: 4 },
    { name: "Backup 01", status: "desativado", diasUltimaRecarga: 70, agentIndex: null, incidentes: 1 },
    { name: "Vendas 08", status: "ativo", diasUltimaRecarga: 8, agentIndex: 1, incidentes: 0 },
  ];

  const operadoras = ["vivo", "claro", "tim", "algar"] as const;
  const incidentTypes = [
    "whatsapp_desconectado", "whatsapp_bloqueado", "whatsapp_banido",
    "numero_sem_sinal", "problema_recarga", "outro",
  ] as const;

  for (const c of chipsSeed) {
    const carrier = pick([...operadoras]);
    const { data: chip, error } = await supabase
      .from("chips")
      .insert({
        workspace_id: workspaceId,
        name: c.name,
        phone_number: `5511${randomInt(900000000, 999999999)}`,
        carrier,
        activation_date: isoDate(daysAgo(120)),
        status: c.status,
        assigned_agent_id: c.agentIndex !== null ? agentes[c.agentIndex].id : null,
        operation_name: "Vendas WhatsApp",
      })
      .select("id")
      .single();
    if (error || !chip) {
      console.warn(`Aviso: falha ao criar chip ${c.name}: ${error?.message}`);
      continue;
    }

    if (c.diasUltimaRecarga !== null) {
      await supabase.from("chip_recharges").insert({
        workspace_id: workspaceId,
        chip_id: chip.id,
        recharge_date: isoDate(daysAgo(c.diasUltimaRecarga)),
        amount: randomInt(15, 40),
        carrier,
        payment_method: "PIX",
        created_by: userId,
      });
    }

    for (let i = 0; i < c.incidentes; i++) {
      await supabase.from("chip_incidents").insert({
        workspace_id: workspaceId,
        chip_id: chip.id,
        incident_type: pick([...incidentTypes]),
        incident_date: daysAgo(randomInt(1, 40)).toISOString(),
        reason: "Ocorrência registrada durante uso normal da operação.",
        new_status: c.status,
        action_taken: "Chip monitorado e reiniciado.",
        created_by: userId,
      });
    }
  }
  console.log(`✔ ${chipsSeed.length} chips criados com histórico de recargas e incidentes`);

  const { data: chips } = await supabase.from("chips").select("id, name").eq("workspace_id", workspaceId);
  if (!chips) throw new Error("Falha ao carregar chips.");

  // ---------------------------------------------------------------------
  // Leads
  // ---------------------------------------------------------------------
  const temperaturas = ["frio", "morno", "quente", "muito_quente"] as const;
  const origens = ["meta_ads", "tiktok_ads", "google_ads", "organico", "indicacao"] as const;
  const statusPagamentos = [
    "nao_enviado", "pix_enviado", "aguardando_pagamento", "pagamento_confirmado",
    "pagamento_parcial", "reembolsado", "cancelado",
  ] as const;

  const leadsRows = [];
  const totalLeads = 90;
  for (let i = 0; i < totalLeads; i++) {
    const nome = pick(NOMES) + (Math.random() > 0.7 ? ` ${randomInt(2, 99)}` : "");
    const stageIndex = Math.min(
      Math.floor(Math.pow(Math.random(), 1.6) * stages.length),
      stages.length - 1
    );
    const stage = stages[stageIndex];
    const produto = pick(produtos);
    const statusPagamento =
      stageIndex >= 7 ? pick(["pagamento_confirmado", "pagamento_parcial", "reembolsado"]) : pick([...statusPagamentos]);
    const valorEsperado = Number(produto.preco_principal);
    const recebeuPagamento = statusPagamento === "pagamento_confirmado" || statusPagamento === "pagamento_parcial";
    const valorRecebido = recebeuPagamento
      ? statusPagamento === "pagamento_parcial"
        ? Math.round(valorEsperado * 0.5 * 100) / 100
        : Math.round((valorEsperado + (Math.random() > 0.8 ? 0.1 : 0)) * 100) / 100
      : 0;
    const entrada = daysAgo(randomInt(0, 60));
    const teveInteracao = Math.random() > 0.15;

    leadsRows.push({
      workspace_id: workspaceId,
      nome,
      whatsapp: `5511${randomInt(900000000, 999999999)}`,
      email: Math.random() > 0.4 ? `${nome.split(" ")[0].toLowerCase()}${randomInt(1, 999)}@email.com` : null,
      data_entrada: entrada.toISOString(),
      produto_interesse_id: produto.id,
      origem: pick([...origens]),
      campaign_id: pick(campanhas).id,
      creative_id: pick(criativos).id,
      agent_id: pick(agentes).id,
      chip_id: pick(chips).id,
      funnel_stage_id: stage.id,
      temperatura: pick([...temperaturas]),
      ultima_interacao: teveInteracao ? daysAgo(randomInt(0, 10)).toISOString() : null,
      proximo_followup: Math.random() > 0.5 ? daysAgo(-randomInt(0, 7)).toISOString() : null,
      valor_esperado: valorEsperado,
      valor_recebido: valorRecebido,
      forma_pagamento: recebeuPagamento ? "PIX" : null,
      status_pagamento: statusPagamento,
      produto_entregue: statusPagamento === "pagamento_confirmado" && Math.random() > 0.2,
      upsell_oferecido: statusPagamento === "pagamento_confirmado" && Math.random() > 0.5,
      upsell_comprado: statusPagamento === "pagamento_confirmado" && Math.random() > 0.75,
      observacoes: Math.random() > 0.7 ? "Cliente demonstrou muito interesse durante a conversa." : null,
      tags: Math.random() > 0.6 ? [pick(["vip", "recorrente", "indicação", "promoção"])] : [],
      created_by: userId,
    });
  }
  const { data: leads } = await supabase.from("leads").insert(leadsRows).select("id, nome, produto_interesse_id, valor_esperado, valor_recebido, status_pagamento, agent_id, chip_id, campaign_id, creative_id");
  if (!leads) throw new Error("Falha ao inserir leads.");
  console.log(`✔ ${leads.length} leads criados em diferentes etapas do funil`);

  // ---------------------------------------------------------------------
  // Follow-ups
  // ---------------------------------------------------------------------
  const tiposFollowUp = [
    "primeiro_contato", "cobranca_pix", "confirmacao_pagamento",
    "entrega_produto", "upsell", "recompra", "recuperacao",
  ] as const;
  const followUpsRows = [];
  for (let i = 0; i < 40; i++) {
    const lead = pick(leads);
    const atrasado = Math.random() > 0.6;
    followUpsRows.push({
      workspace_id: workspaceId,
      lead_id: lead.id,
      agent_id: lead.agent_id,
      tipo: pick([...tiposFollowUp]),
      data_agendada: atrasado ? daysAgo(randomInt(1, 10)).toISOString() : daysAgo(-randomInt(0, 10)).toISOString(),
      status: Math.random() > 0.7 ? "concluido" : "pendente",
      observacoes: "Follow-up gerado automaticamente para demonstração.",
      created_by: userId,
    });
  }
  await supabase.from("follow_ups").insert(followUpsRows);
  console.log(`✔ ${followUpsRows.length} follow-ups criados`);

  // ---------------------------------------------------------------------
  // Vendas
  // ---------------------------------------------------------------------
  const leadsPagos = leads.filter((l) => Number(l.valor_recebido) > 0);
  const vendasRows = leadsPagos.map((lead) => {
    const desconto = Math.random() > 0.85 ? Math.round(Number(lead.valor_esperado) * 0.1 * 100) / 100 : 0;
    return {
      workspace_id: workspaceId,
      lead_id: lead.id,
      cliente_nome: lead.nome,
      product_id: lead.produto_interesse_id,
      preco_original: lead.valor_esperado,
      valor_esperado: lead.valor_esperado,
      valor_recebido: lead.valor_recebido,
      desconto,
      forma_pagamento: "PIX",
      data_pagamento: daysAgo(randomInt(0, 55)).toISOString(),
      campaign_id: lead.campaign_id,
      creative_id: lead.creative_id,
      agent_id: lead.agent_id,
      chip_id: lead.chip_id,
      upsell: Math.random() > 0.75,
      status_reembolso: lead.status_pagamento === "reembolsado" ? "reembolsado" : "nenhum",
      status_entrega: Math.random() > 0.15 ? "entregue" : "pendente",
      created_by: userId,
    };
  });
  // Vendas extras sem lead vinculado (ex.: vendas registradas manualmente)
  for (let i = 0; i < 8; i++) {
    const produto = pick(produtos);
    vendasRows.push({
      workspace_id: workspaceId,
      lead_id: null as unknown as string,
      cliente_nome: pick(NOMES),
      product_id: produto.id,
      preco_original: Number(produto.preco_principal),
      valor_esperado: Number(produto.preco_principal),
      valor_recebido: Number(produto.preco_principal),
      desconto: 0,
      forma_pagamento: pick(["PIX", "Cartão de crédito", "Boleto"]),
      data_pagamento: daysAgo(randomInt(0, 30)).toISOString(),
      campaign_id: pick(campanhas).id,
      creative_id: pick(criativos).id,
      agent_id: pick(agentes).id,
      chip_id: pick(chips).id,
      upsell: false,
      status_reembolso: "nenhum",
      status_entrega: "entregue",
      created_by: userId,
    });
  }
  await supabase.from("sales").insert(vendasRows);
  console.log(`✔ ${vendasRows.length} vendas criadas`);

  // ---------------------------------------------------------------------
  // Despesas
  // ---------------------------------------------------------------------
  const despesasSeed: { descricao: string; categoria: string; valor: number }[] = [
    { descricao: "Anúncios Meta Ads", categoria: "trafego_pago", valor: 3500 },
    { descricao: "Anúncios TikTok Ads", categoria: "trafego_pago", valor: 1400 },
    { descricao: "Assinatura CRM", categoria: "ferramentas", valor: 197 },
    { descricao: "Assinatura de disparo em massa", categoria: "ferramentas", valor: 149 },
    { descricao: "Comissão equipe de vendas", categoria: "comissoes", valor: 890 },
    { descricao: "Salário atendente", categoria: "funcionarios", valor: 1800 },
    { descricao: "Taxa gateway de pagamento", categoria: "plataforma", valor: 210 },
    { descricao: "Reembolso cliente insatisfeito", categoria: "reembolsos", valor: 97 },
    { descricao: "Recargas de chips", categoria: "outros", valor: 180 },
  ];
  const despesasRows = despesasSeed.map((d) => ({
    workspace_id: workspaceId,
    descricao: d.descricao,
    categoria: d.categoria,
    valor: d.valor,
    data: isoDate(daysAgo(randomInt(0, 40))),
    recorrente: ["ferramentas", "funcionarios"].includes(d.categoria),
    created_by: userId,
  }));
  await supabase.from("expenses").insert(despesasRows);
  console.log(`✔ ${despesasRows.length} despesas criadas`);

  // ---------------------------------------------------------------------
  // Metas
  // ---------------------------------------------------------------------
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  await supabase.from("goals").insert([
    {
      workspace_id: workspaceId,
      tipo: "faturamento_mensal",
      periodo_inicio: isoDate(inicioMes),
      periodo_fim: isoDate(fimMes),
      valor_meta: 30000,
    },
    {
      workspace_id: workspaceId,
      tipo: "numero_vendas",
      periodo_inicio: isoDate(inicioMes),
      periodo_fim: isoDate(fimMes),
      valor_meta: 80,
    },
    {
      workspace_id: workspaceId,
      tipo: "conversao",
      periodo_inicio: isoDate(inicioMes),
      periodo_fim: isoDate(fimMes),
      valor_meta: 8,
    },
  ]);
  console.log("✔ 3 metas criadas");

  console.log("\nSeed concluído com sucesso!");
  console.log(`Acesse com o e-mail: ${DEMO_EMAIL} e senha: ${DEMO_SENHA}`);
  console.log(`ID de referência do seed: ${randomUUID()}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nErro ao rodar o seed:", err);
    process.exit(1);
  });
