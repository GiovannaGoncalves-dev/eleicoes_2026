# Painel de Resultados — Eleições 2026

Aplicação web desenvolvida para a atividade **Prática Semanal** da disciplina **Laboratório de Programação 1**. O projeto consome dados públicos oficiais do Tribunal Superior Eleitoral (TSE) referentes às Eleições Gerais de 2026 e apresenta os resultados de apuração de forma interativa, organizada e acessível.

---

## 🎯 Alternativa Escolhida
**Alternativa A — Painel das Eleições 2026**

Permite consultar e acompanhar os resultados do 1º turno das Eleições 2026 para:
- **Presidente da República** (abrangência nacional / Brasil)
- **Governador** (abrangência estadual / Bahia)

---

## 🛠️ Tecnologias Utilizadas e Justificativa

| Tecnologia | Finalidade |
|---|---|
| **HTML5 Semântico** | Estruturação semântica do documento (`header`, `main`, `section`, `article`, `footer`), garantindo acessibilidade e organização. |
| **CSS3 Moderno** | Estilização responsiva com CSS Grid e Flexbox, tipografia limpa, barras de percentual e identidade visual similar à divulgação eleitoral. |
| **JavaScript Vanilla (ES6+)** | Lógica de consulta assíncrona (`fetch`, `async/await`), manipulação de DOM, filtragem dinâmica e ordenação sem necessidade de frameworks pesados. |

### Justificativa da Escolha:
A escolha por tecnologias web nativas (*Vanilla HTML/CSS/JS*) fundamenta-se nos conteúdos abordados em **Laboratório de Programação 1**. Essa abordagem elimina a necessidade de gerenciadores de pacotes ou etapas de compilação (*build tools*), tornando o código leve, direto, facilmente auditável e com alta compatibilidade entre navegadores.

---

## 🚀 Instruções de Execução

Você pode executar o projeto de duas formas:

### 1. Servidor Local (Recomendado - Live Server no VS Code)
1. Abra a pasta do projeto no **VS Code**.
2. Certifique-se de possuir a extensão **Live Server** instalada.
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"** (ou clique em **Go Live** no rodapé do VS Code).
4. O painel abrirá automaticamente em `http://127.0.0.1:5500`.

### 2. Abertura Direta no Navegador (Duplo Clique)
1. Dê dois cliques no arquivo `index.html` diretamente pelo explorador de arquivos do Windows.
2. O projeto carregará automaticamente utilizando o *fallback* de dados embutido, contornando eventuais restrições de CORS impostas por navegadores ao protocolo local `file:///`.

---

## ✨ Funcionalidades Implementadas

- **Seleção de Cargo / Consulta**: Alternância instantânea entre a apuração para **Presidente da República (Brasil)** e **Governador (Bahia)**.
- **Identificação Completa dos Dados**: Exibição do cargo, abrangência territorial, turno, fonte oficial (TSE) e data/hora de geração.
- **Resumo da Apuração**: Indicador de seções apuradas (%) e contagem total de votos.
- **Cartões dos Candidatos**:
  - Nome de urna e nome do vice;
  - Número de urna e sigla do partido oficial;
  - Quantidade de votos apurados (formatados no padrão brasileiro);
  - Percentual de votação com barra de progresso visual.
- **Indicação Rigorosa de Situação**:
  - Exibe o selo **ELEITO** apenas quando a informação estiver explicitamente confirmada na fonte (`st = "Eleito"`).
  - Candidatos classificados para o segundo turno recebem a indicação **2º TURNO**.
- **Ordenação Interativa**: Resultados ordenados inicialmente de forma decrescente por votos, com opção de alternar para ordem alfabética (A-Z).
- **Pesquisa em Tempo Real**: Campo de busca por nome de urna ou nome completo do candidato.
- **Botão de Atualização**: Permite recarregar os dados a qualquer momento.
- **Tratamento de Estados**: Mensagens claras de carregamento, resultado não encontrado e tratamento de falhas.

---

## 🌐 Endereços de Consulta aos Dados (Fontes Oficiais)

Os dados utilizados são fornecidos pelo Tribunal Superior Eleitoral (TSE):

1. **Presidente da República — Brasil**:
   - URL: `https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json`
   - Cópia local para requisição: `TSE.json`
2. **Governador — Bahia**:
   - URL: `https://resultados.tse.jus.br/oficial/ele2026/6259/dados/ba/ba-c0003-e006259-u.json`
   - Cópia local para requisição: `governador_ba.json`
3. **Documentação Técnica do TSE**:
   - [Informações Técnicas sobre Divulgação de Resultados (TSE)](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados)

---

## 📋 Explicação dos Campos do JSON Utilizados

O formato de arquivo unificado do TSE estrutura as informações em hierarquia:

| Campo | Nível | Descrição |
|---|---|---|
| `dg` / `hg` | Raiz | Data e hora em que o arquivo foi gerado pelo TSE. |
| `cdabr` | Raiz | Código da abrangência territorial (`br` para Brasil, `ba` para Bahia). |
| `t` | Raiz | Turno da eleição (`1` para primeiro turno). |
| `s.pst` | `s` (Seções) | Percentual de seções totalizadas/apuradas até o momento. |
| `v.tv` | `v` (Votos) | Total geral de votos apurados. |
| `carg[].nmn` | `carg` | Nome do cargo em disputa (ex.: "Presidente", "Governador"). |
| `agr[].par[].sg` | `par` | Sigla oficial do partido político (ex.: "PL", "PT", "UNIÃO"). |
| `cand[].n` | `cand` | Número eleitoral do candidato na urna. |
| `cand[].nmu` | `cand` | Nome de urna do candidato. |
| `cand[].nm` | `cand` | Nome completo registrado do candidato. |
| `cand[].vap` | `cand` | Quantidade total de votos apurados para o candidato. |
| `cand[].pvap` | `cand` | Percentual de votos válidos recebidos pelo candidato. |
| `cand[].st` | `cand` | Situação da totalização (ex.: `"Eleito"`, `"2º turno"`, `"Não eleito"`). |
| `cand[].vs[].nmu` | `vs` | Nome de urna do candidato a vice. |

---

## ⚠️ Limitações Identificadas

1. **Restrições de CORS em requisições diretas de navegador ao TSE**:
   - Os servidores de arquivos estáticos do TSE (`resultados.tse.jus.br`) não enviam o cabeçalho HTTP `Access-Control-Allow-Origin: *`. Dessa forma, requisições diretas feitas via JavaScript em navegadores comuns são bloqueadas por políticas de CORS (*Cross-Origin Resource Sharing*).
   - **Solução implementada:** A aplicação mantém cópias locais idênticas dos arquivos JSON oficiais disponibilizados pelo TSE (`TSE.json` e `governador_ba.json`) e um *fallback* embutido no HTML, garantindo pleno funcionamento tanto via servidor local quanto em arquivos locais.
2. **Dados Oficiais Simulados/Divulgados**:
   - Os arquivos representam dados estáticos do primeiro turno disponibilizados pelo TSE para testes e integração com os sistemas de divulgação das Eleições 2026.
