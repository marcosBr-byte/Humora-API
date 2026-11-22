// js/aluno.js
var usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
const modoVisitante = window.location.pathname === '/visitante.html';
if (modoVisitante ? usuarioLogado?.tipo !== "visitante"
    : usuarioLogado?.tipo !== "aluno" || !sessionStorage.getItem("token")) {
    window.location.replace("login.html");
    throw new Error("Sessão inválida");
}

// Inicializar dados do aluno
var alunos = modoVisitante ? [] : JSON.parse(localStorage.getItem("alunosHumora")) || [];
var alunoAtual = modoVisitante ? JSON.parse(sessionStorage.getItem("humoraVisitanteDados")) : null;
for (var i = 0; i < alunos.length; i++) {
    if (alunos[i].email === usuarioLogado.email) {
        alunoAtual = alunos[i];
        break;
    }
}

if (!alunoAtual) {
    alunoAtual = {
        id: usuarioLogado.id || null,
        nome: usuarioLogado.nome || usuarioLogado.email.split('@')[0],
        email: usuarioLogado.email,
        turma: usuarioLogado.turma || "",
        avatar: "😊",
        historico: [],
        diario: [],
        conquistas: [],
        streak: 0,
        ultimaEmocao: null,
        mensagensProfessor: [],
        mensagensVisualizadas: false,
        badges: []
    };
    alunos.push(alunoAtual);
    salvarAlunos();
}

// Garante arrays em qualquer cenário (evita crash se aluno vem do backend sem histórico)
if (!alunoAtual.historico) alunoAtual.historico = [];
if (!alunoAtual.diario) alunoAtual.diario = [];
if (!alunoAtual.conquistas) alunoAtual.conquistas = [];
if (!alunoAtual.mensagensProfessor) alunoAtual.mensagensProfessor = [];
if (!alunoAtual.badges) alunoAtual.badges = [];

// Variáveis globais
var emocaoSelecionada = null;
let registroFectPendente;
let atualizarTermometroIndividual;
var intervalBloqueio = null;
var pontosGame = 0, bolasEstouradas = 0, corAlvoAtual = "", tempoGameInterval = null;
var cartasMemoria = [], cartasViradas = [], paresEncontrados = 0, tentativasMemoria = 0;
var canvasSubir, ctxSubir, jogadorSubir, plataformasSubir, pontosSubir, gameLoopSubir, teclasSubir;
var melhorPontuacaoSubir = 0;
let proximaRodadaPopIt, rodadaPopItAtiva, retornoMemoria, inicioSubir;
var gradeCaca = [], palavrasCaca = [], palavrasEncontradasCaca = [], dicasCaca = 3;
var selecaoCaca = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };

var bancoPalavras = [
    "FELIZ", "ALEGRE", "CALMA", "PAZ", "AMOR", "GRATO", "BEM", "LUZ",
    "FORCA", "UNIAO", "VIDA", "SONHO", "TRISTE", "MEDO", "RAIVA", "CANSA",
    "RESPIRA", "OUVIR", "FALAR", "AJUDA", "CUIDA", "SORRIR", "ABRACO",
    "DANCAR", "CANTAR", "MENTE", "CORPO", "SERENO", "PLENO", "AFETO",
    "LACO", "APOIO", "LIVRE", "HUMORA"
];

var conquistasLista = [
    { id: "primeiro_registro", icone: "🌱", titulo: "Primeiro Passo", desc: "Registrou sua primeira emoção." },
    { id: "streak_3", icone: "🔥", titulo: "Em Chamas", desc: "Manteve 3 dias seguidos." },
    { id: "diario_mestre", icone: "📝", titulo: "Mestre do Desabafo", desc: "Escreveu no diário." },
    { id: "respirou", icone: "🧘", titulo: "Mente Calma", desc: "Completou respiração." },
    { id: "game_500", icone: "🎯", titulo: "Mestre dos Pop-its", desc: "500 pontos no Pop-It." },
    { id: "memoria_10", icone: "🧠", titulo: "Memória de Elefante", desc: "Memória em menos de 10 tentativas." },
    { id: "subir_50", icone: "🧠", titulo: "Cérebro Saltador", desc: "50 pontos no Cérebro Saltador." },
    { id: "caca_5", icone: "🔤", titulo: "Caça-Palavras", desc: "Completou 5 caça-palavras." }
];

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nomeAluno").innerText = alunoAtual.nome;
    document.getElementById("nomeAlunoSidebar").innerText = alunoAtual.nome;
    document.getElementById("turmaAlunoSidebar").innerText = modoVisitante ? usuarioLogado.cidade : alunoAtual.turma || "Sem turma";
    exibirAvatarEmocao();
    atualizarStreak();
    carregarHistorico();
    carregarConquistasTab();
    atualizarTermometroIndividual = montarTermometroIndividual(modoVisitante);
    if (modoVisitante) {
        document.title = "Humora | Visitante FECT";
        document.body.classList.add("fect-visitante");
        const diario = document.getElementById("tab-diario");
        diario.querySelectorAll('[data-apenas-aluno]').forEach(elemento => elemento.remove());
        document.querySelector('[onclick="abrirModalNotificacoes()"]').hidden = true;
    } else {
        atualizarBadgeNotificacoes();
        iniciarMonitorBloqueio();
        carregarDiariosBackend();
    }
});

// ========== FUNÇÕES AUXILIARES ==========
function salvarAlunos() {
    if (modoVisitante) {
        sessionStorage.setItem("humoraVisitanteDados", JSON.stringify(alunoAtual));
        return;
    }
    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].email === alunoAtual.email) {
            alunos[i] = alunoAtual;
            localStorage.setItem("alunosHumora", JSON.stringify(alunos));
            return;
        }
    }
    alunos.push(alunoAtual);
    localStorage.setItem("alunosHumora", JSON.stringify(alunos));
}

function desbloquearConquista(id) {
    if (!alunoAtual.conquistas) alunoAtual.conquistas = [];
    if (alunoAtual.conquistas.indexOf(id) === -1) {
        alunoAtual.conquistas.push(id);
        salvarAlunos();
        for (var i = 0; i < conquistasLista.length; i++) {
            if (conquistasLista[i].id === id) {
                notificarPainel("Conquista desbloqueada: " + conquistasLista[i].titulo + "!");
                break;
            }
        }
    }
}

function atualizarStreak() {
    var el = document.getElementById("diasStreak");
    if (!el) return;
    if (!alunoAtual.historico || alunoAtual.historico.length === 0) {
        el.innerText = "0 Dias";
        return;
    }
    var datas = [];
    for (var i = 0; i < alunoAtual.historico.length; i++) {
        if (datas.indexOf(alunoAtual.historico[i].data) === -1)
            datas.push(alunoAtual.historico[i].data);
    }
    alunoAtual.streak = datas.length;
    el.innerText = alunoAtual.streak + " Dias";
    if (alunoAtual.streak >= 3) desbloquearConquista("streak_3");
    salvarAlunos();
}

function atualizarBadgeNotificacoes() {
    var badge = document.getElementById("badgeNotificacao");
    if (!badge) return;
    if (alunoAtual.mensagensVisualizadas) {
        exibirElemento(badge, "nenhum");
        return;
    }
    var msgs = alunoAtual.mensagensProfessor || [];
    var ag = JSON.parse(localStorage.getItem("agendamentosHumora")) || [];
    var av = JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [];

    var total = msgs.length;
    for (var i = 0; i < ag.length; i++) {
        if (ag[i].turma === alunoAtual.turma) total++;
    }
    // Filtra avisos por turma (avisos sem turma = todos)
    for (var j = 0; j < av.length; j++) {
        if (!av[j].turma || av[j].turma === alunoAtual.turma) total++;
    }

    if (total > 0) {
        badge.innerText = total;
        exibirElemento(badge, "flex");
    } else {
        exibirElemento(badge, "nenhum");
    }
}

// ========== NAVEGAÇÃO ==========
function trocarTab(nomeTab, elemento) {
    var tabs = document.querySelectorAll(".tab-content");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("ativo");
    var menus = document.querySelectorAll(".menu-item");
    for (var j = 0; j < menus.length; j++) menus[j].classList.remove("ativo");
    var tab = document.getElementById("tab-" + nomeTab);
    if (tab) tab.classList.add("ativo");
    if (elemento) elemento.classList.add("ativo");
    sincronizarAbaPainel(tab, elemento);
    if (nomeTab === "termometros") atualizarTermometrosAluno();
    if (nomeTab !== "respiracao") pausarRespiracao();
    if (nomeTab === "conquistas") carregarConquistasTab();
}

// ========== EMOÇÕES ==========
function selecionarEmocao(event, tipo) {
    if (document.getElementById("btnEnviarEmocao").getAttribute("aria-busy") === "true") return;
    emocaoSelecionada = tipo;
    atualizarSelecaoEmocao(event.currentTarget);
    document.getElementById("nomeEmocaoSelecionada").replaceChildren(
        criarImagemEmocao(tipo), " " + nomesEmocoes[tipo]
    );
    exibirElemento(document.getElementById("emocaoSelecionadaTexto"), "bloco");
    document.getElementById("btnEnviarEmocao").disabled = false;
}

function atualizarSelecaoEmocao(selecionada) {
    document.querySelectorAll(".emocao").forEach(botao => {
        const ativa = botao === selecionada;
        botao.classList.toggle("selecionada", ativa);
        botao.setAttribute("aria-pressed", String(ativa));
    });
}

// ========== ENVIAR EMOÇÃO PARA BACKEND ==========
async function enviarEmocao() {
    if (!emocaoSelecionada) {
        notificarPainel("Selecione uma emoção.", true);
        return;
    }

    const emocaoBackend = EMOCAO_MAP[emocaoSelecionada];
    if (!emocaoBackend) {
        notificarPainel("Emoção inválida.", true);
        return;
    }

    const botao = document.getElementById("btnEnviarEmocao");
    if (botao.disabled) return;
    botao.disabled = true;
    botao.setAttribute("aria-busy", "true");

    try {
        const intensidade = Number(document.getElementById("intensidadeEmocao").value);
        const dadosFect = { emocao: emocaoBackend, intensidade };
        if (modoVisitante && (registroFectPendente?.emocao !== emocaoBackend || registroFectPendente?.intensidade !== intensidade)) {
            registroFectPendente = { id: idRegistroFect(), ...dadosFect };
        }
        const response = modoVisitante
            ? await fetch("/fect/registros", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registroFectPendente)
            })
            : await api.createDiario(emocaoBackend);

        if (!response.ok) {
            let errorMsg = "Erro ao registrar emoção.";
            try {
                const error = await response.text();
                if (error) errorMsg = error;
            } catch (e) {}
            return notificarPainel(errorMsg, true);
        }

        registroFectPendente = null;

        // Atualizar dados locais
        var registro = {
            emocao: emocaoSelecionada,
            intensidade,
            descricao: document.getElementById("motivo").value.trim(),
            data: new Date().toLocaleDateString("pt-BR"),
            hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            timestamp: new Date().getTime()
        };

        if (!alunoAtual.historico) alunoAtual.historico = [];
        alunoAtual.historico.push(registro);
        alunoAtual.ultimaEmocao = registro.timestamp;
        alunoAtual.avatarEmocao = registro.emocao;
        exibirAvatarEmocao();

        desbloquearConquista("primeiro_registro");
        atualizarStreak();
        salvarAlunos();
        if (!modoVisitante) iniciarMonitorBloqueio();
        carregarHistorico();

        document.getElementById("motivo").value = "";
        document.getElementById("btnEnviarEmocao").disabled = true;
        exibirElemento(document.getElementById("emocaoSelecionadaTexto"), "nenhum");
        emocaoSelecionada = null;
        atualizarSelecaoEmocao(null);

        atualizarTermometroIndividual();
        if (modoVisitante) celebrarEmocaoFect(registro.emocao);
        notificarPainel(modoVisitante ? "Emoção registrada no painel da FECT." : "Emoção registrada.");

    } catch (error) {
        console.error("Erro ao enviar emoção:", error);
        notificarPainel("Não foi possível registrar a emoção. Tente novamente.", true);
    } finally {
        botao.removeAttribute("aria-busy");
        botao.disabled = !emocaoSelecionada;
    }
}

// ========== CARREGAR DIÁRIOS DO BACKEND ==========
async function carregarDiariosBackend() {
    try {
        const response = await api.getDiario();
        if (!response.ok) return;

        const diarios = await response.json();
        if (!diarios || !diarios.length) return;

        if (!alunoAtual.historico) alunoAtual.historico = [];

        for (var i = 0; i < diarios.length; i++) {
            var d = diarios[i];
            var emocaoLocal = EMOCAO_REVERSE[d.emocoes] || d.emocoes;
            var dataStr = new Date(d.dataExpiracao).toLocaleDateString("pt-BR");
            var existe = alunoAtual.historico.some(h =>
                h.data === dataStr && h.emocao === emocaoLocal
            );
            if (!existe) {
                alunoAtual.historico.push({
                    emocao: emocaoLocal,
                    intensidade: 1,
                    descricao: "",
                    data: dataStr,
                    hora: "00:00",
                    timestamp: new Date(d.dataExpiracao).getTime()
                });
            }
        }
        salvarAlunos();
        carregarHistorico();
        atualizarStreak();
        atualizarTermometroIndividual();
        if (document.getElementById("tab-termometros").classList.contains("ativo")) atualizarTermometrosAluno();
    } catch (error) {
        console.error("Erro ao carregar diários:", error);
    }
}

// ========== BLOQUEIO ==========
function iniciarMonitorBloqueio() {
    clearInterval(intervalBloqueio);
    atualizarStatusBloqueio();
    intervalBloqueio = setInterval(atualizarStatusBloqueio, 1000);
}

function atualizarStatusBloqueio() {
    var agora = new Date().getTime(),
        ultima = alunoAtual.ultimaEmocao,
        TEMPO = 2 * 60 * 60 * 1000;
    if (ultima && agora - ultima < TEMPO) {
        var restante = TEMPO - (agora - ultima),
            h = Math.floor(restante / 3600000),
            m = Math.floor((restante % 3600000) / 60000),
            s = Math.floor((restante % 60000) / 1000);
        exibirElemento(document.getElementById("emocoes"), "nenhum");
        exibirElemento(document.getElementById("motivoContainer"), "nenhum");
        exibirElemento(document.getElementById("bloqueioHumora"), "bloco");
        document.getElementById("tempoBloqueioHumora").textContent =
            "⏳ " + [h, m, s].map(valor => String(valor).padStart(2, "0")).join(":");
    } else {
        clearInterval(intervalBloqueio);
        exibirElemento(document.getElementById("emocoes"), "grade");
        exibirElemento(document.getElementById("motivoContainer"), "bloco");
        exibirElemento(document.getElementById("bloqueioHumora"), "nenhum");
    }
}

// ========== DIÁRIO ==========
function salvarDiario() {
    var texto = document.getElementById("textoDiario").value.trim();
    if (!texto) {
        notificarPainel("Escreva sua nota antes de salvar.", true);
        return;
    }
    if (!alunoAtual.diario) alunoAtual.diario = [];
    alunoAtual.diario.push({
        texto: texto,
        compartilhado: document.getElementById("compartilharDiario")?.checked ?? false,
        data: new Date().toLocaleDateString("pt-BR") + " - " +
              new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    desbloquearConquista("diario_mestre");
    salvarAlunos();
    document.getElementById("textoDiario").value = "";
    if (!modoVisitante) document.getElementById("compartilharDiario").checked = false;
    notificarPainel("Nota salva no diário.");
}

function abrirModalVerDiario() {
    const lista = document.getElementById("containerListaDiario");
    const notas = alunoAtual.diario || [];
    if (!notas.length) mostrarSemDados(lista, "Nenhuma nota ainda.", "amplo");
    else {
        const itens = [...notas].reverse().map(nota => copiarModeloPainel("modeloNotaAluno", {
            data: "📅 " + (nota.data ?? ""),
            texto: `"${nota.texto ?? ""}"`,
            compartilhamento: nota.compartilhado ? "🔓 Compartilhado" : "🔒 Privado"
        }));
        lista.replaceChildren(...itens);
    }
    exibirElemento(document.getElementById("modalVerDiario"), "flex");
}

function fecharModalVerDiario() {
    exibirElemento(document.getElementById("modalVerDiario"), "nenhum");
}

// ========== GRÁFICOS ==========
function atualizarTermometrosAluno() {
    const recentes = alunoAtual.historico.slice(-7).reverse().map((item, indice) => ({
        chave: String(item.timestamp ?? "") + ":" + indice,
        nome: nomesEmocoes[item.emocao] || "Emoção",
        emocao: item.emocao,
        valor: item.intensidade ?? 1,
        detalhe: [item.data, item.hora].filter(Boolean).join(" · ")
    }));
    mostrarTermometros("termometroRegistros", recentes, "Registre uma emoção para começar.");
    const contagem = contarEmocoes(alunoAtual.historico.map(item => item.emocao));
    termometrosPercentuais("termometroFrequencia", medidasDasEmocoes(contagem, "registros"),
        "Suas emoções registradas vão aparecer aqui.");
}

// ========== HISTÓRICO ==========
function carregarHistorico() {
    const lista = document.getElementById("historico");
    if (!lista) return;
    const historico = alunoAtual.historico || [];
    if (!historico.length) {
        mostrarSemDados(lista, "Nenhum registro ainda.", "compacto");
        return;
    }
    const itens = [...historico].reverse().map(registro => {
        const tipo = registro.emocao;
        const item = copiarModeloPainel("modeloHistoricoAluno", {
            resumo: `${nomesEmocoes[tipo] ?? tipo ?? ""} (Nível ${registro.intensidade || 1})`,
            descricao: `📝 "${registro.descricao ?? ""}"`,
            data: `${registro.data ?? ""} às ${registro.hora ?? ""}`
        });
        if (Object.hasOwn(nomesEmocoes, tipo)) item.prepend(criarImagemEmocao(tipo), " ");
        item.querySelector("[data-descricao]").hidden = !registro.descricao;
        return item;
    });
    lista.replaceChildren(...itens);
}

// ========== NOTIFICAÇÕES ==========
function trocarNotifTab(tipo, el) {
    var tabs = document.querySelectorAll(".notif-tab");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("ativo");
    var conts = document.querySelectorAll(".notif-content");
    for (var j = 0; j < conts.length; j++) conts[j].classList.remove("ativo");
    el.classList.add("ativo");
    document.getElementById("notif-" + tipo).classList.add("ativo");
    if (tipo === "mensagens") carregarMensagensProfessor();
    if (tipo === "atividades") carregarAtividadesAluno();
    if (tipo === "avisos") carregarAvisosAluno();
}

function carregarMensagensProfessor() {
    const lista = document.getElementById("mensagensProfessor");
    if (!lista) return;
    const mensagens = alunoAtual.mensagensProfessor || [];
    if (!mensagens.length) {
        mostrarSemDados(lista, "Nenhuma mensagem.", "compacto");
        return;
    }
    const itens = [...mensagens].reverse().map(mensagem => copiarModeloPainel("modeloMensagemAluno", {
        autor: "👨‍🏫 " + (mensagem.professor ?? ""),
        data: mensagem.data,
        texto: mensagem.texto
    }));
    lista.replaceChildren(...itens);
}

function carregarAtividadesAluno() {
    const lista = document.getElementById("atividadesAluno");
    if (!lista) return;
    const atividades = (JSON.parse(localStorage.getItem("agendamentosHumora")) || [])
        .filter(atividade => atividade.turma === alunoAtual.turma);
    if (!atividades.length) {
        mostrarSemDados(lista, "Nenhuma atividade.", "compacto");
        return;
    }
    const itens = atividades.map(atividade => copiarModeloPainel("modeloAtividadeAluno", {
        titulo: "📅 " + (atividade.titulo ?? ""),
        detalhes: `${atividade.turma ?? ""} | ${atividade.data ?? ""}`
    }));
    lista.replaceChildren(...itens);
}

function carregarAvisosAluno() {
    const lista = document.getElementById("avisosAluno");
    if (!lista) return;
    const avisos = (JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [])
        .filter(aviso => !aviso.turma || aviso.turma === alunoAtual.turma);
    if (!avisos.length) {
        mostrarSemDados(lista, "Nenhum aviso.", "compacto");
        return;
    }
    const itens = avisos.reverse().map(aviso => copiarModeloPainel("modeloAvisoAluno", {
        texto: aviso.texto, data: aviso.data
    }));
    lista.replaceChildren(...itens);
}

function abrirModalNotificacoes() {
    exibirElemento(document.getElementById("modalNotificacoes"), "flex");
    alunoAtual.mensagensVisualizadas = true;
    salvarAlunos();
    var badge = document.getElementById("badgeNotificacao");
    exibirElemento(badge, "nenhum");
    badge.innerText = "0";
    carregarMensagensProfessor();
}

function fecharModalNotificacoes() {
    exibirElemento(document.getElementById("modalNotificacoes"), "nenhum");
}

function abrirModalHistorico() {
    carregarHistorico();
    exibirElemento(document.getElementById("modalHistorico"), "flex");
}

function fecharModalHistorico() {
    exibirElemento(document.getElementById("modalHistorico"), "nenhum");
}

// ========== CONQUISTAS ==========
function carregarConquistasTab() {
    const lista = document.getElementById("containerConquistasTab");
    if (!lista) return;
    const obtidas = alunoAtual.conquistas || [];
    const itens = conquistasLista.map(conquista => {
        const item = copiarModeloPainel("modeloConquistaAluno", {
            titulo: conquista.titulo, icone: conquista.icone, descricao: conquista.desc
        });
        item.dataset.obtida = String(obtidas.includes(conquista.id));
        return item;
    });
    lista.replaceChildren(...itens);
}

// ========== JOGOS (Pop-It) ==========
function abrirModalGame() {
    pontosGame = 0;
    bolasEstouradas = 0;
    document.getElementById("resultadoPopIt").textContent = "";
    document.getElementById("gamePontos").innerText = "0";
    gerarRodadaGame();
    exibirElemento(document.getElementById("modalGame"), "flex");
}

function fecharModalGame() {
    clearInterval(tempoGameInterval);
    clearTimeout(proximaRodadaPopIt);
    rodadaPopItAtiva = false;
    exibirElemento(document.getElementById("modalGame"), "nenhum");
}

function gerarRodadaGame() {
    clearInterval(tempoGameInterval);
    rodadaPopItAtiva = true;
    var sort = coresGame[Math.floor(Math.random() * coresGame.length)];
    corAlvoAtual = sort.nome;
    document.getElementById("corAlvoTexto").innerText = sort.nome;
    colorirAlvoPopIt(document.getElementById("corAlvoTexto"), sort);
    var grid = document.getElementById("gridBolasGame");
    grid.innerHTML = "";
    var bolas = [sort];
    for (var i = 0; i < 11; i++)
        bolas.push(coresGame[Math.floor(Math.random() * coresGame.length)]);
    bolas.sort(function () { return Math.random() - 0.5; });
    for (var j = 0; j < bolas.length; j++) {
        (function (cor) {
            const bola = criarBolaPopIt(cor);
            bola.onclick = function () {
                clicarBolaGame(cor.nome, bola);
            };
            grid.appendChild(bola);
        })(bolas[j]);
    }
    iniciarTimerGame(bolasEstouradas >= 5 ? 3 : 5);
}

function iniciarTimerGame(tempo) {
    var barra = document.getElementById("barraTempoProgresso");
    animarBarraPopIt(barra, tempo);
    var r = tempo;
    document.getElementById("tempoGameTexto").innerText = r + "s";
    tempoGameInterval = setInterval(function () {
        r--;
        document.getElementById("tempoGameTexto").innerText = r + "s";
        if (r <= 0) {
            clearInterval(tempoGameInterval);
            pontosGame = 0;
            bolasEstouradas = 0;
            document.getElementById("gamePontos").innerText = "0";
            document.getElementById("resultadoPopIt").textContent = "Tempo esgotado. Nova rodada!";
            gerarRodadaGame();
        }
    }, 1000);
}

function clicarBolaGame(cor, el) {
    if (!rodadaPopItAtiva) return;
    if (cor === corAlvoAtual) {
        clearInterval(tempoGameInterval);
        rodadaPopItAtiva = false;
        document.getElementById("resultadoPopIt").textContent = "Acertou!";
        pontosGame += 10;
        bolasEstouradas++;
        document.getElementById("gamePontos").innerText = pontosGame;
        if (pontosGame >= 500) desbloquearConquista("game_500");
        el.dataset.estourada = "true";
        proximaRodadaPopIt = setTimeout(gerarRodadaGame, 200);
    } else {
        el.classList.add("erro-shake");
        setTimeout(function () {
            el.classList.remove("erro-shake");
        }, 400);
    }
}

// ========== MEMÓRIA ==========
function abrirJogoMemoria() {
    const emocoes = Object.keys(nomesEmocoes);
    cartasMemoria = emocoes.concat(emocoes);
    for (let i = cartasMemoria.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartasMemoria[i], cartasMemoria[j]] = [cartasMemoria[j], cartasMemoria[i]];
    }
    document.getElementById("resultadoMemoria").textContent = "";
    cartasViradas = [];
    paresEncontrados = 0;
    tentativasMemoria = 0;
    document.getElementById("tentativasMemoria").innerText = "0";
    exibirElemento(document.getElementById("modalMemoria"), "flex");
    renderizarMemoria();
}

function fecharJogoMemoria() {
    clearTimeout(retornoMemoria);
    exibirElemento(document.getElementById("modalMemoria"), "nenhum");
}

function renderizarMemoria() {
    var grid = document.getElementById("gridMemoria");
    grid.innerHTML = "";
    for (var i = 0; i < cartasMemoria.length; i++) {
        (function (emoji) {
            var carta = document.createElement("button");
            carta.type = "button";
            carta.setAttribute("aria-label", `Carta oculta ${i + 1}`);
            carta.dataset.posicao = i + 1;
            carta.className = "carta-memoria";
            carta.innerText = "?";
            carta.onclick = function () {
                virarCarta(carta, emoji);
            };
            grid.appendChild(carta);
        })(cartasMemoria[i]);
    }
}

function virarCarta(carta, emoji) {
    if (cartasViradas.length === 2 || carta.classList.contains("virada") || carta.classList.contains("par"))
        return;
    carta.classList.add("virada");
    exibirCartaMemoria(carta, emoji);
    carta.setAttribute("aria-label", nomesEmocoes[emoji]);
    cartasViradas.push({ carta: carta, emoji: emoji });
    if (cartasViradas.length === 2) {
        tentativasMemoria++;
        document.getElementById("tentativasMemoria").innerText = tentativasMemoria;
        if (cartasViradas[0].emoji === cartasViradas[1].emoji) {
            cartasViradas[0].carta.classList.add("par");
            cartasViradas[1].carta.classList.add("par");
            paresEncontrados++;
            cartasViradas = [];
            if (paresEncontrados === cartasMemoria.length / 2) {
                if (tentativasMemoria <= 10) desbloquearConquista("memoria_10");
                document.getElementById("resultadoMemoria").textContent =
                    `Você encontrou todos os pares em ${tentativasMemoria} tentativas!`;
            }
        } else {
            var c1 = cartasViradas[0].carta,
                c2 = cartasViradas[1].carta;
            retornoMemoria = setTimeout(function () {
                for (const carta of [c1, c2]) {
                    carta.classList.remove("virada");
                    carta.textContent = "?";
                    carta.setAttribute("aria-label", `Carta oculta ${carta.dataset.posicao}`);
                }
                cartasViradas = [];
            }, 800);
        }
    }
}

// ========== CÉREBRO SALTADOR ==========
function abrirJogoSubir() {
    exibirElemento(document.getElementById("modalSubir"), "flex");
    clearTimeout(inicioSubir);
    clearInterval(gameLoopSubir);
    document.getElementById("resultadoSubir").textContent = "";
    inicioSubir = setTimeout(function () {
        canvasSubir = document.getElementById("canvasSubir");
        ctxSubir = canvasSubir.getContext("2d");
        jogadorSubir = {
            x: 175, y: 335, vx: 0, vy: 0,
            largura: 35, altura: 35,
            noChao: true, ultimaPlataforma: 0
        };
        plataformasSubir = [
            { id: 0, x: 100, y: 370, largura: 160, altura: 12, velocidade: 0, direcao: 0 },
            { id: 1, x: 140, y: 300, largura: 100, altura: 10, velocidade: 0, direcao: 0 },
            { id: 2, x: 60, y: 235, largura: 90, altura: 10, velocidade: 0.8, direcao: 1 }
        ];
        var idC = 3;
        for (var i = 0; i < 50; i++) {
            plataformasSubir.push({
                id: idC++,
                x: Math.random() * 310,
                y: 170 - i * 65,
                largura: 75 + Math.random() * 35,
                altura: 10,
                velocidade: i < 3 ? 0 : 0.5 + Math.random() * 2.5,
                direcao: Math.random() > 0.5 ? 1 : -1
            });
        }
        pontosSubir = 0;
        teclasSubir = {};
        document.getElementById("pontosSubir").innerText = "0";
        document.getElementById("melhorSubir").innerText = melhorPontuacaoSubir;
        document.addEventListener("keydown", keydownSubir);
        document.addEventListener("keyup", keyupSubir);
        clearInterval(gameLoopSubir);
        gameLoopSubir = setInterval(atualizarSubir, 16);
    }, 200);
}

function fecharJogoSubir() {
    clearTimeout(inicioSubir);
    clearInterval(gameLoopSubir);
    document.removeEventListener("keydown", keydownSubir);
    document.removeEventListener("keyup", keyupSubir);
    exibirElemento(document.getElementById("modalSubir"), "nenhum");
    if (pontosSubir > melhorPontuacaoSubir) melhorPontuacaoSubir = pontosSubir;
    if (pontosSubir >= 50) desbloquearConquista("subir_50");
}

document.querySelectorAll("[data-direcao]").forEach(botao => {
    const direcao = botao.dataset.direcao;
    botao.addEventListener("pointerdown", evento => {
        if (!teclasSubir) return;
        botao.setPointerCapture(evento.pointerId);
        teclasSubir[direcao] = true;
    });
    botao.addEventListener("lostpointercapture", () => {
        if (teclasSubir) teclasSubir[direcao] = false;
    });
});

function keydownSubir(e) {
    teclasSubir[e.key] = true;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
}

function keyupSubir(e) {
    teclasSubir[e.key] = false;
}

function atualizarSubir() {
    if (teclasSubir["ArrowLeft"]) jogadorSubir.vx = -6;
    else if (teclasSubir["ArrowRight"]) jogadorSubir.vx = 6;
    else jogadorSubir.vx *= 0.85;
    jogadorSubir.vy += 0.6;
    jogadorSubir.x += jogadorSubir.vx;
    jogadorSubir.y += jogadorSubir.vy;
    if (jogadorSubir.x > 400) jogadorSubir.x = -jogadorSubir.largura;
    if (jogadorSubir.x < -jogadorSubir.largura) jogadorSubir.x = 400;
    for (var i = 0; i < plataformasSubir.length; i++) {
        var p = plataformasSubir[i];
        if (p.velocidade > 0) {
            p.x += p.velocidade * p.direcao;
            if (p.x <= -30) { p.x = -30;
                p.direcao = 1; }
            if (p.x + p.largura >= 430) { p.x = 430 - p.largura;
                p.direcao = -1; }
        }
    }
    jogadorSubir.noChao = false;
    for (var i = 0; i < plataformasSubir.length; i++) {
        var p = plataformasSubir[i];
        if (jogadorSubir.vy > 0) {
            var peCerebro = jogadorSubir.y + jogadorSubir.altura,
                peAnterior = peCerebro - jogadorSubir.vy;
            if (peCerebro >= p.y && peAnterior <= p.y + 8 &&
                jogadorSubir.x + jogadorSubir.largura - 10 > p.x &&
                jogadorSubir.x + 10 < p.x + p.largura) {
                jogadorSubir.vy = -11;
                jogadorSubir.y = p.y - jogadorSubir.altura;
                jogadorSubir.noChao = true;
                if (jogadorSubir.ultimaPlataforma !== p.id) {
                    jogadorSubir.ultimaPlataforma = p.id;
                    pontosSubir += 10;
                    document.getElementById("pontosSubir").innerText = pontosSubir;
                    if (pontosSubir > melhorPontuacaoSubir)
                        document.getElementById("melhorSubir").innerText = pontosSubir;
                }
            }
        }
    }
    var maiorId = 0,
        maisAlta = 9999;
    for (var k = 0; k < plataformasSubir.length; k++) {
        if (plataformasSubir[k].id > maiorId) maiorId = plataformasSubir[k].id;
        if (plataformasSubir[k].y < maisAlta) maisAlta = plataformasSubir[k].y;
    }
    while (maisAlta > -100) {
        maiorId++;
        plataformasSubir.push({
            id: maiorId,
            x: Math.random() * 310,
            y: maisAlta - 65 - Math.random() * 20,
            largura: 70 + Math.random() * 40,
            altura: 10,
            velocidade: Math.random() < 0.2 ? 0 : 0.5 + Math.random() * 2.5,
            direcao: Math.random() > 0.5 ? 1 : -1
        });
        maisAlta -= 65;
    }
    for (var n = plataformasSubir.length - 1; n >= 0; n--) {
        if (plataformasSubir[n].y > 500 && plataformasSubir.length > 50)
            plataformasSubir.splice(n, 1);
    }
    if (jogadorSubir.y < 180) {
        var diff = 180 - jogadorSubir.y;
        jogadorSubir.y = 180;
        for (var j = 0; j < plataformasSubir.length; j++)
            plataformasSubir[j].y += diff;
    }
    if (jogadorSubir.y > 430) {
        clearInterval(gameLoopSubir);
        setTimeout(function () {
            document.getElementById("resultadoSubir").textContent =
                `Fim de jogo. Pontuação: ${pontosSubir}. Melhor: ${melhorPontuacaoSubir}.`;
            document.getElementById("melhorSubir").textContent = melhorPontuacaoSubir;
        }, 100);
        return;
    }
    desenharSubir();
}

function desenharSubir() {
    var grad = ctxSubir.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, "#0a0520");
    grad.addColorStop(0.5, "#1a0a2e");
    grad.addColorStop(1, "#2d1b4e");
    ctxSubir.fillStyle = grad;
    ctxSubir.fillRect(0, 0, 400, 400);
    for (var i = 0; i < plataformasSubir.length; i++) {
        var p = plataformasSubir[i];
        if (p.y < -50 || p.y > 450) continue;
        ctxSubir.fillStyle = "rgba(0,0,0,0.3)";
        ctxSubir.fillRect(p.x + 2, p.y + 2, p.largura, p.altura);
        var pg = ctxSubir.createLinearGradient(p.x, p.y, p.x, p.y + p.altura);
        pg.addColorStop(0, "#a855f7");
        pg.addColorStop(1, "#6f42c1");
        ctxSubir.fillStyle = pg;
        ctxSubir.fillRect(p.x, p.y, p.largura, p.altura);
        ctxSubir.fillStyle = "rgba(255,255,255,0.3)";
        ctxSubir.fillRect(p.x, p.y, p.largura, 3);
    }
    ctxSubir.font = "30px Arial";
    ctxSubir.fillText("🧠", jogadorSubir.x - 2, jogadorSubir.y + 28);
}

// ========== CAÇA-PALAVRAS ==========
function abrirCacaPalavras() {
    var sorteadas = [],
        copia = bancoPalavras.slice();
    for (var i = 0; i < 8; i++) {
        var idx = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia[idx]);
        copia.splice(idx, 1);
    }
    palavrasCaca = sorteadas;
    palavrasEncontradasCaca = [];
    dicasCaca = 3;
    selecaoCaca = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };
    document.getElementById("palavrasEncontradas").innerText = "0/8";
    document.getElementById("dicasRestantes").innerText = dicasCaca;
    document.getElementById("btnDica").disabled = false;
    gerarGradeCacaPalavras();
    exibirElemento(document.getElementById("modalCacaPalavras"), "flex");
}

function fecharCacaPalavras() {
    exibirElemento(document.getElementById("modalCacaPalavras"), "nenhum");
}

function gerarGradeCacaPalavras() {
    gradeCaca = [];
    for (var i = 0; i < 10; i++) {
        gradeCaca[i] = [];
        for (var j = 0; j < 10; j++) gradeCaca[i][j] = "";
    }
    for (var p = 0; p < palavrasCaca.length; p++) {
        var palavra = palavrasCaca[p],
            colocada = false,
            tentativas = 0;
        while (!colocada && tentativas < 200) {
            var dir = Math.floor(Math.random() * 3),
                row, col;
            if (dir === 0) {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * (11 - palavra.length));
            } else if (dir === 1) {
                row = Math.floor(Math.random() * (11 - palavra.length));
                col = Math.floor(Math.random() * 10);
            } else {
                row = Math.floor(Math.random() * (11 - palavra.length));
                col = Math.floor(Math.random() * (11 - palavra.length));
            }
            var cabe = true;
            for (var l = 0; l < palavra.length; l++) {
                var r = dir === 1 ? row + l : dir === 2 ? row + l : row,
                    c = dir === 0 ? col + l : dir === 2 ? col + l : col;
                if (gradeCaca[r][c] !== "" && gradeCaca[r][c] !== palavra[l]) {
                    cabe = false;
                    break;
                }
            }
            if (cabe) {
                for (var l2 = 0; l2 < palavra.length; l2++) {
                    var r2 = dir === 1 ? row + l2 : dir === 2 ? row + l2 : row,
                        c2 = dir === 0 ? col + l2 : dir === 2 ? col + l2 : col;
                    gradeCaca[r2][c2] = palavra[l2];
                }
                colocada = true;
            }
            tentativas++;
        }
        if (!colocada) {
            // Se os cruzamentos falharem, distribui as palavras pelas linhas.
            gradeCaca = Array.from({ length: 10 }, (_, linha) => {
                const letras = [...(palavrasCaca[linha] || "")];
                const margem = Math.floor(Math.random() * (11 - letras.length));
                return Array.from({ length: 10 }, (_, coluna) => letras[coluna - margem] || "");
            });
            break;
        }
    }
    var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            if (gradeCaca[i][j] === "")
                gradeCaca[i][j] = letras[Math.floor(Math.random() * letras.length)];
        }
    }
    renderizarGradeCaca();
    renderizarListaPalavras();
}

function renderizarGradeCaca() {
    const container = document.getElementById("gradeCacaPalavras");
    const celulas = gradeCaca.map((linha, row) => linha.map((letra, col) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "celula-caca";
        botao.textContent = letra;
        botao.dataset.row = row;
        botao.dataset.col = col;
        return botao;
    }));
    container.replaceChildren(...celulas.flat());

    container.onclick = event => {
        const celula = event.target.closest(".celula-caca");
        if (!celula) return;
        const row = Number(celula.dataset.row);
        const col = Number(celula.dataset.col);
        if (!selecaoCaca.ativa) {
            Object.assign(selecaoCaca, { ativa: true, inicioRow: row, inicioCol: col });
            celula.classList.add("selecionada");
            selecaoCaca.celulas.push({ row, col, el: celula });
            return;
        }

        const { inicioRow, inicioCol } = selecaoCaca;
        const dr = row - inicioRow;
        const dc = col - inicioCol;
        if (dr && dc && Math.abs(dr) !== Math.abs(dc)) {
            selecaoCaca.ativa = false;
            limparSelecaoCaca();
            return;
        }
        limparSelecaoCaca();
        for (let passo = 0; passo <= Math.max(Math.abs(dr), Math.abs(dc)); passo++) {
            const r = inicioRow + passo * Math.sign(dr);
            const c = inicioCol + passo * Math.sign(dc);
            const el = celulas[r][c];
            el.classList.add("selecionada");
            selecaoCaca.celulas.push({ row: r, col: c, el });
        }
        finalizarSelecaoCaca();
    };
}

function limparSelecaoCaca() {
    for (var i = 0; i < selecaoCaca.celulas.length; i++) {
        if (!selecaoCaca.celulas[i].el.classList.contains("encontrada"))
            selecaoCaca.celulas[i].el.classList.remove("selecionada");
    }
    selecaoCaca.celulas = [];
}

function finalizarSelecaoCaca() {
    selecaoCaca.ativa = false;
    var palavraFormada = "";
    for (var i = 0; i < selecaoCaca.celulas.length; i++)
        palavraFormada += gradeCaca[selecaoCaca.celulas[i].row][selecaoCaca.celulas[i].col];
    var encontrou = false;
    for (var j = 0; j < palavrasCaca.length; j++) {
        if ((palavrasCaca[j] === palavraFormada || palavrasCaca[j] === [...palavraFormada].reverse().join("")) && palavrasEncontradasCaca.indexOf(palavrasCaca[j]) === -1) {
            encontrou = true;
            palavrasEncontradasCaca.push(palavrasCaca[j]);
            for (var k = 0; k < selecaoCaca.celulas.length; k++) {
                selecaoCaca.celulas[k].el.classList.add("encontrada");
                selecaoCaca.celulas[k].el.classList.remove("selecionada");
            }
            document.getElementById("palavrasEncontradas").innerText =
                palavrasEncontradasCaca.length + "/8";
            atualizarListaPalavras(palavrasCaca[j]);
            if (palavrasEncontradasCaca.length === 8) {
                setTimeout(function () {
                    notificarPainel("Você encontrou todas as palavras!");
                    fecharCacaPalavras();
                }, 300);
            }
            break;
        }
    }
    if (!encontrou) limparSelecaoCaca();
    selecaoCaca.celulas = [];
}

function renderizarListaPalavras() {
    var container = document.getElementById("listaPalavras");
    container.innerHTML = "";
    for (var i = 0; i < palavrasCaca.length; i++) {
        var item = document.createElement("span");
        item.className = "palavra-item";
        item.innerText = palavrasCaca[i];
        item.id = "palavra-" + palavrasCaca[i];
        container.appendChild(item);
    }
}

function atualizarListaPalavras(palavra) {
    var el = document.getElementById("palavra-" + palavra);
    if (el) el.classList.add("encontrada");
}

function usarDica() {
    if (dicasCaca <= 0) return;
    for (var i = 0; i < palavrasCaca.length; i++) {
        if (palavrasEncontradasCaca.indexOf(palavrasCaca[i]) === -1) {
            notificarPainel("Dica: a palavra tem " + palavrasCaca[i].length + " letras e começa com " + palavrasCaca[i][0] + ".");
            dicasCaca--;
            document.getElementById("dicasRestantes").innerText = dicasCaca;
            if (dicasCaca <= 0) document.getElementById("btnDica").disabled = true;
            return;
        }
    }
}

// ========== AVATAR ==========
function emocaoDoAvatar() {
    return Object.hasOwn(nomesEmocoes, alunoAtual.avatarEmocao) ? alunoAtual.avatarEmocao : "calmo";
}

function exibirAvatarEmocao() {
    const emocao = emocaoDoAvatar();
    const avatar = document.getElementById("avatarAtual");
    avatar.replaceChildren(criarImagemEmocao(emocao));
    avatar.setAttribute("aria-label", `Mudar avatar. Amora atual: ${nomesEmocoes[emocao]}`);
}

function abrirModalAvatar() {
    if (document.getElementById("sidebarAluno").classList.contains("sidebar-aberta")) {
        mostrarMenu(false);
        document.getElementById("menuToggleMobile").focus();
    }
    const opcoes = Object.entries(nomesEmocoes).map(([emocao, nome]) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.setAttribute("aria-pressed", String(emocao === emocaoDoAvatar()));
        botao.append(criarImagemEmocao(emocao), nome);
        botao.addEventListener("click", () => {
            alunoAtual.avatarEmocao = emocao;
            exibirAvatarEmocao();
            salvarAlunos();
            fecharModalAvatar();
        });
        return botao;
    });
    document.getElementById("avataresEmocoes").replaceChildren(...opcoes);
    exibirElemento(document.getElementById("modalAvatar"), "flex");
}

function fecharModalAvatar() {
    exibirElemento(document.getElementById("modalAvatar"), "nenhum");
}

// ========== SAIR ==========
function sair() {
    if (confirm("Tem certeza que deseja sair?")) {
        api.logout();
        window.location.href = "login.html";
    }
}