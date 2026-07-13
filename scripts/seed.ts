/**
 * Script de seed de dados de demonstração para o Controle X1.
 *
 * Uso:
 *   npm run seed
 *
 * Requer as variáveis de ambiente (arquivo .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Cria (ou reaproveita) um usuário de demonstração e popula chips (cobrindo
 * todos os status e cenários de alerta de recarga/aquecimento/banimento),
 * ativos de contingência, vendas, despesas e a meta do mês atual.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

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

const DEMO_EMAIL = "demo@controlex1.com.br";
const DEMO_SENHA = "demo123456";

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
];

const RESPONSAVEIS = ["Camila Rodrigues", "Pedro Alves", "Juliana Castro", "Marcos Vinícius", "Renata Silva"];

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

async function clearPreviousData(ownerId: string) {
  const tables = [
    "alerts",
    "chip_status_history",
    "chip_bans",
    "chip_recharges",
    "sales",
    "expenses",
    "goals",
    "contingency_assets",
    "chips",
  ];
  for (const table of tables) {
    await supabase.from(table).delete().eq("owner_id", ownerId);
  }
}

async function seed() {
  console.log("Iniciando seed de dados de demonstração...\n");

  const userId = await upsertDemoUser();
  await clearPreviousData(userId);

  await supabase
    .from("settings")
    .update({
      nome_negocio: "Operação Demo X1",
      dias_aquecimento_padrao: 21,
      dias_alerta_recarga: 30,
      minimo_chips_ativos: 5,
      limite_despesas_mensal: 9000,
      notificacoes_ativas: true,
    })
    .eq("owner_id", userId);
  console.log("✔ Configurações atualizadas");

  // ---------------------------------------------------------------------
  // Chips — cobrindo todos os status e cenários de alerta
  // ---------------------------------------------------------------------
  interface ChipSeed {
    nome: string;
    status:
      | "novo"
      | "em_aquecimento"
      | "aquecido"
      | "ativo"
      | "em_observacao"
      | "instavel"
      | "banido"
      | "em_recuperacao"
      | "inativo"
      | "descartado";
    diasInicioAquecimento: number | null;
    metaDias: number;
    diasUltimaRecarga: number | null;
    banimentos: number;
    quedas: number;
  }

  const chipsSeed: ChipSeed[] = [
    { nome: "Chip Vendas 01", status: "ativo", diasInicioAquecimento: 40, metaDias: 21, diasUltimaRecarga: 3, banimentos: 0, quedas: 0 },
    { nome: "Chip Vendas 02", status: "ativo", diasInicioAquecimento: 35, metaDias: 21, diasUltimaRecarga: 8, banimentos: 0, quedas: 1 },
    { nome: "Chip Vendas 03", status: "ativo", diasInicioAquecimento: 60, metaDias: 21, diasUltimaRecarga: 25, banimentos: 0, quedas: 0 },
    { nome: "Chip Vendas 04", status: "ativo", diasInicioAquecimento: 50, metaDias: 21, diasUltimaRecarga: 35, banimentos: 0, quedas: 2 },
    { nome: "Chip Vendas 05", status: "ativo", diasInicioAquecimento: 30, metaDias: 21, diasUltimaRecarga: null, banimentos: 0, quedas: 0 },
    { nome: "Chip Novo 01", status: "novo", diasInicioAquecimento: null, metaDias: 21, diasUltimaRecarga: 1, banimentos: 0, quedas: 0 },
    { nome: "Chip Aquecendo 01", status: "em_aquecimento", diasInicioAquecimento: 5, metaDias: 21, diasUltimaRecarga: 4, banimentos: 0, quedas: 0 },
    { nome: "Chip Aquecendo 02", status: "em_aquecimento", diasInicioAquecimento: 18, metaDias: 21, diasUltimaRecarga: 10, banimentos: 0, quedas: 1 },
    { nome: "Chip Aquecendo 03", status: "em_aquecimento", diasInicioAquecimento: 25, metaDias: 21, diasUltimaRecarga: 12, banimentos: 0, quedas: 0 },
    { nome: "Chip Aquecido 01", status: "aquecido", diasInicioAquecimento: 22, metaDias: 21, diasUltimaRecarga: 6, banimentos: 0, quedas: 0 },
    { nome: "Chip Observação 01", status: "em_observacao", diasInicioAquecimento: 45, metaDias: 21, diasUltimaRecarga: 15, banimentos: 1, quedas: 2 },
    { nome: "Chip Instável 01", status: "instavel", diasInicioAquecimento: 55, metaDias: 21, diasUltimaRecarga: 20, banimentos: 1, quedas: 4 },
    { nome: "Chip Banido 01", status: "banido", diasInicioAquecimento: 70, metaDias: 21, diasUltimaRecarga: 40, banimentos: 1, quedas: 1 },
    { nome: "Chip Banido 02", status: "banido", diasInicioAquecimento: 90, metaDias: 21, diasUltimaRecarga: 60, banimentos: 3, quedas: 5 },
    { nome: "Chip Recuperação 01", status: "em_recuperacao", diasInicioAquecimento: 65, metaDias: 21, diasUltimaRecarga: 22, banimentos: 2, quedas: 3 },
    { nome: "Chip Inativo 01", status: "inativo", diasInicioAquecimento: 100, metaDias: 21, diasUltimaRecarga: 90, banimentos: 0, quedas: 0 },
    { nome: "Chip Descartado 01", status: "descartado", diasInicioAquecimento: 120, metaDias: 21, diasUltimaRecarga: null, banimentos: 4, quedas: 6 },
  ];

  const operadoras = ["vivo", "claro", "tim", "oi", "algar"] as const;
  const motivosBanimento = [
    "Spam detectado pela plataforma",
    "Muitas mensagens em curto período",
    "Denúncia de usuários",
    "Uso de conteúdo proibido",
    "Comportamento automatizado suspeito",
  ];

  const chipIds: { id: string; nome: string }[] = [];

  for (const c of chipsSeed) {
    const { data: chip, error } = await supabase
      .from("chips")
      .insert({
        owner_id: userId,
        nome: c.nome,
        numero: `+55 11 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        operadora: pick([...operadoras]),
        data_ativacao: isoDate(daysAgo(c.diasInicioAquecimento ?? 10)),
        data_inicio_aquecimento: c.diasInicioAquecimento !== null ? isoDate(daysAgo(c.diasInicioAquecimento)) : null,
        meta_dias_aquecimento: c.metaDias,
        data_ultima_recarga: c.diasUltimaRecarga !== null ? isoDate(daysAgo(c.diasUltimaRecarga)) : null,
        valor_ultima_recarga: c.diasUltimaRecarga !== null ? randomInt(15, 40) : null,
        quantidade_quedas: c.quedas,
        status: c.status,
        responsavel: pick(RESPONSAVEIS),
        operacao_vinculada: pick(["Operação A", "Operação B", "Operação C"]),
        observacoes: "Chip de demonstração criado pelo script de seed.",
      })
      .select("id, nome")
      .single();

    if (error || !chip) {
      console.warn(`Aviso: falha ao criar chip ${c.nome}: ${error?.message}`);
      continue;
    }
    chipIds.push(chip);

    if (c.diasUltimaRecarga !== null) {
      await supabase.from("chip_recharges").insert({
        owner_id: userId,
        chip_id: chip.id,
        data: isoDate(daysAgo(c.diasUltimaRecarga)),
        valor: randomInt(15, 40),
        observacoes: "Recarga registrada via seed.",
      });
    }

    for (let i = 0; i < c.banimentos; i++) {
      const diasBan = randomInt(5, 80);
      const recuperado = i < c.banimentos - 1;
      await supabase.from("chip_bans").insert({
        owner_id: userId,
        chip_id: chip.id,
        data: isoDate(daysAgo(diasBan)),
        motivo: pick(motivosBanimento),
        plataforma: "WhatsApp",
        foi_recuperado: recuperado,
        data_recuperacao: recuperado ? isoDate(daysAgo(Math.max(diasBan - 5, 0))) : null,
        observacoes: recuperado ? "Número recuperado após revisão." : null,
      });
    }

    await supabase.from("chip_status_history").insert({
      owner_id: userId,
      chip_id: chip.id,
      status_anterior: null,
      status_novo: c.status,
      observacao: "Status inicial definido pelo seed.",
    });
  }
  console.log(`✔ ${chipIds.length} chips criados com histórico de recargas, banimentos e status`);

  // ---------------------------------------------------------------------
  // Ativos de contingência
  // ---------------------------------------------------------------------
  const tiposAtivo = [
    "whatsapp", "dispositivo", "perfil_facebook", "business_manager",
    "conta_anuncio", "pagina", "pixel", "dominio", "conta_instagram", "email",
  ] as const;
  const statusAtivo = ["disponivel", "em_preparacao", "em_uso", "em_observacao", "restrito", "banido", "inativo"] as const;

  const ativosRows = [];
  for (let i = 0; i < 24; i++) {
    const tipo = pick([...tiposAtivo]);
    ativosRows.push({
      owner_id: userId,
      nome: `${tipo.replace(/_/g, " ")} ${i + 1}`,
      tipo,
      identificador: `ID-${randomInt(10000, 99999)}`,
      status: pick([...statusAtivo]),
      responsavel: pick(RESPONSAVEIS),
      data_ativacao: isoDate(daysAgo(randomInt(5, 200))),
      operacao_vinculada: pick(["Operação A", "Operação B", "Operação C"]),
      observacoes: "Ativo de contingência criado pelo script de seed.",
    });
  }
  await supabase.from("contingency_assets").insert(ativosRows);
  console.log(`✔ ${ativosRows.length} ativos de contingência criados`);

  // ---------------------------------------------------------------------
  // Vendas (últimos 45 dias)
  // ---------------------------------------------------------------------
  const produtos = [
    "Curso Vendas no WhatsApp", "Ebook Copywriting Persuasivo", "Mentoria em Grupo",
    "Pack de Templates de Anúncios", "Curso Avançado de Funis", "Consultoria Individual",
  ];
  const formasPagamento = ["PIX", "Cartão de crédito", "Cartão de débito", "Boleto", "Dinheiro"];
  const origens = ["Instagram", "Meta Ads", "TikTok Ads", "Indicação", "Google", "Orgânico"];

  const vendasRows = [];
  for (let i = 0; i < 130; i++) {
    const dias = randomInt(0, 45);
    const valor = pick([47, 97, 127, 197, 297, 497]);
    const taxas = Math.round(valor * 0.05 * 100) / 100;
    const reembolso = Math.random() > 0.92 ? valor : 0;
    vendasRows.push({
      owner_id: userId,
      data: isoDate(daysAgo(dias)),
      valor_recebido: valor,
      produto: pick(produtos),
      cliente: pick(NOMES),
      chip_id: chipIds.length > 0 ? pick(chipIds).id : null,
      vendedor: pick(RESPONSAVEIS),
      origem_lead: pick(origens),
      forma_pagamento: pick(formasPagamento),
      taxas,
      reembolso,
      observacoes: null,
    });
  }
  await supabase.from("sales").insert(vendasRows);
  console.log(`✔ ${vendasRows.length} vendas criadas`);

  // ---------------------------------------------------------------------
  // Despesas
  // ---------------------------------------------------------------------
  const despesasSeed: { descricao: string; categoria: string; valor: number; diasAtras: number }[] = [
    { descricao: "Anúncios Meta Ads", categoria: "trafego_pago", valor: 2800, diasAtras: 3 },
    { descricao: "Anúncios TikTok Ads", categoria: "trafego_pago", valor: 1200, diasAtras: 6 },
    { descricao: "Assinatura CRM", categoria: "ferramentas", valor: 197, diasAtras: 10 },
    { descricao: "Assinatura de disparo em massa", categoria: "ferramentas", valor: 149, diasAtras: 12 },
    { descricao: "Compra de chips novos", categoria: "chips", valor: 340, diasAtras: 8 },
    { descricao: "Recargas do mês", categoria: "recargas", valor: 480, diasAtras: 2 },
    { descricao: "Comissão equipe de vendas", categoria: "comissoes", valor: 890, diasAtras: 5 },
    { descricao: "Salário atendente", categoria: "funcionarios", valor: 1800, diasAtras: 15 },
    { descricao: "Ferramenta de automação", categoria: "ferramentas", valor: 99, diasAtras: 20 },
    { descricao: "Recargas emergenciais", categoria: "recargas", valor: 210, diasAtras: 25 },
    { descricao: "Despesas administrativas", categoria: "outros", valor: 260, diasAtras: 18 },
  ];
  await supabase.from("expenses").insert(
    despesasSeed.map((d) => ({
      owner_id: userId,
      descricao: d.descricao,
      valor: d.valor,
      categoria: d.categoria,
      data: isoDate(daysAgo(d.diasAtras)),
      operacao_vinculada: pick(["Operação A", "Operação B", "Operação C"]),
      observacoes: null,
    }))
  );
  console.log(`✔ ${despesasSeed.length} despesas criadas`);

  // ---------------------------------------------------------------------
  // Meta do mês atual
  // ---------------------------------------------------------------------
  const inicioMes = new Date();
  inicioMes.setDate(1);
  await supabase.from("goals").insert({
    owner_id: userId,
    mes: isoDate(inicioMes),
    meta_faturamento: 25000,
    meta_lucro: 12000,
    meta_vendas: 150,
  });
  console.log("✔ Meta do mês atual criada");

  console.log("\nSeed concluído com sucesso!");
  console.log(`Acesse com o e-mail: ${DEMO_EMAIL} e senha: ${DEMO_SENHA}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nErro ao rodar o seed:", err);
    process.exit(1);
  });
