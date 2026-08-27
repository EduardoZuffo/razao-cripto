# Livro-razão de criptoativos — Manual

---

## Em uma frase

É um caderno de contabilidade para criptomoedas: você registra cada compra, venda e troca que fez, e o sistema calcula sozinho quanto você tem, quanto pagou, quanto está ganhando ou perdendo, e quanto de imposto aquilo geraria.

---

## O problema que ele resolve

Imagine que você comprou Bitcoin três vezes ao longo do ano:

| Quando | Quanto | Preço | Total pago |
|---|---|---|---|
| Janeiro | 0,5 BTC | R$ 180.000 | R$ 90.000 |
| Fevereiro | 0,7 BTC | R$ 210.000 | R$ 147.000 |
| Junho | trocou 0,3 BTC por 100 SOL | — | — |

Agora responda, de cabeça:

- Quanto você pagou, em média, por cada Bitcoin que ainda tem?
- Aquela troca de junho gerou lucro? Quanto?
- Você precisa pagar imposto por causa dela?
- Quanto vale sua carteira hoje?

São quatro contas diferentes, todas dependentes umas das outras, e todas fáceis de errar. A troca de junho é a mais traiçoeira: muita gente acha que trocar cripto por cripto não gera imposto, mas gera — no Brasil isso é permuta, e permuta realiza lucro.

Este sistema faz essas quatro contas para você, a partir de uma coisa só: o registro do que aconteceu.

---

## A ideia central

Existe um princípio de contabilidade por trás de tudo aqui, e entender ele faz o resto ficar óbvio:

> **Você registra fatos. O sistema calcula consequências.**

Você **não** digita "tenho 0,9 BTC com preço médio de R$ 197.500". Você digita as compras e as vendas que aconteceram, e o saldo e o preço médio aparecem sozinhos.

Isso parece mais trabalhoso, mas é o contrário:

- Você nunca precisa refazer conta quando compra de novo
- O preço médio nunca fica errado por erro de digitação
- O sistema sabe *quando* cada coisa aconteceu, então consegue apurar imposto por mês e por ano
- Você tem um histórico auditável, que é justamente o que a Receita pode pedir

O nome "livro-razão" vem daí. É o livro contábil onde se registram os lançamentos de uma conta.

---

## As cinco telas

O painel é uma página só, dividida em cinco blocos, de cima para baixo.

### 1. Patrimônio

O resumo geral da sua carteira.

- **Valor de mercado** — quanto tudo que você tem vale agora
- **Custo de aquisição** — quanto você pagou por tudo isso
- **Resultado em aberto** — a diferença entre os dois. É o lucro que existe no papel mas ainda não foi realizado, porque você não vendeu
- **Variação 24 h** — quanto a carteira subiu ou caiu em dinheiro desde ontem
- **Composição** — a barra listrada mostra o peso de cada ativo na carteira
- **Evolução do patrimônio** — grava um ponto por dia de uso. A linha cheia é o valor de mercado, a tracejada é o custo. A distância entre elas é o seu resultado ao longo do tempo

Se você ainda não lançou nada, esta tela aparece vazia com um convite. É normal.

### 2. Razão geral

A lista dos ativos que você acompanha. Tem dois modos, escolhidos pelos botões no topo:

**Cotações** — o mercado. Preço, variação em 24 h, 7 e 30 dias, minigráfico da semana e capitalização. Serve para acompanhar, mesmo ativos que você não possui.

**Posições** — a sua carteira. Quantidade, preço médio, valor, custo, resultado, comprovação e participação. Todos esses números são calculados a partir do livro — não dá para editá-los aqui, e isso é proposital.

A coluna **Comprovação** merece atenção: ela mostra quanto do custo daquele ativo tem extrato ou nota por trás. Se aparecer 38%, significa que 62% do custo é estimativa. Nenhum outro sistema te conta isso.

Clicar numa linha abre a análise detalhada daquele ativo mais abaixo. O × remove o ativo da lista de acompanhamento.

### 3. Livro de lançamentos

O coração do sistema. Aqui você registra o que aconteceu.

Clique em **Novo lançamento**, escolha a operação, preencha e clique em Lançar. Os campos mudam conforme a operação escolhida — transferência não pergunta preço, permuta pergunta os dois ativos, operação em dólar pergunta o câmbio.

Abaixo do formulário fica a lista de tudo que você já registrou, do mais recente para o mais antigo.

### 4. Apuração fiscal

A simulação de imposto, sempre em reais. Duas tabelas separadas, porque **existem dois regimes diferentes**:

**Regime nacional** — operações feitas em corretora brasileira. Apuração mês a mês. Há uma faixa de isenção: se o total vendido no mês ficar abaixo do limite, não há imposto, mesmo com lucro. A tabela mostra "Isento" nesses meses.

**Regime exterior** — corretora estrangeira ou DeFi. Apuração no ano inteiro, alíquota fixa, e aqui os prejuízos abatem os lucros dentro do mesmo ano.

O aviso laranja no topo não é enfeite. Leia.

### 5. Conta analítica

A análise detalhada de um ativo por vez — aquele que você clicou na razão geral.

- Cotação atual e variações
- Sua posição naquele ativo, se houver
- Gráfico da semana, hora a hora
- Gráfico do ano, dia a dia, com opção de comparar até três ativos em índice base 100
- Seletor de período com atalhos ou datas específicas
- Série histórica em tabela, exportável em CSV

O **índice base 100** é útil e pouco conhecido: ele coloca todos os ativos no mesmo ponto de partida, então você vê quem rendeu mais em porcentagem, independente do preço de cada um.

---

## Primeiros passos

**1. Monte sua lista de ativos.**
Em "Gerenciar ativos e dados", use a busca para adicionar o que você tem ou quer acompanhar. Remova o que não interessa com o ×.

**2. Escolha a moeda.**
USD ou BRL, no canto superior direito. Isso muda só a exibição — a apuração fiscal é sempre em reais.

**3. Registre o que você já tem.**
Se você já tinha cripto antes de usar isto, veja a seção "Não lembro o que paguei" mais abaixo. Se está começando agora, é só lançar cada compra conforme fizer.

**4. Lance uma compra de teste.**
Novo lançamento → Compra → escolha o ativo, a data, quanto comprou e por quanto. Clique em Lançar. Veja o patrimônio aparecer.

**5. Exporte a carteira.**
Em "Gerenciar ativos e dados" → Exportar carteira. Guarde esse arquivo. Enquanto não existir sincronização em nuvem, ele é sua única cópia de segurança.

---

## As operações, uma a uma

### Compra
Você deu dinheiro e recebeu cripto. Aumenta a quantidade e o custo. A taxa da corretora entra no custo, porque faz parte do que você pagou pelo bem.

*Exemplo:* comprou 0,5 BTC a R$ 180.000 com R$ 90 de taxa → custo R$ 90.090.

### Venda
Você entregou cripto e recebeu dinheiro. Reduz a quantidade, baixa o custo proporcional e apura ganho. A taxa é descontada do que você recebeu.

*Exemplo:* preço médio de R$ 197.500 e você vende 0,2 BTC por R$ 500.000 cada. Recebeu R$ 100.000, o custo daquilo era R$ 39.500, então o ganho é R$ 60.500.

### Permuta (troca cripto por cripto)
Trocou um ativo por outro sem passar por dinheiro. **Gera imposto**, porque o lucro do ativo entregue se realiza na troca.

Preencha o ativo entregue, quanto entregou, o ativo recebido, quanto recebeu, e o **valor total da operação** em reais. O sistema cria dois lançamentos amarrados: uma saída, que apura o ganho, e uma entrada, que forma o custo do novo ativo.

*Exemplo:* entregou 0,3 BTC que custaram R$ 59.250 e recebeu 100 SOL numa operação avaliada em R$ 120.000. Ganho de R$ 60.750 no Bitcoin, e as 100 SOL entram com custo de R$ 120.000, ou R$ 1.200 cada.

Apagar uma perna apaga a outra. É um fato só.

### Rendimento e Airdrop
Você recebeu cripto sem pagar por ela — staking, juros, cashback, distribuição gratuita. Entra pelo **valor de mercado na data**, e esse valor vira o custo de aquisição daquelas moedas.

### Transferência recebida / enviada
Movimentação entre carteiras suas — sacar da corretora para uma wallet, por exemplo. **Não altera nada**: não é compra, não é venda, não muda saldo nem custo. Fica registrada só para o histórico ficar completo.

Não use isso para registrar envio a terceiros.

### Taxa paga no ativo
Taxa de rede descontada na própria moeda. Reduz a quantidade e baixa o custo proporcional, sem gerar ganho.

### Perda definitiva
Chave perdida, corretora que quebrou, projeto que evaporou. Reduz quantidade e custo, sem gerar ganho tributável.

---

## Operações em dólar

Quando você marca a moeda como USD, aparece um campo de **câmbio da data**. Preencha com a cotação do dólar no dia da operação, não a de hoje.

Isso não é preciosismo. Se você comprou a US$ 20.000 com dólar a R$ 5,00 e vendeu a US$ 25.000 com dólar a R$ 6,00, seu custo foi R$ 100.000 e sua venda foi R$ 150.000. O ganho de R$ 50.000 inclui a valorização do dólar — e ele é tributável.

A fonte oficial para o fisco é a PTAX do Banco Central, disponível no site do BC.

---

## "Não lembro o que paguei"

Este é o caso mais comum de quem já mexe com cripto há tempo, e o sistema foi desenhado para ele. Tente nesta ordem:

**1. Baixe o extrato da corretora.**
Binance, Mercado Bitcoin, Foxbit, NovaDAX e as demais permitem exportar o histórico completo de operações. Quase todo mundo pode recuperar isso e não sabe. Comece por aqui.

**2. Olhe sua declaração de IR do ano passado.**
Se você declarou cripto em Bens e Direitos, aquele valor **é** o seu custo de aquisição oficial. Já existe, é legalmente válido, e é grátis.

**3. Reconstrua pela data.**
Se você lembra mais ou menos quando comprou, procure a cotação daquele dia e use como preço. Marque a comprovação como **Reconstruído pela data**.

**4. Arbitre de memória.**
"Foi por volta de trinta mil." Marque como **Valor de memória**.

**5. Assuma custo desconhecido.**
Marque **Não sei o custo** e deixe o preço em zero. O sistema trata o custo como zero, o que **aumenta** o imposto apurado. É a saída conservadora: se errar, erra pagando a mais, nunca a menos.

Seja qual for o caminho, o sistema registra o nível de comprovação e mostra na tela. Uma carteira com 40% de comprovação continua funcionando — você só sabe o quanto pode confiar no resultado.

---

## Situações comuns

**Comprei o mesmo ativo várias vezes. Preciso fazer alguma coisa?**
Não. Lance cada compra e o preço médio se recalcula sozinho.

**Vendi mais do que tenho e o sistema recusou.**
Correto. Significa que falta registrar alguma aquisição anterior. Lance a compra que está faltando e tente de novo.

**Mandei Bitcoin da corretora para minha wallet. O que lanço?**
Transferência enviada, e depois transferência recebida. Nenhuma das duas altera seu saldo — servem só para o histórico.

**Vendi com prejuízo. O sistema conta isso?**
Sim, mas com cuidado. No regime nacional, por padrão o sistema **não** abate prejuízo do lucro — é a leitura conservadora. A coluna "Resultado líquido" mostra o número com abatimento, para você conferir com seu contador. No regime exterior, o abatimento é aplicado dentro do ano.

**Apaguei um lançamento por engano.**
Não há desfazer. Lance de novo. Por isso exporte a carteira com frequência.

**Troquei de computador e sumiu tudo.**
Os dados ficam no navegador, não numa conta. Use Exportar carteira no computador antigo e Importar no novo. Sincronização em nuvem está no plano, mas ainda não existe.

**Limpei o histórico do navegador.**
Se você apagou dados de sites, perdeu. Exporte com frequência.

---

## O que este sistema não é

- **Não é uma corretora.** Ele não compra, não vende, não guarda cripto. Só registra.
- **Não é conselho de investimento.** Não sugere o que comprar nem prevê preço.
- **Não é apuração fiscal oficial.** A seção de imposto é simulação, feita a partir do que você digitou. Antes de declarar ou pagar qualquer coisa, leve os números para um contador.
- **Não substitui seus comprovantes.** Guarde os extratos. O sistema organiza, mas quem comprova é o documento.

---

## Onde ficam os dados

Tudo é gravado no seu próprio navegador, na máquina que você está usando. Nada vai para servidor nenhum. Os únicos dados que saem do seu computador são consultas de preço à CoinGecko, que não incluem nada sobre você.

Isso tem uma vantagem — privacidade total — e uma desvantagem — não sincroniza entre aparelhos e some se você limpar o navegador.

**Exporte sua carteira regularmente.** É um arquivo pequeno com sua lista, seus lançamentos e o histórico de patrimônio.

---

## Glossário

**Alienação** — qualquer saída definitiva do ativo: venda ou permuta. É o que gera apuração de ganho.

**Custo de aquisição** — o que você pagou pelo bem, incluindo taxas. É o número que vai na declaração.

**Custo médio ponderado** — quando você compra o mesmo ativo várias vezes por preços diferentes, o custo de cada unidade vira a média ponderada de tudo. É o método usado no Brasil.

**Ganho de capital** — a diferença entre o que você recebeu na alienação e o custo daquilo. É a base do imposto.

**Permuta** — troca de um bem por outro sem dinheiro no meio. Gera imposto.

**Preço médio** — o mesmo que custo médio ponderado, por unidade.

**Regime nacional / exterior** — os dois conjuntos de regras, conforme a operação tenha sido feita em corretora brasileira ou estrangeira.

**Resultado em aberto** — lucro ou prejuízo que existe no papel porque o preço mudou, mas que ainda não foi realizado porque você não vendeu. Não gera imposto.

---

*Este manual descreve a versão em desenvolvimento. A seção de apuração fiscal produz simulações e não substitui orientação de profissional habilitado.*
