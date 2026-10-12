/**
 * Painel de Resultados - Eleições 2026
 * Prática Semanal - Laboratório de Programação 1
 * Consumo e tratamento de dados oficiais do Tribunal Superior Eleitoral (TSE)
 */

// Configuração das fontes de dados disponíveis
const CONFIG_FONTES = {
  presidente: {
    nome: "Presidente da República",
    arquivoLocal: "./TSE.json",
    scriptFallbackId: "tse-dados-presidente",
    urlRemota: "https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json"
  },
  governador_ba: {
    nome: "Governador",
    arquivoLocal: "./governador_ba.json",
    scriptFallbackId: "tse-dados-governador_ba",
    urlRemota: "https://resultados.tse.jus.br/oficial/ele2026/6259/dados/ba/ba-c0003-e006259-u.json"
  }
};

let candidatosBase = [];

// Elementos da interface
const selectEleicao = document.getElementById("select-eleicao");
const cargoTitulo = document.getElementById("cargo-titulo");
const metadadosEl = document.getElementById("metadados");
const resumoApuracaoEl = document.getElementById("resumo-apuracao");
const statusMsg = document.getElementById("status-mensagem");
const gridCandidatos = document.getElementById("grid-candidatos");
const inputBusca = document.getElementById("campo-busca");
const selectOrdem = document.getElementById("select-ordem");
const btnAtualizar = document.getElementById("btn-atualizar");

/**
 * Mapeia siglas de abrangência territorial para nomes legíveis
 */
function formatarAbrangencia(cdabr) {
  const sigla = (cdabr || "").toUpperCase();
  const mapa = {
    "BR": "Brasil (Nacional)",
    "BA": "Bahia (BA)"
  };
  return mapa[sigla] || sigla || "Nacional";
}

/**
 * Extrai e normaliza os candidatos do formato do arquivo JSON do TSE
 */
function extrairCandidatos(dados) {
  const cands = [];

  // Se o JSON contiver diretamente a lista 'cand'
  if (Array.isArray(dados.cand)) {
    return dados.cand.map(c => normalizarCandidato(c, c.sgp || c.sg || "S/P"));
  }

  // Estrutura padrão oficial do TSE: carg -> agr -> par -> cand
  const cargo = (dados.carg && dados.carg[0]) || null;
  if (cargo && Array.isArray(cargo.agr)) {
    cargo.agr.forEach(agr => {
      (agr.par || []).forEach(par => {
        const siglaPartido = par.sg || agr.com || "S/P";
        (par.cand || []).forEach(c => {
          cands.push(normalizarCandidato(c, siglaPartido, agr.nm || agr.com));
        });
      });
    });
  }

  return cands;
}

/**
 * Normaliza os atributos de um candidato individual
 */
function normalizarCandidato(c, siglaPartido, coligacao = "") {
  const votosQtd = parseInt(c.vap || "0", 10);
  const viceNome = (c.vs && c.vs[0]) ? (c.vs[0].nmu || c.vs[0].nm) : null;
  const situacao = c.st || (c.e === "s" ? "Eleito" : "Não eleito");

  // Determina se o candidato está efetivamente eleito segundo a fonte
  // Importante: No 1º turno, candidatos com st '2º turno' NÃO estão eleitos ainda!
  const estaEleito = situacao.toLowerCase().includes("eleito");
  const emSegundoTurno = situacao.toLowerCase().includes("2º turno") || situacao.toLowerCase().includes("segundo turno");

  return {
    numero: c.n || "S/N",
    nome: c.nmu || c.nm || "Nome não informado",
    nomeCompleto: c.nm || "",
    partido: siglaPartido || "S/P",
    coligacao: coligacao,
    votos: isNaN(votosQtd) ? 0 : votosQtd,
    percentual: c.pvap || "0,00",
    situacaoTexto: situacao,
    estaEleito: estaEleito,
    emSegundoTurno: emSegundoTurno,
    vice: viceNome
  };
}

/**
 * Realiza requisição HTTP para obter os dados do JSON, com fallback seguro para file:///
 */
async function obterDadosJSON(chaveEleicao) {
  const config = CONFIG_FONTES[chaveEleicao] || CONFIG_FONTES.presidente;

  // 1. Tenta carregar via fetch HTTP do arquivo local
  try {
    const resposta = await fetch(config.arquivoLocal);
    if (resposta.ok) {
      return await resposta.json();
    }
  } catch (erroLocal) {
    console.warn(`Fetch local (${config.arquivoLocal}) não disponível, tentando URL remota...`, erroLocal);
  }

  // 2. Tenta carregar via URL oficial do TSE (quando executado em ambiente com suporte ou proxy)
  try {
    const respostaRemota = await fetch(config.urlRemota);
    if (respostaRemota.ok) {
      return await respostaRemota.json();
    }
  } catch (erroRemoto) {
    console.warn("Fetch remoto também falhou (bloqueio CORS usual em requisições de navegador direto ao TSE).", erroRemoto);
  }

  // 3. Fallback: Dados embutidos na tag script do index.html (garante funcionamento com 2 cliques via file:///)
  const scriptElement = document.getElementById(config.scriptFallbackId);
  if (scriptElement && scriptElement.textContent.trim()) {
    try {
      return JSON.parse(scriptElement.textContent);
    } catch (erroJson) {
      console.error("Falha ao analisar JSON embutido:", erroJson);
    }
  }

  throw new Error(`Não foi possível carregar os dados para ${config.nome}.`);
}

/**
 * Consulta e processa os dados da eleição selecionada
 */
async function carregarResultados() {
  const chaveEleicao = selectEleicao.value;
  statusMsg.textContent = "A carregar dados do TSE...";
  gridCandidatos.innerHTML = "";

  try {
    const dados = await obterDadosJSON(chaveEleicao);

    // Identificação dos metadados da eleição
    const cargoObj = dados.carg && dados.carg[0];
    const cargoNome = cargoObj?.nmn || cargoObj?.nmm || dados.ds || "Cargo não especificado";
    const abrangencia = formatarAbrangencia(dados.cdabr);
    const turno = dados.t || "1";
    const dataGeracao = dados.dg || "Data não informada";
    const horaGeracao = dados.hg || "Hora não informada";

    cargoTitulo.textContent = `${cargoNome} — ${abrangencia} (${turno}º Turno)`;

    metadadosEl.innerHTML = `
      <strong>Fonte:</strong> Tribunal Superior Eleitoral (TSE) | 
      <strong>Turno:</strong> ${turno}º Turno | 
      <strong>Atualizado em:</strong> ${dataGeracao} às ${horaGeracao}
    `;

    // Resumo de totalização e apuração de votos
    if (resumoApuracaoEl && dados.s) {
      const secoesTotalizadas = dados.s.pst || "0,00";
      const totalVotos = dados.v && dados.v.tv ? parseInt(dados.v.tv, 10).toLocaleString("pt-BR") : null;
      const votosValidos = dados.v && dados.v.vv ? parseInt(dados.v.vv, 10).toLocaleString("pt-BR") : null;

      resumoApuracaoEl.innerHTML = `
        <div class="resumo-item"><strong>Seções Apuradas:</strong> ${secoesTotalizadas}%</div>
        ${totalVotos ? `<div class="resumo-item"><strong>Total de Votos:</strong> ${totalVotos}</div>` : ""}
        ${votosValidos ? `<div class="resumo-item"><strong>Votos Válidos:</strong> ${votosValidos}</div>` : ""}
      `;
    }

    candidatosBase = extrairCandidatos(dados);

    // Inicialmente apresenta os resultados em ordem decrescente de votos
    selectOrdem.value = "votos";
    statusMsg.textContent = "";
    apresentarCandidatos();
  } catch (erro) {
    statusMsg.innerHTML = `
      <p style="color: #dc2626; font-weight: bold;">Falha ao carregar os dados da apuração.</p>
      <p style="font-size: 0.9rem; margin-top: 6px;">Verifique sua conexão ou utilize o Live Server no VS Code para abrir o projeto via HTTP.</p>
    `;
    console.error("Erro na consulta dos dados:", erro);
  }
}

/**
 * Apresenta a lista filtrada e ordenada na interface
 */
function apresentarCandidatos() {
  const termoBusca = (inputBusca.value || "").toLowerCase().trim();
  const criterio = selectOrdem.value;

  // Filtragem pelo nome do candidato
  let filtrados = candidatosBase.filter(c => 
    c.nome.toLowerCase().includes(termoBusca) ||
    c.nomeCompleto.toLowerCase().includes(termoBusca)
  );

  // Alternância da ordenação: quantidade de votos (decrescente) ou nome (alfabética)
  filtrados.sort((a, b) => {
    if (criterio === "nome") {
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    // Padrão: mais votados primeiro (decrescente)
    return b.votos - a.votos;
  });

  // Mensagem quando a pesquisa não encontrar resultados
  if (filtrados.length === 0) {
    gridCandidatos.innerHTML = "";
    statusMsg.textContent = "Nenhum candidato encontrado com o nome pesquisado.";
    return;
  }

  statusMsg.textContent = "";

  gridCandidatos.innerHTML = filtrados.map(c => {
    const percentualNum = parseFloat(c.percentual.replace(",", "."));
    const percentualBarra = isNaN(percentualNum) ? 0 : Math.min(percentualNum, 100);

    // Indicação de candidato eleito apenas quando a informação estiver disponível na fonte
    let badgeHtml = "";
    let classeCard = "";

    if (c.estaEleito) {
      badgeHtml = `<span class="badge badge-eleito">ELEITO</span>`;
      classeCard = "card-eleito";
    } else if (c.emSegundoTurno) {
      badgeHtml = `<span class="badge badge-segundo-turno">2º TURNO</span>`;
      classeCard = "card-segundo-turno";
    }

    return `
      <article class="card ${classeCard}">
        <div class="card-corpo">
          <div class="card-topo">
            <h3 class="candidato-nome">${c.nome}</h3>
            ${badgeHtml ? `<div class="badges-box">${badgeHtml}</div>` : ""}
          </div>

          ${c.vice ? `<p class="candidato-vice"><strong>Vice:</strong> ${c.vice}</p>` : ""}

          <div class="info-linha">
            <span><strong>Número:</strong> ${c.numero}</span>
            <span><strong>Partido:</strong> ${c.partido}</span>
          </div>

          <div class="info-linha">
            <span><strong>Votos:</strong> ${c.votos.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        <div class="card-rodape">
          <div class="percentual-linha">
            <span><strong>Percentual de votação:</strong></span>
            <span class="percentual-valor">${c.percentual}%</span>
          </div>
          <div class="barra-fundo">
            <div class="barra-preenchimento" style="width: ${percentualBarra}%;"></div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// Event Listeners
selectEleicao.addEventListener("change", carregarResultados);
inputBusca.addEventListener("input", apresentarCandidatos);
selectOrdem.addEventListener("change", apresentarCandidatos);
btnAtualizar.addEventListener("click", carregarResultados);

// Inicialização
carregarResultados();