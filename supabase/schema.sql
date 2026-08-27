-- ═══════════════════════════════════════════════════════════════════════
--  LIVRO-RAZÃO DE CRIPTOATIVOS — esquema Supabase / PostgreSQL
--  Princípios:
--   1. Transações são o fato. Saldo, custo médio e resultado são derivados.
--   2. Todo custo carrega procedência e confiança — nunca fingimos precisão.
--   3. Nada é apagado de verdade: relatórios fiscais precisam ser reproduzíveis.
--   4. Dinheiro é NUMERIC, jamais float.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  TIPOS
-- ─────────────────────────────────────────────────────────────

create type tipo_lancamento as enum (
  'compra',              -- aquisição com desembolso em moeda fiduciária
  'venda',               -- alienação com recebimento em fiduciária
  'permuta_saida',       -- perna de saída de swap cripto→cripto (fato gerador no Brasil)
  'permuta_entrada',     -- perna de entrada do mesmo swap
  'transferencia_entrada', -- entra na custódia sem mudar custo (saque de exchange p/ wallet)
  'transferencia_saida',
  'rendimento',          -- staking, juros, cashback — entra com custo = valor de mercado na data
  'airdrop',
  'bonificacao',
  'taxa',                -- taxa de rede ou corretagem lançada isoladamente
  'perda'                -- rug pull, chave perdida, exchange quebrada
);

create type origem_dado as enum (
  'importado_corretora', -- CSV/API oficial da exchange
  'importado_onchain',   -- reconstruído de endereço público
  'declaracao_irpf',     -- veio da ficha Bens e Direitos do ano anterior
  'manual',              -- digitado pelo usuário com nota fiscal/extrato em mãos
  'reconstruido',        -- data lembrada + cotação histórica da data
  'abertura'             -- saldo de abertura sem custo conhecido
);

create type confianca_custo as enum (
  'documentado',  -- há comprovante: extrato, nota, declaração
  'estimado',     -- data conhecida, preço inferido da cotação histórica
  'arbitrado',    -- usuário arbitrou um valor de memória
  'ausente'       -- custo desconhecido; tratado como zero na apuração fiscal
);

create type metodo_custo as enum ('media_ponderada', 'peps');

-- ─────────────────────────────────────────────────────────────
--  PERFIL E CARTEIRAS
-- ─────────────────────────────────────────────────────────────

create table perfis (
  id            uuid primary key references auth.users on delete cascade,
  nome          text,
  moeda_base    char(3) not null default 'BRL',
  pais          char(2) not null default 'BR',
  plano         text not null default 'gratuito',
  criado_em     timestamptz not null default now()
);

create table carteiras (
  id            uuid primary key default uuid_generate_v4(),
  perfil_id     uuid not null references perfis on delete cascade,
  nome          text not null,
  metodo        metodo_custo not null default 'media_ponderada',
  -- Marco zero: data a partir da qual a performance é medida quando o custo
  -- histórico não pôde ser reconstruído. Separa "como estou indo" de "quanto devo".
  marco_zero    date,
  arquivada     boolean not null default false,
  criada_em     timestamptz not null default now()
);

create index on carteiras (perfil_id) where not arquivada;

-- ─────────────────────────────────────────────────────────────
--  ATIVOS (espelho local do catálogo do provedor de dados)
-- ─────────────────────────────────────────────────────────────

create table ativos (
  id             text primary key,        -- id da CoinGecko, ex.: 'bitcoin'
  simbolo        text not null,
  nome           text not null,
  rank_mercado   integer,
  atualizado_em  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
--  LANÇAMENTOS — a única fonte de verdade
-- ─────────────────────────────────────────────────────────────

create table lancamentos (
  id              uuid primary key default uuid_generate_v4(),
  carteira_id     uuid not null references carteiras on delete cascade,
  ativo_id        text not null references ativos,

  tipo            tipo_lancamento not null,
  ocorrido_em     timestamptz not null,

  quantidade      numeric(38,18) not null check (quantidade > 0),
  -- Preço e valores sempre na moeda do lançamento, mais o câmbio DA DATA.
  -- É isso que permite apuração fiscal correta em BRL sem reconverter tudo depois.
  preco_unitario  numeric(38,18),
  moeda           char(3) not null default 'BRL',
  cambio_brl      numeric(20,10),          -- BRL por unidade de `moeda` na data do fato
  taxa            numeric(38,18) not null default 0,

  origem          origem_dado not null default 'manual',
  confianca       confianca_custo not null default 'documentado',

  -- Amarra as duas pernas de um swap, para a permuta ser auditável como um fato só
  par_id          uuid references lancamentos on delete set null,

  -- Idempotência de importação: hash do registro na origem evita duplicar CSV
  hash_externo    text,
  corretora       text,
  observacao      text,

  criado_em       timestamptz not null default now(),
  removido_em     timestamptz,             -- exclusão lógica: relatórios continuam reproduzíveis

  constraint preco_obrigatorio check (
    tipo in ('transferencia_entrada','transferencia_saida','perda') or preco_unitario is not null
  ),
  constraint cambio_obrigatorio check (moeda = 'BRL' or cambio_brl is not null)
);

create unique index lancamentos_hash_unico
  on lancamentos (carteira_id, hash_externo) where hash_externo is not null;

create index lancamentos_apuracao
  on lancamentos (carteira_id, ativo_id, ocorrido_em) where removido_em is null;

-- ─────────────────────────────────────────────────────────────
--  CACHE DE COTAÇÕES HISTÓRICAS
--  Usado na reconstrução de custo e no cálculo do valor de mercado
--  na data de cada rendimento/airdrop. Evita re-consultar o provedor.
-- ─────────────────────────────────────────────────────────────

create table cotacoes_historicas (
  ativo_id   text not null references ativos,
  data       date not null,
  preco_usd  numeric(38,18) not null,
  fonte      text not null default 'coingecko',
  primary key (ativo_id, data)
);

create table cambio_diario (
  data       date primary key,
  brl_por_usd numeric(20,10) not null,
  fonte      text not null default 'bcb'   -- PTAX do Banco Central: fonte oficial p/ fisco
);

-- ─────────────────────────────────────────────────────────────
--  FOTOGRAFIAS DIÁRIAS DO PATRIMÔNIO
-- ─────────────────────────────────────────────────────────────

create table fotografias (
  carteira_id  uuid not null references carteiras on delete cascade,
  data         date not null,
  valor_usd    numeric(38,18) not null,
  custo_usd    numeric(38,18) not null,
  primary key (carteira_id, data)
);

-- ─────────────────────────────────────────────────────────────
--  IMPORTAÇÕES — rastreabilidade de cada arquivo processado
-- ─────────────────────────────────────────────────────────────

create table importacoes (
  id            uuid primary key default uuid_generate_v4(),
  carteira_id   uuid not null references carteiras on delete cascade,
  corretora     text not null,
  arquivo_nome  text,
  linhas_lidas  integer not null default 0,
  linhas_aceitas integer not null default 0,
  erros         jsonb not null default '[]'::jsonb,
  criada_em     timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════
--  SEGURANÇA EM NÍVEL DE LINHA
--  Isto é o que torna seguro expor a chave anon no front-end.
-- ═══════════════════════════════════════════════════════════════════════

alter table perfis          enable row level security;
alter table carteiras       enable row level security;
alter table lancamentos     enable row level security;
alter table fotografias     enable row level security;
alter table importacoes     enable row level security;

create policy "perfil próprio" on perfis
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "carteiras próprias" on carteiras
  for all using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

create policy "lançamentos das carteiras próprias" on lancamentos
  for all using (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  )) with check (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  ));

create policy "fotografias das carteiras próprias" on fotografias
  for all using (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  )) with check (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  ));

create policy "importações das carteiras próprias" on importacoes
  for all using (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  )) with check (exists (
    select 1 from carteiras c where c.id = carteira_id and c.perfil_id = auth.uid()
  ));

-- Catálogos são públicos para leitura, escrita só pelo serviço
alter table ativos               enable row level security;
alter table cotacoes_historicas  enable row level security;
alter table cambio_diario        enable row level security;

create policy "catálogo legível" on ativos              for select using (true);
create policy "cotações legíveis" on cotacoes_historicas for select using (true);
create policy "câmbio legível"    on cambio_diario       for select using (true);

-- ═══════════════════════════════════════════════════════════════════════
--  NOTA DE ARQUITETURA
--
--  O cálculo de custo médio, saldo e ganho de capital NÃO fica aqui.
--  Ele vive num módulo TypeScript puro (packages/engine), determinístico,
--  coberto por testes com casos reais. Motivos:
--
--   · pode rodar no navegador (resposta instantânea) e no servidor (relatórios);
--   · é testável com fixtures sem subir banco;
--   · a regra fiscal muda, e mudar código versionado é mais seguro que
--     mudar função no banco;
--   · permite reprocessar o histórico inteiro quando uma regra é corrigida.
--
--  O banco guarda fatos. O motor interpreta os fatos.
-- ═══════════════════════════════════════════════════════════════════════
