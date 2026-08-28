# Livro-razão de criptoativos — Manual

---

## Em uma frase

É um caderno de contabilidade para criptomoedas: você registra cada compra, venda e troca que fez, e o sistema calcula sozinho quanto você tem, quanto pagou, quanto está ganhando ou perdendo, e quanto de imposto aquilo geraria.

---

## O problema que ele resolve

Imagine que você comprou Bitcoin duas vezes e depois trocou parte por Solana:

| Quando | O que aconteceu |
|---|---|
| Janeiro | Comprou 0,5 BTC a R$ 180.000 |
| Fevereiro | Comprou 0,7 BTC a R$ 210.000 |
| Junho | Trocou 0,3 BTC por 100 SOL |

Agora responda, de cabeça:

- Quanto você pagou, em média, por cada Bitcoin que ainda tem?
- A troca de junho gerou lucro? Quanto?
- Você precisa pagar imposto por causa dela?
- Quanto vale sua carteira hoje?

São quatro contas diferentes, dependentes umas das outras, e todas fáceis de errar. A troca de junho é a mais traiçoeira: muita gente acha que trocar cripto por cripto não gera imposto. Gera — no Brasil isso é permuta, e permuta realiza lucro.

O sistema faz essas quatro contas a partir de uma coisa só: o registro do que aconteceu.

---

## A ideia central

> **Você registra fatos. O sistema calcula consequências.**

Você **não** digita "tenho 0,9 BTC com preço médio de R$ 197.500". Você digita as compras e a troca, e o saldo e o preço médio aparecem sozinhos.

Parece mais trabalhoso, mas é o contrário:

- Você nunca refaz conta quando compra de novo
- O preço médio nunca fica errado por erro de digitação
- O sistema sabe *quando* cada coisa aconteceu, então apura imposto por mês e por ano
- Você fica com um histórico auditável, que é o que a Receita pode pedir

O nome vem daí: livro-razão é o livro contábil onde se registram os lançamentos de uma conta.

---

## As cinco abas

No topo há uma barra fixa com o patrimônio, a variação de 24 h, o seletor de moeda e o botão **+ Lançar**. Abaixo dela, cinco abas.

### Carteira — "onde estou"

- **Valor de mercado** — quanto tudo vale agora
- **Custo de aquisição** — quanto você pagou
- **Resultado em aberto** — a diferença. É o lucro que existe no papel mas não foi realizado, porque você não vendeu
- **Variação 24 h** — quanto subiu ou caiu em dinheiro desde ontem
- **Composição** — a barra listrada mostra o peso de cada ativo
- **Evolução do patrimônio** — um ponto por dia de uso. A linha cheia é o valor, a tracejada é o custo. A distância entre elas é seu resultado ao longo do tempo
- **Posições** — a tabela detalhada por ativo

A coluna **Comprovação** mostra quanto do custo daquele ativo tem extrato ou nota por trás. Se aparecer 38%, significa que 62% do custo é estimativa.

No fim da aba fica **Cópia de segurança**, para exportar e importar seus dados.

### Mercado — "o que está acontecendo"

Cotações de tudo que você acompanha, mesmo o que não possui. Preço, variações de 24 h, 7 e 30 dias, minigráfico da semana e capitalização.

Aqui também ficam a busca para adicionar ativos e a edição da lista por texto. O botão **Copiar para planilha** leva símbolos e preços em formato colável.

### [Símbolo do ativo] — "como esse ativo se comporta"

Essa aba muda de nome conforme o ativo aberto. Clique em qualquer linha nas abas Carteira ou Mercado para chegar nela.

No topo há um trilho horizontal com todos os seus ativos — clique para trocar sem sair da tela, ou use as setas **←** e **→** do teclado.

Dentro dela: cotação e variações, sua posição naquele ativo, gráfico da semana hora a hora, gráfico do ano dia a dia, seletor de período e a série histórica em tabela, exportável em CSV.

O **índice base 100**, no gráfico anual, coloca até três ativos no mesmo ponto de partida — assim você vê quem rendeu mais em porcentagem, independente do preço de cada um.

### Livro — "o que eu fiz"

Todos os lançamentos, do mais recente para o mais antigo. É a fonte de tudo que aparece nas outras abas.

### Imposto — "quanto eu devo"

A simulação, sempre em reais, com os dois regimes separados. Detalhada mais abaixo.

---

## Já tenho criptomoedas. Como começo?

Este é o caso mais comum, e o sistema foi desenhado para ele. Sim, você lança como **compra**, na **data real**. A pergunta é quanta informação você tem.

### Caminho A — você tem o histórico

Baixe o extrato da corretora — Binance, Mercado Bitcoin, Foxbit, NovaDAX e as demais exportam isso — e lance cada compra na data que aconteceu, marcando **Tenho extrato**.

Dá trabalho uma vez e depois está certo para sempre: preço médio exato, apuração correta, comprovação em 100%.

### Caminho B — não tem, ou não vale o esforço

Um único lançamento por ativo, representando tudo que você tem hoje daquele ativo.

| Campo | O que preencher |
|---|---|
| Quantidade | O saldo atual, não o que comprou lá atrás |
| Preço unitário | O custo médio que você estima ter pagado |
| Data | A data aproximada, ou qualquer data anterior à primeira venda que for registrar |
| Comprovação | *Valor de memória* se lembra mais ou menos, *Não sei o custo* se não faz ideia |

### O erro mais comum

**Lançar a quantidade que tem com o preço de hoje.** Isso diz ao sistema que você pagou o preço atual, e o resultado fica zerado para sempre. Se você comprou BTC a R$ 90.000 e hoje vale R$ 600.000, esse lucro desaparece.

Se realmente não faz ideia, marque **Não sei o custo** com preço zero. Fiscalmente é conservador: o ganho apurado fica máximo, então você pagaria mais imposto, nunca menos.

### Por que a data importa

Se você nunca vender, ela não muda nada. Mas se vender, muda tudo — o custo médio é calculado na ordem cronológica.

E se você registrar uma venda de 2024 sem ter lançado a compra antes dela, o sistema recusa com "saldo insuficiente". Está correto: não dá para vender o que ainda não entrou no livro.

**Regra prática:** o lançamento de abertura precisa ter data anterior a qualquer venda que você registrar.

### A escada de reconstrução

Se você quer o custo mais correto possível, tente nesta ordem:

1. **Extrato da corretora.** Quase todo mundo pode recuperar e não sabe. Comece por aqui.
2. **Sua declaração de IR do ano passado.** Se você declarou cripto em Bens e Direitos, aquele valor **é** seu custo de aquisição oficial. Já existe, é válido, é grátis.
3. **Reconstrução pela data.** Lembra mais ou menos quando comprou? Procure a cotação daquele dia. Marque como *Reconstruído pela data*.
4. **Valor de memória.** "Foi por volta de trinta mil."
5. **Custo desconhecido.** Preço zero, marcado como *Não sei o custo*.

Seja qual for o caminho, o sistema registra o nível de comprovação e mostra na tela. Uma carteira com 40% de comprovação continua funcionando — você só sabe o quanto pode confiar no resultado.

---

## Qual opção usar em cada situação

A pergunta certa não é "o que essa opção faz", é "o que aconteceu comigo".

| O que aconteceu | O que lançar |
|---|---|
| Paguei em real ou dólar e recebi cripto | **Compra** |
| Vendi cripto e recebi dinheiro | **Venda** |
| Troquei uma cripto por outra | **Permuta** |
| Ganhei cripto de staking, juros ou cashback | **Rendimento** |
| Recebi cripto de graça numa distribuição | **Airdrop** |
| Movi entre carteiras minhas | **Transferência** enviada e recebida |
| Paguei taxa de rede na própria moeda | **Taxa paga no ativo** |
| Perdi a chave, ou a corretora quebrou | **Perda definitiva** |

### Cada uma em detalhe

**Compra.** Aumenta a quantidade e o custo. A taxa da corretora entra no custo, porque faz parte do que você pagou pelo bem.
*Exemplo:* comprou 0,5 BTC a R$ 180.000 com R$ 90 de taxa → custo R$ 90.090.

**Venda.** Reduz a quantidade, baixa o custo proporcional e apura ganho. A taxa é descontada do que você recebeu.
*Exemplo:* preço médio de R$ 197.500 e você vende 0,2 BTC por R$ 500.000 cada. Recebeu R$ 100.000, o custo era R$ 39.500, ganho de R$ 60.500.

**Permuta.** Trocou um ativo por outro sem passar por dinheiro. **Gera imposto**, porque o lucro do ativo entregue se realiza na troca.

Preencha o ativo entregue, quanto entregou, o ativo recebido, quanto recebeu, e o **valor total da operação** em reais. O sistema cria dois lançamentos amarrados: uma saída, que apura o ganho, e uma entrada, que forma o custo do novo ativo. Apagar uma perna apaga a outra — é um fato só.

*Exemplo:* entregou 0,3 BTC que custaram R$ 59.250 e recebeu 100 SOL numa operação de R$ 120.000. Ganho de R$ 60.750 no Bitcoin, e as SOL entram com custo de R$ 1.200 cada.

**Rendimento e Airdrop.** Você recebeu cripto sem pagar. Entra pelo **valor de mercado na data**, e esse valor vira o custo daquelas moedas. Quando vender, o lucro conta a partir dali, não a partir de zero.

**Transferência recebida / enviada.** Movimentação entre carteiras suas. **Não altera nada**: nem saldo, nem custo, nem imposto. Fica registrada só para o histórico. Não use para envio a terceiros.

**Taxa paga no ativo.** Taxa de rede descontada na própria moeda. Reduz a quantidade e baixa o custo proporcional, sem gerar ganho.

**Perda definitiva.** Chave perdida, corretora quebrada, projeto evaporado. Reduz quantidade e custo, sem gerar ganho tributável.

---

## Operações em dólar

Quando você marca a moeda como USD, aparece o campo **câmbio da data**. Preencha com a cotação do dólar no dia da operação, não a de hoje.

Isso não é preciosismo. Se você comprou a US$ 20.000 com dólar a R$ 5,00 e vendeu a US$ 25.000 com dólar a R$ 6,00, seu custo foi R$ 100.000 e sua venda foi R$ 150.000. O ganho de R$ 50.000 inclui a valorização do dólar — e ele é tributável.

A fonte oficial para o fisco é a PTAX do Banco Central.

---

## Como o imposto é calculado

### O caminho do dado

```
Lançamentos → apuração → alienações → simulação → tabelas na tela
```

Só **venda** e **permuta de saída** geram alienação. Compra, transferência, rendimento e airdrop não geram imposto no momento em que acontecem.

Para cada alienação o sistema calcula três números: quanto foi recebido, quanto daquilo era custo, e a diferença entre os dois.

### As duas regras

**Regime nacional.** Soma todas as alienações do mês. Se o total ficar abaixo do limite de isenção, o mês é isento, mesmo com lucro. Acima disso, aplica a tabela progressiva sobre o ganho.

**Regime exterior.** Soma o ano inteiro, prejuízos abatem lucros dentro do período, alíquota fixa. Sem isenção por volume.

O regime vem **do lançamento**, não do ativo. O mesmo Bitcoin pode gerar uma venda nacional e uma no exterior no mesmo mês, e cada uma vai para sua tabela.

### Sobre prejuízos

Por padrão o sistema **não** abate prejuízo do lucro no regime nacional — leitura conservadora, operação a operação. A tela mostra os dois números, **Ganho bruto** e **Resultado líquido**, justamente para o contador decidir qual usar.

### Onde ficam as fórmulas

Em `motor/src/tributacao.ts`, separadas em duas camadas de propósito:

- **Os números da lei** ficam num objeto chamado `PARAMETROS_BR_2026`: limite de isenção, faixas de alíquota, alíquota do exterior, e a chave de compensação de perdas.
- **O algoritmo** fica nas funções `simularMensalNacional` e `simularAnualExterior`.

Quando a lei muda, você mexe nos números, não na lógica.

### Como manter atualizado

Nada verifica a lei automaticamente. Recomenda-se:

1. Um lembrete anual, em janeiro, para revisar os parâmetros
2. Acompanhar as publicações da Receita Federal sobre ativos digitais
3. Atenção à substituição da IN 1.888/2019 pela DeCripto, que amplia a obrigação para exchanges estrangeiras e plataformas DeFi

Depois de qualquer alteração:

```bash
cd motor
npm test
npx esbuild src/index.ts --bundle --format=iife \
  --global-name=Motor --outfile=../apps/web/motor.js --target=es2020
```

Os testes rodam antes do build. Se algo quebrar, você descobre ali.

---

## Situações comuns

**Comprei o mesmo ativo várias vezes. Preciso fazer alguma coisa?**
Não. Lance cada compra e o preço médio se recalcula sozinho.

**Vendi mais do que tenho e o sistema recusou.**
Correto. Falta registrar alguma aquisição anterior. Lance a compra que está faltando e tente de novo.

**Mandei Bitcoin da corretora para minha wallet. O que lanço?**
Transferência enviada, depois transferência recebida. Nenhuma altera seu saldo.

**Quero remover um ativo mas o sistema não deixa.**
Ele tem lançamentos no livro. Se sumisse da lista, a posição continuaria sendo calculada mas não apareceria em lugar nenhum. Apague os lançamentos primeiro.

**Apaguei um lançamento por engano.**
Não há desfazer. Lance de novo. Por isso exporte com frequência.

**Troquei de computador e sumiu tudo.**
Os dados ficam no navegador, não numa conta. Use Exportar no aparelho antigo e Importar no novo.

**Limpei o histórico do navegador.**
Se apagou dados de sites, perdeu. Exporte com frequência.

**Digitei com ponto e o valor ficou estranho.**
O sistema mostra embaixo do formulário como interpretou o número, antes de você gravar. Confira ali. A regra: o último separador é o decimal, e ponto isolado com três casas é milhar — `180.000` é cento e oitenta mil, mas `0.001` é um milésimo.

---

## O que este sistema não é

- **Não é uma corretora.** Não compra, não vende, não guarda cripto. Só registra.
- **Não é conselho de investimento.** Não sugere o que comprar nem prevê preço.
- **Não é apuração fiscal oficial.** A seção de imposto é simulação, feita a partir do que você digitou. Antes de declarar ou pagar, leve os números a um contador.
- **Não substitui seus comprovantes.** Guarde os extratos. O sistema organiza, mas quem comprova é o documento.

---

## Onde ficam os dados

Tudo é gravado no seu próprio navegador, na máquina que você está usando. Nada vai para servidor nenhum. Os únicos dados que saem do seu computador são consultas de preço, que não incluem nada sobre você.

Isso tem uma vantagem e uma desvantagem, e vale entender que são coisas diferentes:

- **Privacidade:** máxima. Nada seu está armazenado em lugar nenhum além da sua máquina.
- **Segurança dos dados:** baixa. Não há backup automático nem recuperação. Limpou o navegador, perdeu.

**Exporte sua carteira regularmente.** É um arquivo pequeno com lista de ativos, lançamentos e histórico de patrimônio.

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
