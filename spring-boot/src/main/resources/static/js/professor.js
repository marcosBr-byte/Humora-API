// ===================================================================
// js/professor.js - Painel do Professor Humora
// ===================================================================

var usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
    window.location.href = "login.html";
}

// ========== ESTADO GLOBAL ==========
var alunos = JSON.parse(localStorage.getItem("alunosHumora")) || [];
var agendamentos = JSON.parse(localStorage.getItem("agendamentosHumora")) || [];
var avisosTurma = JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [];
var anotacoesProfessor = JSON.parse(localStorage.getItem("anotacoesProfessorHumora")) || [];
var alunoSelecionadoEmail = null;

// Gráficos
var graficoGeral = null;
var graficoBarra = null;
var graficoPizza = null;

// Jogo Pop-It
var pontosGameProf = 0;
var bolasEstouradasProf = 0;
var corAlvoAtualProf = "";
var tempoGameIntervalProf = null;

// Jogo Memória
var cartasMemoriaProf = [];
var cartasViradasProf = [];
var paresEncontradosProf = 0;
var tentativasMemoriaProf = 0;

// Jogo Cérebro Saltador
var canvasSubirProf;
var ctxSubirProf;
var jogadorSubirProf;
var plataformasSubirProf;
var pontosSubirProf;
var gameLoopSubirProf;
var teclasSubirProf;
var melhorPontuacaoSubirProf = 0;

// Caça-Palavras
var gradeCacaProf = [];
var palavrasCacaProf = [];
var palavrasEncontradasCacaProf = [];
var dicasCacaProf = 3;
var selecaoCacaProf = {
    ativa: false,
    inicioRow: -1,
    inicioCol: -1,
    celulas: []
};

// ========== DADOS ESTÁTICOS ==========
var bancoPalavrasProf = [
    "FELIZ", "ALEGRE", "CALMA", "PAZ", "AMOR", "GRATO", "BEM", "LUZ",
    "FORCA", "UNIAO", "VIDA", "SONHO", "TRISTE", "MEDO", "RAIVA", "CANSA",
    "RESPIRA", "OUVIR", "FALAR", "AJUDA", "CUIDA", "SORRIR", "ABRACO",
    "DANCAR", "CANTAR", "MENTE", "CORPO", "SERENO", "PLENO", "AFETO",
    "LACO", "APOIO", "LIVRE", "HUMORA", "ENSINAR", "SABER"
];

var coresGame = [
    { nome: "Vermelho", hex: "#ef4444" },
    { nome: "Azul", hex: "#3b82f6" },
    { nome: "Verde", hex: "#22c55e" },
    { nome: "Amarelo", hex: "#eab308" },
    { nome: "Roxo", hex: "#a855f7" }
];

var emocoesMeta = {
    feliz:    { emoji: "😊", nome: "Feliz",    cor: "#FFD700" },
    triste:   { emoji: "😔", nome: "Triste",   cor: "#4A90E2" },
    cansado:  { emoji: "😴", nome: "Cansado",  cor: "#B0B0B0" },
    calmo:    { emoji: "😌", nome: "Calmo",    cor: "#00C896" },
    ansioso:  { emoji: "😰", nome: "Ansioso",  cor: "#FF8C00" },
    irritado: { emoji: "😡", nome: "Irritado", cor: "#E74C3C" }
};

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
document.addEventListener("DOMContentLoaded", function () {
    if (usuarioLogado && usuarioLogado.nome) {
        var elNome = document.getElementById("nomeProfessor");
        var elArea = document.getElementById("areaProfessor");
        if (elNome) elNome.innerText = usuarioLogado.nome;
        if (elArea) elArea.innerText = usuarioLogado.area || usuarioLogado.materia || "Docente";
    }

    popularFiltros();
    aplicarFiltros();
    renderizarAgendamentos();
    renderizarAvisos();
    renderizarDiariosCompartilhados();
    renderizarConquistasProf();
    renderizarAnotacoes();
    popularSelectAlunos();
    carregarGraficoGeral();
    carregarGraficosFiltrados();
    sincronizarAlunosAPI();
});

// ==========================================================
// SINCRONIZAÇÃO COM API
// ==========================================================
async function sincronizarAlunosAPI() {
    try {
        const res = await api.getAllAlunos();
        if (!res.ok) return;
        const daApi = await res.json();
        if (!Array.isArray(daApi)) return;

        var mapaLocal = {};
        for (var i = 0; i < alunos.length; i++) {
            mapaLocal[alunos[i].email] = alunos[i];
        }

        var mesclados = [];
        for (var k = 0; k < daApi.length; k++) {
            var a = daApi[k];
            var local = mapaLocal[a.email] || {};
            mesclados.push({
                id: a.id || local.id,
                nome: a.nome || local.nome || "Sem nome",
                email: a.email,
                turma: a.turma || local.turma || "",
                avatar: local.avatar || "😊",
                historico: local.historico || [],
                diario: local.diario || [],
                conquistas: local.conquistas || [],
                streak: local.streak || 0,
                ultimaEmocao: local.ultimaEmocao || null,
                mensagensProfessor: local.mensagensProfessor || [],
                mensagensVisualizadas: local.mensagensVisualizadas || false,
                badges: local.badges || []
            });
        }

        alunos = mesclados;
        localStorage.setItem("alunosHumora", JSON.stringify(alunos));
        popularFiltros();
        popularSelectAlunos();
        aplicarFiltros();
        carregarGraficoGeral();
    } catch (e) {
        console.warn("Não foi possível sincronizar alunos com o backend:", e);
    }
}

// ==========================================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================================
function trocarTab(nomeTab, elemento) {
    var tabs = document.querySelectorAll(".tab-content");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("ativo");
    }

    var menus = document.querySelectorAll(".menu-item");
    for (var j = 0; j < menus.length; j++) {
        menus[j].classList.remove("ativo");
    }

    var tab = document.getElementById("tab-" + nomeTab);
    if (tab) tab.classList.add("ativo");
    if (elemento) elemento.classList.add("ativo");

    if (nomeTab === "dashboard") {
        setTimeout(function () { carregarGraficoGeral(); }, 200);
    }
    if (nomeTab === "graficos") {
        setTimeout(function () { carregarGraficosFiltrados(); }, 200);
    }
    if (nomeTab === "alunos") {
        aplicarFiltros();
    }
    if (nomeTab === "anotacoes") {
        renderizarAnotacoes();
    }
    if (nomeTab === "conquistas") {
        renderizarConquistasProf();
    }
}

// ==========================================================
// FILTROS E SELECTS
// ==========================================================
function popularFiltros() {
    var turmasUnicas = [];
    for (var i = 0; i < alunos.length; i++) {
        var t = alunos[i].turma;
        if (t && turmasUnicas.indexOf(t) === -1) turmasUnicas.push(t);
    }
    turmasUnicas.sort();

    var selects = [
        document.getElementById("filtroTurma"),
        document.getElementById("filtroTurmaGrafico")
    ];

    for (var s = 0; s < selects.length; s++) {
        var sel = selects[s];
        if (sel) {
            sel.innerHTML = '<option value="">Todas as Turmas</option>';
            for (var j = 0; j < turmasUnicas.length; j++) {
                sel.innerHTML += '<option value="' + turmasUnicas[j] + '">' + turmasUnicas[j] + '</option>';
            }
        }
    }

    var selAg = document.getElementById("turmaAtividade");
    if (selAg) {
        selAg.innerHTML = '<option value="">Selecione a Turma</option>';
        for (var k = 0; k < turmasUnicas.length; k++) {
            selAg.innerHTML += '<option value="' + turmasUnicas[k] + '">' + turmasUnicas[k] + '</option>';
        }
    }

    var selAviso = document.getElementById("turmaAviso");
    if (selAviso) {
        selAviso.innerHTML = '<option value="">Todas as turmas</option>';
        for (var m = 0; m < turmasUnicas.length; m++) {
            selAviso.innerHTML += '<option value="' + turmasUnicas[m] + '">' + turmasUnicas[m] + '</option>';
        }
    }
}

function popularSelectAlunos() {
    var sel = document.getElementById("selectAlunoMensagem");
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione um aluno...</option>';
    for (var i = 0; i < alunos.length; i++) {
        sel.innerHTML += '<option value="' + alunos[i].email + '">' +
            alunos[i].nome + " (" + (alunos[i].turma || "Sem Turma") + ")</option>";
    }
}

function aplicarFiltros() {
    var elBusca = document.getElementById("buscaAluno");
    var elTurma = document.getElementById("filtroTurma");
    var elEmocao = document.getElementById("filtroEmocao");

    var busca = elBusca ? elBusca.value.toLowerCase().trim() : "";
    var turma = elTurma ? elTurma.value : "";
    var emocao = elEmocao ? elEmocao.value : "";

    var filtrados = [];
    for (var i = 0; i < alunos.length; i++) {
        var a = alunos[i];
        var passaBusca = (a.nome || "").toLowerCase().indexOf(busca) !== -1;
        var passaTurma = turma === "" || a.turma === turma;

        var passaEmocao = true;
        var ult = null;
        if (a.historico && a.historico.length > 0) {
            ult = a.historico[a.historico.length - 1];
        }

        if (emocao === "alerta") {
            passaEmocao = ult && ["triste", "ansioso", "irritado"].indexOf(ult.emocao) !== -1;
        } else if (emocao !== "") {
            passaEmocao = ult && ult.emocao === emocao;
        }

        if (passaBusca && passaTurma && passaEmocao) {
            filtrados.push(a);
        }
    }

    renderizarListaAlunos(filtrados);
    atualizarCardsResumo(filtrados);
    atualizarListaAlerta(filtrados);
}

function limparFiltros() {
    var elBusca = document.getElementById("buscaAluno");
    var elTurma = document.getElementById("filtroTurma");
    var elEmocao = document.getElementById("filtroEmocao");
    if (elBusca) elBusca.value = "";
    if (elTurma) elTurma.value = "";
    if (elEmocao) elEmocao.value = "";
    aplicarFiltros();
}

// ==========================================================
// CARDS DE RESUMO DE EMOÇÕES
// ==========================================================
function atualizarCardsResumo(lista) {
    var cont = { feliz: 0, triste: 0, cansado: 0, calmo: 0, ansioso: 0, irritado: 0 };

    for (var i = 0; i < lista.length; i++) {
        var a = lista[i];
        if (a.historico && a.historico.length > 0) {
            var u = a.historico[a.historico.length - 1].emocao;
            if (cont[u] !== undefined) cont[u]++;
        }
    }

    var ids = {
        feliz:    "totalFeliz",
        triste:   "totalTriste",
        cansado:  "totalCansado",
        calmo:    "totalCalmo",
        ansioso:  "totalAnsioso",
        irritado: "totalIrritado"
    };

    for (var k in ids) {
        var el = document.getElementById(ids[k]);
        if (el) el.innerText = cont[k];
    }
}

// ==========================================================
// LISTA DE ALUNOS
// ==========================================================
function renderizarListaAlunos(lista) {
    var c = document.getElementById("listaAlunosTurma");
    if (!c) return;
    c.innerHTML = "";

    if (lista.length === 0) {
        c.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px;">Nenhum aluno encontrado.</p>';
        return;
    }

    for (var i = 0; i < lista.length; i++) {
        var a = lista[i];
        var ult = null;
        if (a.historico && a.historico.length > 0) {
            ult = a.historico[a.historico.length - 1];
        }

        var info = "Sem registros";
        if (ult && emocoesMeta[ult.emocao]) {
            info = emocoesMeta[ult.emocao].emoji + " " + emocoesMeta[ult.emocao].nome;
        }

        var alerta = ult && ["triste", "ansioso", "irritado"].indexOf(ult.emocao) !== -1;

        c.innerHTML +=
            '<div class="aluno-card ' + (alerta ? "alerta" : "") + '">' +
                '<div>' +
                    '<strong>' + a.nome + '</strong> ' +
                    '<small class="turma-tag">(' + (a.turma || "Sem Turma") + ')</small>' +
                    '<br>' +
                    '<small>Último humor: <b>' + info + '</b></small>' +
                '</div>' +
                '<div class="acoes-aluno-card">' +
                    '<button class="btn-msg" onclick="abrirModalMensagem(\'' + a.email + '\',\'' + a.nome + '\')">💬</button>' +
                    '<button class="btn-badge" onclick="abrirModalBadge(\'' + a.email + '\',\'' + a.nome + '\')">🌟</button>' +
                '</div>' +
            '</div>';
    }
}

function atualizarListaAlerta(lista) {
    var c = document.getElementById("listaAlunosAlerta");
    if (!c) return;

    var alertas = [];
    for (var i = 0; i < lista.length; i++) {
        var a = lista[i];
        var u = null;
        if (a.historico && a.historico.length > 0) {
            u = a.historico[a.historico.length - 1];
        }
        if (u && ["triste", "ansioso", "irritado"].indexOf(u.emocao) !== -1) {
            alertas.push(a);
        }
    }

    if (alertas.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:15px;">✅ Nenhum aluno em estado de alerta.</p>';
        return;
    }

    c.innerHTML = "";
    for (var j = 0; j < alertas.length; j++) {
        c.innerHTML +=
            '<div class="aluno-card alerta">' +
                '<div><strong>' + alertas[j].nome + '</strong></div>' +
                '<button class="btn-msg" onclick="abrirModalMensagem(\'' +
                alertas[j].email + '\',\'' + alertas[j].nome + '\')">💬 Apoiar</button>' +
            '</div>';
    }
}

// ==========================================================
// GRÁFICO GERAL (DASHBOARD)
// ==========================================================
function carregarGraficoGeral() {
    var canvas = document.getElementById("graficoTurma");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (graficoGeral) graficoGeral.destroy();

    var cont = { feliz: 0, triste: 0, cansado: 0, calmo: 0, ansioso: 0, irritado: 0 };
    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].historico && alunos[i].historico.length > 0) {
            var u = alunos[i].historico[alunos[i].historico.length - 1].emocao;
            if (cont[u] !== undefined) cont[u]++;
        }
    }

    var labels = [];
    var dados = [];
    var cores = [];
    var chaves = Object.keys(emocoesMeta);
    for (var k = 0; k < chaves.length; k++) {
        var e = emocoesMeta[chaves[k]];
        labels.push(e.emoji + " " + e.nome);
        dados.push(cont[chaves[k]]);
        cores.push(e.cor);
    }

    graficoGeral = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: "#94a3b8" }
                },
                x: { ticks: { color: "#f3e8ff" } }
            }
        }
    });
}

// ==========================================================
// GRÁFICOS FILTRADOS (ABA GRÁFICOS)
// ==========================================================
function carregarGraficosFiltrados() {
    var elT = document.getElementById("filtroTurmaGrafico");
    var elE = document.getElementById("filtroEmocaoGrafico");
    var t = elT ? elT.value : "";
    var e = elE ? elE.value : "";

    var filt = alunos;
    if (t) {
        filt = filt.filter(function (a) { return a.turma === t; });
    }
    if (e) {
        filt = filt.filter(function (a) {
            var u = a.historico && a.historico.length > 0 ? a.historico[a.historico.length - 1] : null;
            return u && u.emocao === e;
        });
    }

    carregarGraficoBarra(filt);
    carregarGraficoPizza(filt);
}

function carregarGraficoBarra(lista) {
    var canvas = document.getElementById("graficoBarra");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (graficoBarra) graficoBarra.destroy();

    var turmas = [];
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].turma && turmas.indexOf(lista[i].turma) === -1) {
            turmas.push(lista[i].turma);
        }
    }

    var dados = [];
    for (var j = 0; j < turmas.length; j++) {
        var contagem = 0;
        for (var k = 0; k < lista.length; k++) {
            if (lista[k].turma === turmas[j]) contagem++;
        }
        dados.push(contagem);
    }

    graficoBarra = new Chart(ctx, {
        type: "bar",
        data: {
            labels: turmas,
            datasets: [{
                data: dados,
                backgroundColor: "#a855f7",
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: "#94a3b8" } },
                x: { ticks: { color: "#f3e8ff" } }
            }
        }
    });
}

function carregarGraficoPizza(lista) {
    var canvas = document.getElementById("graficoPizza");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (graficoPizza) graficoPizza.destroy();

    var cont = { feliz: 0, triste: 0, cansado: 0, calmo: 0, ansioso: 0, irritado: 0 };
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].historico && lista[i].historico.length > 0) {
            var u = lista[i].historico[lista[i].historico.length - 1].emocao;
            if (cont[u] !== undefined) cont[u]++;
        }
    }

    var labels = [];
    var dados = [];
    var cores = [];
    var chaves = Object.keys(emocoesMeta);
    for (var k = 0; k < chaves.length; k++) {
        var e = emocoesMeta[chaves[k]];
        labels.push(e.emoji + " " + e.nome);
        dados.push(cont[chaves[k]]);
        cores.push(e.cor);
    }

    graficoPizza = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: "#18032b"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#cbd5e1", padding: 15, font: { size: 11 } }
                }
            }
        }
    });
}

function atualizarGraficosFiltrados() {
    carregarGraficosFiltrados();
}

function limparFiltrosGraficos() {
    var elT = document.getElementById("filtroTurmaGrafico");
    var elE = document.getElementById("filtroEmocaoGrafico");
    if (elT) elT.value = "";
    if (elE) elE.value = "";
    carregarGraficosFiltrados();
}

// ==========================================================
// MENSAGENS PARA ALUNOS
// ==========================================================
function abrirModalMensagem(email, nome) {
    alunoSelecionadoEmail = email;
    var el = document.getElementById("nomeAlunoModal");
    if (el) el.innerText = nome || "Aluno";
    var modal = document.getElementById("modalMensagem");
    if (modal) modal.style.display = "flex";
}

function fecharModal() {
    var modal = document.getElementById("modalMensagem");
    if (modal) modal.style.display = "none";
    var texto = document.getElementById("textoMensagemModal");
    if (texto) texto.value = "";
    alunoSelecionadoEmail = null;
}

function enviarMensagem() {
    var elTexto = document.getElementById("textoMensagemModal");
    var texto = elTexto ? elTexto.value.trim() : "";
    if (!texto) return alert("Digite uma mensagem!");

    var idx = -1;
    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].email === alunoSelecionadoEmail) {
            idx = i;
            break;
        }
    }

    if (idx !== -1) {
        if (!alunos[idx].mensagensProfessor) alunos[idx].mensagensProfessor = [];
        alunos[idx].mensagensProfessor.push({
            professor: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Professor",
            texto: texto,
            data: new Date().toLocaleDateString("pt-BR") + " " +
                  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        });
        alunos[idx].mensagensVisualizadas = false;
        localStorage.setItem("alunosHumora", JSON.stringify(alunos));
        alert("Mensagem enviada! 📩");
        fecharModal();
    }
}

function enviarMensagemDireta() {
    var sel = document.getElementById("selectAlunoMensagem");
    var elTexto = document.getElementById("textoMensagemProf");
    if (!sel || !elTexto) return;

    var texto = elTexto.value.trim();
    if (!sel.value) return alert("Selecione um aluno!");
    if (!texto) return alert("Digite uma mensagem!");

    var idx = -1;
    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].email === sel.value) {
            idx = i;
            break;
        }
    }

    if (idx !== -1) {
        if (!alunos[idx].mensagensProfessor) alunos[idx].mensagensProfessor = [];
        alunos[idx].mensagensProfessor.push({
            professor: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Professor",
            texto: texto,
            data: new Date().toLocaleDateString("pt-BR") + " " +
                  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        });
        alunos[idx].mensagensVisualizadas = false;
        localStorage.setItem("alunosHumora", JSON.stringify(alunos));
        alert("Mensagem enviada! 📩");
        elTexto.value = "";
    }
}

// ==========================================================
// BADGES / RECONHECIMENTO
// ==========================================================
function abrirModalBadge(email, nome) {
    alunoSelecionadoEmail = email;
    var el = document.getElementById("nomeAlunoBadge");
    if (el) el.innerText = nome;
    var modal = document.getElementById("modalBadge");
    if (modal) modal.style.display = "flex";
}

function fecharModalBadge() {
    var modal = document.getElementById("modalBadge");
    if (modal) modal.style.display = "none";
    alunoSelecionadoEmail = null;
}

function enviarBadge(badge) {
    var idx = -1;
    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].email === alunoSelecionadoEmail) {
            idx = i;
            break;
        }
    }

    if (idx !== -1) {
        if (!alunos[idx].badges) alunos[idx].badges = [];
        alunos[idx].badges.push({
            badge: badge,
            professor: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Professor",
            data: new Date().toLocaleDateString("pt-BR")
        });
        localStorage.setItem("alunosHumora", JSON.stringify(alunos));
        alert("Reconhecimento enviado! 🎉");
        fecharModalBadge();
    }
}

// ==========================================================
// AGENDAMENTOS / ATIVIDADES
// ==========================================================
function salvarAgendamento(e) {
    if (e) e.preventDefault();

    var elTitulo = document.getElementById("tituloAtividade");
    var elData = document.getElementById("dataAtividade");
    var elTurma = document.getElementById("turmaAtividade");

    var titulo = elTitulo ? elTitulo.value.trim() : "";
    var data = elData ? elData.value : "";
    var turma = elTurma ? elTurma.value : "";

    if (!titulo || !data || !turma) return;

    agendamentos.push({
        id: Date.now(),
        titulo: titulo,
        data: data,
        turma: turma,
        professor: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Professor"
    });

    localStorage.setItem("agendamentosHumora", JSON.stringify(agendamentos));

    var form = document.getElementById("formAgendamento");
    if (form) form.reset();

    renderizarAgendamentos();
    alert("Atividade agendada!");
}

function renderizarAgendamentos() {
    var c = document.getElementById("listaAgendamentos");
    if (!c) return;

    if (agendamentos.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;font-size:12px;">Nenhuma atividade.</p>';
        return;
    }

    c.innerHTML = "";
    for (var i = 0; i < agendamentos.length; i++) {
        var a = agendamentos[i];
        c.innerHTML +=
            '<div class="item-mini">' +
                '<div>' +
                    '<strong>' + a.titulo + '</strong> ' +
                    '<small>(' + a.turma + ')</small>' +
                    '<br>' +
                    '<small>📅 ' + a.data + '</small>' +
                '</div>' +
                '<button onclick="removerAgendamento(' + a.id + ')" class="btn-deletar">&times;</button>' +
            '</div>';
    }
}

function removerAgendamento(id) {
    var novos = [];
    for (var i = 0; i < agendamentos.length; i++) {
        if (agendamentos[i].id !== id) novos.push(agendamentos[i]);
    }
    agendamentos = novos;
    localStorage.setItem("agendamentosHumora", JSON.stringify(agendamentos));
    renderizarAgendamentos();
}

// ==========================================================
// AVISOS DE TURMA
// ==========================================================
function publicarAvisoTurma() {
    var elTexto = document.getElementById("textoAvisoTurma");
    var texto = elTexto ? elTexto.value.trim() : "";
    if (!texto) return alert("Digite o aviso!");

    var elTurma = document.getElementById("turmaAviso");
    var turma = elTurma ? elTurma.value : "";

    avisosTurma.push({
        id: Date.now(),
        texto: texto,
        turma: turma || null,
        data: new Date().toLocaleDateString("pt-BR"),
        professor: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Professor"
    });

    localStorage.setItem("avisosTurmaHumora", JSON.stringify(avisosTurma));
    elTexto.value = "";
    renderizarAvisos();
}

function renderizarAvisos() {
    var c = document.getElementById("listaAvisosProf");
    if (!c) return;

    if (avisosTurma.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;font-size:12px;">Nenhum aviso.</p>';
        return;
    }

    c.innerHTML = "";
    for (var i = 0; i < avisosTurma.length; i++) {
        var a = avisosTurma[i];
        var tagTurma = a.turma ? "(" + a.turma + ")" : "(Todas)";
        c.innerHTML +=
            '<div class="item-mini">' +
                '<div>' +
                    '<span>📌 "' + a.texto + '"</span> ' +
                    '<small>' + tagTurma + '</small>' +
                    '<br>' +
                    '<small>' + a.data + '</small>' +
                '</div>' +
                '<button onclick="removerAviso(' + a.id + ')" class="btn-deletar">&times;</button>' +
            '</div>';
    }
}

function removerAviso(id) {
    var novos = [];
    for (var i = 0; i < avisosTurma.length; i++) {
        if (avisosTurma[i].id !== id) novos.push(avisosTurma[i]);
    }
    avisosTurma = novos;
    localStorage.setItem("avisosTurmaHumora", JSON.stringify(avisosTurma));
    renderizarAvisos();
}

// ==========================================================
// ANOTAÇÕES DO PROFESSOR
// ==========================================================
function adicionarAnotacao() {
    var el = document.getElementById("novaAnotacaoTexto");
    var texto = el ? el.value.trim() : "";
    if (!texto) return alert("Digite uma anotação!");

    anotacoesProfessor.push({
        id: Date.now(),
        texto: texto,
        data: new Date().toLocaleDateString("pt-BR") + " " +
              new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });

    localStorage.setItem("anotacoesProfessorHumora", JSON.stringify(anotacoesProfessor));
    el.value = "";
    renderizarAnotacoes();
    alert("📝 Anotação salva!");
}

function renderizarAnotacoes() {
    var c = document.getElementById("containerAnotacoes");
    if (!c) return;

    if (anotacoesProfessor.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">📋 Nenhuma anotação.</p>';
        return;
    }

    c.innerHTML = "";
    for (var i = anotacoesProfessor.length - 1; i >= 0; i--) {
        var a = anotacoesProfessor[i];
        c.innerHTML +=
            '<div class="anotacao-card">' +
                '<span onclick="removerAnotacao(' + a.id + ')" class="fechar-anotacao">&times;</span>' +
                '<p>' + a.texto + '</p>' +
                '<p class="anotacao-data">📅 ' + a.data + '</p>' +
            '</div>';
    }
}

function removerAnotacao(id) {
    var novas = [];
    for (var i = 0; i < anotacoesProfessor.length; i++) {
        if (anotacoesProfessor[i].id !== id) novas.push(anotacoesProfessor[i]);
    }
    anotacoesProfessor = novas;
    localStorage.setItem("anotacoesProfessorHumora", JSON.stringify(anotacoesProfessor));
    renderizarAnotacoes();
}

// ==========================================================
// DIÁRIOS COMPARTILHADOS
// ==========================================================
function renderizarDiariosCompartilhados() {
    var c = document.getElementById("containerDiariosCompartilhados");
    if (!c) return;
    c.innerHTML = "";

    var encontrados = 0;
    for (var i = 0; i < alunos.length; i++) {
        var a = alunos[i];
        if (a.diario) {
            for (var j = 0; j < a.diario.length; j++) {
                if (a.diario[j].compartilhado) {
                    encontrados++;
                    c.innerHTML +=
                        '<div class="item-mini flex-col">' +
                            '<div>' +
                                '<strong>' + a.nome + ' (' + (a.turma || "Sem Turma") + ')</strong>' +
                                '<small> ' + (a.diario[j].data || "Hoje") + '</small>' +
                            '</div>' +
                            '<p style="font-size:13px;color:#cbd5e1;">📖 "' + a.diario[j].texto + '"</p>' +
                        '</div>';
                }
            }
        }
    }

    if (encontrados === 0) {
        c.innerHTML = '<p style="color:#94a3b8;font-size:12px;">Nenhum diário compartilhado.</p>';
    }
}

// ==========================================================
// CONQUISTAS DO PROFESSOR
// ==========================================================
function renderizarConquistasProf() {
    var c = document.getElementById("containerConquistasProf");
    if (!c) return;

    var enviouMensagem = false;
    var enviouBadge = false;

    for (var i = 0; i < alunos.length; i++) {
        if (alunos[i].mensagensProfessor && alunos[i].mensagensProfessor.length > 0) enviouMensagem = true;
        if (alunos[i].badges && alunos[i].badges.length > 0) enviouBadge = true;
    }

    var conquistas = [
        {
            icone: "🏠",
            titulo: "Primeiro Acesso",
            desc: "Acessou o painel do professor",
            desbloqueada: true
        },
        {
            icone: "💬",
            titulo: "Ouvidor Atento",
            desc: "Enviou mensagem de apoio",
            desbloqueada: enviouMensagem
        },
        {
            icone: "🌟",
            titulo: "Impulsionador",
            desc: "Enviou reconhecimento (badge)",
            desbloqueada: enviouBadge
        },
        {
            icone: "📅",
            titulo: "Planejador",
            desc: "Agendou uma atividade",
            desbloqueada: agendamentos.length > 0
        },
        {
            icone: "📢",
            titulo: "Comunicador",
            desc: "Publicou um aviso no mural",
            desbloqueada: avisosTurma.length > 0
        },
        {
            icone: "📝",
            titulo: "Organizador",
            desc: "Criou anotações pessoais",
            desbloqueada: anotacoesProfessor.length > 0
        }
    ];

    c.innerHTML = "";
    for (var j = 0; j < conquistas.length; j++) {
        var con = conquistas[j];
        c.innerHTML +=
            '<div class="conquista-prof-card ' + (con.desbloqueada ? "ativa" : "bloqueada") + '">' +
                '<span style="font-size:32px;">' + con.icone + '</span>' +
                '<strong>' + con.titulo + '</strong>' +
                '<small>' + con.desc + '</small>' +
            '</div>';
    }
}

// ==========================================================
// JOGO POP-IT (CORES)
// ==========================================================
function abrirModalGameProf() {
    pontosGameProf = 0;
    bolasEstouradasProf = 0;
    var elPontos = document.getElementById("gamePontosProf");
    if (elPontos) elPontos.innerText = "0";
    gerarRodadaGameProf();
    var modal = document.getElementById("modalGameProf");
    if (modal) modal.style.display = "flex";
}

function fecharModalGameProf() {
    clearInterval(tempoGameIntervalProf);
    var modal = document.getElementById("modalGameProf");
    if (modal) modal.style.display = "none";
}

function gerarRodadaGameProf() {
    clearInterval(tempoGameIntervalProf);

    var sort = coresGame[Math.floor(Math.random() * coresGame.length)];
    corAlvoAtualProf = sort.nome;

    var elAlvo = document.getElementById("corAlvoTextoProf");
    if (elAlvo) {
        elAlvo.innerText = sort.nome;
        elAlvo.style.color = sort.hex;
    }

    var grid = document.getElementById("gridBolasGameProf");
    if (!grid) return;
    grid.innerHTML = "";

    var bolas = [sort];
    for (var i = 0; i < 11; i++) {
        bolas.push(coresGame[Math.floor(Math.random() * coresGame.length)]);
    }
    bolas.sort(function () { return Math.random() - 0.5; });

    for (var j = 0; j < bolas.length; j++) {
        (function (cor) {
            var bola = document.createElement("div");
            bola.className = "bola-game";
            bola.style.backgroundColor = cor.hex;
            bola.onclick = function () { clicarBolaGameProf(cor.nome, bola); };
            grid.appendChild(bola);
        })(bolas[j]);
    }

    var tempo = bolasEstouradasProf >= 5 ? 3 : 5;
    iniciarTimerGameProf(tempo);
}

function iniciarTimerGameProf(tempo) {
    var barra = document.getElementById("barraTempoProgressoProf");
    if (barra) {
        barra.style.transition = "none";
        barra.style.width = "100%";
        setTimeout(function () {
            barra.style.transition = "width " + tempo + "s linear";
            barra.style.width = "0%";
        }, 50);
    }

    var r = tempo;
    var elTempo = document.getElementById("tempoGameTextoProf");
    if (elTempo) elTempo.innerText = r + "s";

    tempoGameIntervalProf = setInterval(function () {
        r--;
        if (elTempo) elTempo.innerText = r + "s";
        if (r <= 0) {
            clearInterval(tempoGameIntervalProf);
            pontosGameProf = 0;
            bolasEstouradasProf = 0;
            var elP = document.getElementById("gamePontosProf");
            if (elP) elP.innerText = "0";
            alert("⏰ Tempo esgotado!");
            gerarRodadaGameProf();
        }
    }, 1000);
}

function clicarBolaGameProf(cor, el) {
    if (cor === corAlvoAtualProf) {
        clearInterval(tempoGameIntervalProf);
        pontosGameProf += 10;
        bolasEstouradasProf++;
        var elP = document.getElementById("gamePontosProf");
        if (elP) elP.innerText = pontosGameProf;
        el.style.transform = "scale(0)";
        el.style.opacity = "0";
        setTimeout(function () { gerarRodadaGameProf(); }, 200);
    } else {
        el.classList.add("erro-shake");
        setTimeout(function () { el.classList.remove("erro-shake"); }, 400);
    }
}

// ==========================================================
// JOGO MEMÓRIA
// ==========================================================
function abrirJogoMemoriaProf() {
    var emojis = ["😊", "😔", "😴", "😌", "😰", "😡", "🥰", "😎"];
    cartasMemoriaProf = emojis.concat(emojis).sort(function () { return Math.random() - 0.5; });
    cartasViradasProf = [];
    paresEncontradosProf = 0;
    tentativasMemoriaProf = 0;

    var elT = document.getElementById("tentativasMemoriaProf");
    if (elT) elT.innerText = "0";

    var modal = document.getElementById("modalMemoriaProf");
    if (modal) modal.style.display = "flex";

    renderizarMemoriaProf();
}

function fecharJogoMemoriaProf() {
    var modal = document.getElementById("modalMemoriaProf");
    if (modal) modal.style.display = "none";
}

function renderizarMemoriaProf() {
    var grid = document.getElementById("gridMemoriaProf");
    if (!grid) return;
    grid.innerHTML = "";

    for (var i = 0; i < cartasMemoriaProf.length; i++) {
        (function (emoji) {
            var carta = document.createElement("div");
            carta.className = "carta-memoria";
            carta.innerText = "?";
            carta.onclick = function () { virarCartaProf(carta, emoji); };
            grid.appendChild(carta);
        })(cartasMemoriaProf[i]);
    }
}

function virarCartaProf(carta, emoji) {
    if (cartasViradasProf.length === 2 ||
        carta.classList.contains("virada") ||
        carta.classList.contains("par")) return;

    carta.classList.add("virada");
    carta.innerText = emoji;
    cartasViradasProf.push({ carta: carta, emoji: emoji });

    if (cartasViradasProf.length === 2) {
        tentativasMemoriaProf++;
        var elT = document.getElementById("tentativasMemoriaProf");
        if (elT) elT.innerText = tentativasMemoriaProf;

        if (cartasViradasProf[0].emoji === cartasViradasProf[1].emoji) {
            cartasViradasProf[0].carta.classList.add("par");
            cartasViradasProf[1].carta.classList.add("par");
            paresEncontradosProf++;
            cartasViradasProf = [];

            if (paresEncontradosProf === 8) {
                setTimeout(function () {
                    alert("🎉 Parabéns!");
                    fecharJogoMemoriaProf();
                }, 500);
            }
        } else {
            var c1 = cartasViradasProf[0].carta;
            var c2 = cartasViradasProf[1].carta;
            setTimeout(function () {
                c1.classList.remove("virada");
                c1.innerText = "?";
                c2.classList.remove("virada");
                c2.innerText = "?";
                cartasViradasProf = [];
            }, 800);
        }
    }
}

// ==========================================================
// JOGO CÉREBRO SALTADOR
// ==========================================================
function abrirJogoSubirProf() {
    var modal = document.getElementById("modalSubirProf");
    if (modal) modal.style.display = "flex";

    setTimeout(function () {
        canvasSubirProf = document.getElementById("canvasSubirProf");
        if (!canvasSubirProf) return;
        ctxSubirProf = canvasSubirProf.getContext("2d");

        jogadorSubirProf = {
            x: 175,
            y: 335,
            vx: 0,
            vy: 0,
            largura: 35,
            altura: 35,
            noChao: true,
            ultimaPlataforma: 0
        };

        plataformasSubirProf = [
            { id: 0, x: 100, y: 370, largura: 160, altura: 12, velocidade: 0, direcao: 0 },
            { id: 1, x: 140, y: 300, largura: 100, altura: 10, velocidade: 0, direcao: 0 },
            { id: 2, x: 60,  y: 235, largura: 90,  altura: 10, velocidade: 0.8, direcao: 1 }
        ];

        var idC = 3;
        for (var i = 0; i < 50; i++) {
            plataformasSubirProf.push({
                id: idC++,
                x: Math.random() * 310,
                y: 170 - i * 65,
                largura: 75 + Math.random() * 35,
                altura: 10,
                velocidade: i < 3 ? 0 : 0.5 + Math.random() * 2.5,
                direcao: Math.random() > 0.5 ? 1 : -1
            });
        }

        pontosSubirProf = 0;
        teclasSubirProf = {};

        var elP = document.getElementById("pontosSubirProf");
        if (elP) elP.innerText = "0";
        var elM = document.getElementById("melhorSubirProf");
        if (elM) elM.innerText = melhorPontuacaoSubirProf;

        document.addEventListener("keydown", keydownSubirProf);
        document.addEventListener("keyup", keyupSubirProf);

        clearInterval(gameLoopSubirProf);
        gameLoopSubirProf = setInterval(atualizarSubirProf, 16);
    }, 200);
}

function fecharJogoSubirProf() {
    clearInterval(gameLoopSubirProf);
    document.removeEventListener("keydown", keydownSubirProf);
    document.removeEventListener("keyup", keyupSubirProf);

    var modal = document.getElementById("modalSubirProf");
    if (modal) modal.style.display = "none";

    if (pontosSubirProf > melhorPontuacaoSubirProf) {
        melhorPontuacaoSubirProf = pontosSubirProf;
    }
}

function keydownSubirProf(e) {
    teclasSubirProf[e.key] = true;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
}

function keyupSubirProf(e) {
    teclasSubirProf[e.key] = false;
}

function atualizarSubirProf() {
    // Controle horizontal
    if (teclasSubirProf["ArrowLeft"]) {
        jogadorSubirProf.vx = -6;
    } else if (teclasSubirProf["ArrowRight"]) {
        jogadorSubirProf.vx = 6;
    } else {
        jogadorSubirProf.vx *= 0.85;
    }

    // Gravidade
    jogadorSubirProf.vy += 0.6;
    jogadorSubirProf.x += jogadorSubirProf.vx;
    jogadorSubirProf.y += jogadorSubirProf.vy;

    // Wrap horizontal
    if (jogadorSubirProf.x > 400) jogadorSubirProf.x = -jogadorSubirProf.largura;
    if (jogadorSubirProf.x < -jogadorSubirProf.largura) jogadorSubirProf.x = 400;

    // Move plataformas móveis
    for (var i = 0; i < plataformasSubirProf.length; i++) {
        var p = plataformasSubirProf[i];
        if (p.velocidade > 0) {
            p.x += p.velocidade * p.direcao;
            if (p.x <= -30) { p.x = -30; p.direcao = 1; }
            if (p.x + p.largura >= 430) { p.x = 430 - p.largura; p.direcao = -1; }
        }
    }

    // Colisão com plataformas
    jogadorSubirProf.noChao = false;
    for (var j = 0; j < plataformasSubirProf.length; j++) {
        var pj = plataformasSubirProf[j];
        if (jogadorSubirProf.vy > 0) {
            var pe = jogadorSubirProf.y + jogadorSubirProf.altura;
            var peA = pe - jogadorSubirProf.vy;
            if (pe >= pj.y &&
                peA <= pj.y + 8 &&
                jogadorSubirProf.x + jogadorSubirProf.largura - 10 > pj.x &&
                jogadorSubirProf.x + 10 < pj.x + pj.largura) {

                jogadorSubirProf.vy = -11;
                jogadorSubirProf.y = pj.y - jogadorSubirProf.altura;
                jogadorSubirProf.noChao = true;

                if (jogadorSubirProf.ultimaPlataforma !== pj.id) {
                    jogadorSubirProf.ultimaPlataforma = pj.id;
                    pontosSubirProf += 10;
                    var elP = document.getElementById("pontosSubirProf");
                    if (elP) elP.innerText = pontosSubirProf;
                    if (pontosSubirProf > melhorPontuacaoSubirProf) {
                        var elM = document.getElementById("melhorSubirProf");
                        if (elM) elM.innerText = pontosSubirProf;
                    }
                }
            }
        }
    }

    // Gera mais plataformas acima
    var maiorId = 0;
    var maisAlta = 9999;
    for (var k = 0; k < plataformasSubirProf.length; k++) {
        if (plataformasSubirProf[k].id > maiorId) maiorId = plataformasSubirProf[k].id;
        if (plataformasSubirProf[k].y < maisAlta) maisAlta = plataformasSubirProf[k].y;
    }

    while (maisAlta > -100) {
        maiorId++;
        plataformasSubirProf.push({
            id: maiorId,
            x: Math.random() * 310,
            y: maisAlta - 65,
            largura: 70 + Math.random() * 40,
            altura: 10,
            velocidade: Math.random() < 0.2 ? 0 : 0.5 + Math.random() * 2.5,
            direcao: Math.random() > 0.5 ? 1 : -1
        });
        maisAlta -= 65;
    }

    // Remove plataformas muito abaixo
    for (var n = plataformasSubirProf.length - 1; n >= 0; n--) {
        if (plataformasSubirProf[n].y > 500 && plataformasSubirProf.length > 50) {
            plataformasSubirProf.splice(n, 1);
        }
    }

    // Scroll da câmera
    if (jogadorSubirProf.y < 180) {
        var diff = 180 - jogadorSubirProf.y;
        jogadorSubirProf.y = 180;
        for (var m = 0; m < plataformasSubirProf.length; m++) {
            plataformasSubirProf[m].y += diff;
        }
    }

    // Game over
    if (jogadorSubirProf.y > 430) {
        clearInterval(gameLoopSubirProf);
        setTimeout(function () {
            alert("🧠 Fim de jogo! Pontuação: " + pontosSubirProf);
            fecharJogoSubirProf();
        }, 100);
        return;
    }

    desenharSubirProf();
}

function desenharSubirProf() {
    var grad = ctxSubirProf.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, "#0a0520");
    grad.addColorStop(0.5, "#1a0a2e");
    grad.addColorStop(1, "#2d1b4e");
    ctxSubirProf.fillStyle = grad;
    ctxSubirProf.fillRect(0, 0, 400, 400);

    for (var i = 0; i < plataformasSubirProf.length; i++) {
        var p = plataformasSubirProf[i];
        if (p.y < -50 || p.y > 450) continue;

        ctxSubirProf.fillStyle = "rgba(0,0,0,0.3)";
        ctxSubirProf.fillRect(p.x + 2, p.y + 2, p.largura, p.altura);

        var pg = ctxSubirProf.createLinearGradient(p.x, p.y, p.x, p.y + p.altura);
        pg.addColorStop(0, "#a855f7");
        pg.addColorStop(1, "#6f42c1");
        ctxSubirProf.fillStyle = pg;
        ctxSubirProf.fillRect(p.x, p.y, p.largura, p.altura);

        ctxSubirProf.fillStyle = "rgba(255,255,255,0.3)";
        ctxSubirProf.fillRect(p.x, p.y, p.largura, 3);
    }

    ctxSubirProf.font = "30px Arial";
    ctxSubirProf.fillText("🧠", jogadorSubirProf.x - 2, jogadorSubirProf.y + 28);
}

// ==========================================================
// CAÇA-PALAVRAS
// ==========================================================
function abrirCacaPalavrasProf() {
    var sort = [];
    var copia = bancoPalavrasProf.slice();

    for (var i = 0; i < 8; i++) {
        var idx = Math.floor(Math.random() * copia.length);
        sort.push(copia[idx]);
        copia.splice(idx, 1);
    }

    palavrasCacaProf = sort;
    palavrasEncontradasCacaProf = [];
    dicasCacaProf = 3;
    selecaoCacaProf = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };

    var elP = document.getElementById("palavrasEncontradasProf");
    if (elP) elP.innerText = "0/8";
    var elD = document.getElementById("dicasRestantesProf");
    if (elD) elD.innerText = dicasCacaProf;
    var btnD = document.getElementById("btnDicaProf");
    if (btnD) btnD.disabled = false;

    gerarGradeCacaProf();

    var modal = document.getElementById("modalCacaPalavrasProf");
    if (modal) modal.style.display = "flex";
}

function fecharCacaPalavrasProf() {
    var modal = document.getElementById("modalCacaPalavrasProf");
    if (modal) modal.style.display = "none";
}

function gerarGradeCacaProf() {
    gradeCacaProf = [];
    for (var i = 0; i < 10; i++) {
        gradeCacaProf[i] = [];
        for (var j = 0; j < 10; j++) gradeCacaProf[i][j] = "";
    }

    for (var p = 0; p < palavrasCacaProf.length; p++) {
        var palavra = palavrasCacaProf[p];
        var colocada = false;
        var tent = 0;

        while (!colocada && tent < 200) {
            var dir = Math.floor(Math.random() * 3);
            var row, col;

            if (dir === 0) {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * (10 - palavra.length));
            } else if (dir === 1) {
                row = Math.floor(Math.random() * (10 - palavra.length));
                col = Math.floor(Math.random() * 10);
            } else {
                row = Math.floor(Math.random() * (10 - palavra.length));
                col = Math.floor(Math.random() * (10 - palavra.length));
            }

            var cabe = true;
            for (var l = 0; l < palavra.length; l++) {
                var r = dir === 1 ? row + l : (dir === 2 ? row + l : row);
                var c = dir === 0 ? col + l : (dir === 2 ? col + l : col);
                if (gradeCacaProf[r][c] !== "" && gradeCacaProf[r][c] !== palavra[l]) {
                    cabe = false;
                    break;
                }
            }

            if (cabe) {
                for (var l2 = 0; l2 < palavra.length; l2++) {
                    var r2 = dir === 1 ? row + l2 : (dir === 2 ? row + l2 : row);
                    var c2 = dir === 0 ? col + l2 : (dir === 2 ? col + l2 : col);
                    gradeCacaProf[r2][c2] = palavra[l2];
                }
                colocada = true;
            }
            tent++;
        }
    }

    var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var a = 0; a < 10; a++) {
        for (var b = 0; b < 10; b++) {
            if (gradeCacaProf[a][b] === "") {
                gradeCacaProf[a][b] = letras[Math.floor(Math.random() * letras.length)];
            }
        }
    }

    renderizarGradeCacaProf();
    renderizarListaPalavrasProf();
}

function renderizarGradeCacaProf() {
    var c = document.getElementById("gradeCacaPalavrasProf");
    if (!c) return;
    c.innerHTML = "";
    c.style.gridTemplateColumns = "repeat(10, 32px)";

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            (function (row, col) {
                var cel = document.createElement("div");
                cel.className = "celula-caca";
                cel.innerText = gradeCacaProf[row][col];
                cel.setAttribute("data-row", row);
                cel.setAttribute("data-col", col);

                cel.addEventListener("mousedown", function (e) {
                    e.preventDefault();
                    selecaoCacaProf.ativa = true;
                    selecaoCacaProf.inicioRow = row;
                    selecaoCacaProf.inicioCol = col;
                    limparSelecaoCacaProf();
                    cel.classList.add("selecionada");
                    selecaoCacaProf.celulas.push({ row: row, col: col, el: cel });
                });

                cel.addEventListener("mouseenter", function () {
                    if (!selecaoCacaProf.ativa || selecaoCacaProf.celulas.length === 0) return;

                    var ult = selecaoCacaProf.celulas[selecaoCacaProf.celulas.length - 1];

                    if (selecaoCacaProf.celulas.length === 1) {
                        var dR = row - selecaoCacaProf.inicioRow;
                        var dC = col - selecaoCacaProf.inicioCol;
                        if (dR === 0 || dC === 0 || Math.abs(dR) === Math.abs(dC)) {
                            cel.classList.add("selecionada");
                            selecaoCacaProf.celulas.push({ row: row, col: col, el: cel });
                        }
                    } else {
                        var dRR = selecaoCacaProf.celulas[1].row - selecaoCacaProf.celulas[0].row;
                        var dCC = selecaoCacaProf.celulas[1].col - selecaoCacaProf.celulas[0].col;
                        if (row === ult.row + (dRR !== 0 ? (dRR > 0 ? 1 : -1) : 0) &&
                            col === ult.col + (dCC !== 0 ? (dCC > 0 ? 1 : -1) : 0)) {
                            cel.classList.add("selecionada");
                            selecaoCacaProf.celulas.push({ row: row, col: col, el: cel });
                        }
                    }
                });

                c.appendChild(cel);
            })(i, j);
        }
    }

    document.addEventListener("mouseup", finalizarSelecaoCacaProf);
}

function limparSelecaoCacaProf() {
    for (var i = 0; i < selecaoCacaProf.celulas.length; i++) {
        if (!selecaoCacaProf.celulas[i].el.classList.contains("encontrada")) {
            selecaoCacaProf.celulas[i].el.classList.remove("selecionada");
        }
    }
    selecaoCacaProf.celulas = [];
}

function finalizarSelecaoCacaProf() {
    selecaoCacaProf.ativa = false;

    var palavra = "";
    for (var i = 0; i < selecaoCacaProf.celulas.length; i++) {
        palavra += gradeCacaProf[selecaoCacaProf.celulas[i].row][selecaoCacaProf.celulas[i].col];
    }

    var enc = false;
    for (var j = 0; j < palavrasCacaProf.length; j++) {
        if (palavrasCacaProf[j] === palavra &&
            palavrasEncontradasCacaProf.indexOf(palavrasCacaProf[j]) === -1) {

            enc = true;
            palavrasEncontradasCacaProf.push(palavrasCacaProf[j]);

            for (var k = 0; k < selecaoCacaProf.celulas.length; k++) {
                selecaoCacaProf.celulas[k].el.classList.add("encontrada");
                selecaoCacaProf.celulas[k].el.classList.remove("selecionada");
            }

            var elP = document.getElementById("palavrasEncontradasProf");
            if (elP) elP.innerText = palavrasEncontradasCacaProf.length + "/8";

            atualizarListaPalavrasProf(palavrasCacaProf[j]);

            if (palavrasEncontradasCacaProf.length === 8) {
                setTimeout(function () {
                    alert("🎉 Parabéns!");
                    fecharCacaPalavrasProf();
                }, 300);
            }
            break;
        }
    }

    if (!enc) limparSelecaoCacaProf();
    selecaoCacaProf.celulas = [];
}

function renderizarListaPalavrasProf() {
    var c = document.getElementById("listaPalavrasProf");
    if (!c) return;
    c.innerHTML = "";

    for (var i = 0; i < palavrasCacaProf.length; i++) {
        var item = document.createElement("span");
        item.className = "palavra-item";
        item.innerText = palavrasCacaProf[i];
        item.id = "palavraProf-" + palavrasCacaProf[i];
        c.appendChild(item);
    }
}

function atualizarListaPalavrasProf(p) {
    var el = document.getElementById("palavraProf-" + p);
    if (el) el.classList.add("encontrada");
}

function usarDicaProf() {
    if (dicasCacaProf <= 0) return;

    for (var i = 0; i < palavrasCacaProf.length; i++) {
        if (palavrasEncontradasCacaProf.indexOf(palavrasCacaProf[i]) === -1) {
            alert("💡 A palavra tem " + palavrasCacaProf[i].length +
                  " letras e começa com '" + palavrasCacaProf[i][0] + "'");
            dicasCacaProf--;

            var elD = document.getElementById("dicasRestantesProf");
            if (elD) elD.innerText = dicasCacaProf;

            if (dicasCacaProf <= 0) {
                var btn = document.getElementById("btnDicaProf");
                if (btn) btn.disabled = true;
            }
            return;
        }
    }
}

// ==========================================================
// AVATAR DO PROFESSOR
// ==========================================================
function abrirModalAvatarProf() {
    var modal = document.getElementById("modalAvatarProf");
    if (modal) modal.style.display = "flex";
}

function fecharModalAvatarProf() {
    var modal = document.getElementById("modalAvatarProf");
    if (modal) modal.style.display = "none";
}

function mudarAvatarProf(emoji) {
    var el = document.getElementById("avatarProfAtual");
    if (el) el.innerText = emoji;
    fecharModalAvatarProf();
}

// ==========================================================
// SAIR
// ==========================================================
function sair() {
    if (confirm("Tem certeza que deseja sair?")) {
        api.logout();
        window.location.href = "login.html";
    }
}