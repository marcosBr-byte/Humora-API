// js/aluno.js
var usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
    window.location.href = "login.html";
}

// Inicializar dados do aluno
var alunos = JSON.parse(localStorage.getItem("alunosHumora")) || [];
var alunoAtual = null;
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

// Variáveis globais
var emocaoSelecionada = null;
var graficoSemana = null, graficoRadar = null;
var intervalRespiracao = null, intervalBloqueio = null;
var pontosGame = 0, bolasEstouradas = 0, corAlvoAtual = "", tempoGameInterval = null;
var cartasMemoria = [], cartasViradas = [], paresEncontrados = 0, tentativasMemoria = 0;
var canvasSubir, ctxSubir, jogadorSubir, plataformasSubir, pontosSubir, gameLoopSubir, teclasSubir;
var melhorPontuacaoSubir = 0;
var gradeCaca = [], palavrasCaca = [], palavrasEncontradasCaca = [], dicasCaca = 3;
var selecaoCaca = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };

var bancoPalavras = [
    "FELIZ", "ALEGRE", "CALMA", "PAZ", "AMOR", "GRATO", "BEM", "LUZ",
    "FORCA", "UNIAO", "VIDA", "SONHO", "TRISTE", "MEDO", "RAIVA", "CANSA",
    "RESPIRA", "OUVIR", "FALAR", "AJUDA", "CUIDA", "SORRIR", "ABRACO",
    "DANCAR", "CANTAR", "MENTE", "CORPO", "SERENO", "PLENO", "AFETO",
    "LACO", "APOIO", "LIVRE", "HUMORA"
];

var coresGame = [
    { nome: "Vermelho", hex: "#ef4444" },
    { nome: "Azul", hex: "#3b82f6" },
    { nome: "Verde", hex: "#22c55e" },
    { nome: "Amarelo", hex: "#eab308" },
    { nome: "Roxo", hex: "#a855f7" }
];

var emocoes = {
    feliz: { emoji: "😊", nome: "Feliz" },
    triste: { emoji: "😔", nome: "Triste" },
    cansado: { emoji: "😴", nome: "Cansado" },
    calmo: { emoji: "😌", nome: "Calmo" },
    ansioso: { emoji: "😰", nome: "Ansioso" },
    irritado: { emoji: "😡", nome: "Irritado" }
};

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
    document.getElementById("turmaAlunoSidebar").innerText = alunoAtual.turma || "Sem turma";
    document.getElementById("avatarAtual").innerText = alunoAtual.avatar || "😊";
    atualizarStreak();
    carregarHistorico();
    atualizarBadgeNotificacoes();
    carregarConquistasTab();
    iniciarMonitorBloqueio();
    carregarDiariosBackend();
});

// ========== FUNÇÕES AUXILIARES ==========
function salvarAlunos() {
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
                alert("🏆 " + conquistasLista[i].icone + " " + conquistasLista[i].titulo + "!");
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
        badge.style.display = "none";
        return;
    }
    var msgs = alunoAtual.mensagensProfessor || [];
    var ag = JSON.parse(localStorage.getItem("agendamentosHumora")) || [];
    var av = JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [];
    var total = msgs.length;
    for (var i = 0; i < ag.length; i++) {
        if (ag[i].turma === alunoAtual.turma) total++;
    }
    total += av.length;
    if (total > 0) {
        badge.innerText = total;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
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
    if (nomeTab === "graficos") {
        setTimeout(function () {
            carregarGraficoSemana();
            carregarGraficoRadar();
        }, 200);
    }
    if (nomeTab === "conquistas") carregarConquistasTab();
}

// ========== EMOÇÕES ==========
function selecionarEmocao(event, tipo) {
    emocaoSelecionada = tipo;
    var els = document.querySelectorAll(".emocao");
    for (var i = 0; i < els.length; i++) els[i].classList.remove("selecionada");
    if (event && event.currentTarget)
        event.currentTarget.classList.add("selecionada");
    document.getElementById("nomeEmocaoSelecionada").innerText =
        emocoes[tipo].emoji + " " + emocoes[tipo].nome;
    document.getElementById("emocaoSelecionadaTexto").style.display = "block";
    document.getElementById("btnEnviarEmocao").disabled = false;
}

// ========== ENVIAR EMOÇÃO PARA BACKEND (CORRIGIDO) ==========
async function enviarEmocao() {
    if (!emocaoSelecionada) {
        alert("Selecione uma emoção!");
        return;
    }

    const email = alunoAtual?.email || localStorage.getItem("email");
    if (!email) {
        alert("Usuário não autenticado.");
        return;
    }

    const emocaoBackend = EMOCAO_MAP[emocaoSelecionada];
    if (!emocaoBackend) {
        alert("Emoção inválida.");
        return;
    }

    try {
        const response = await api.createDiario(email, emocaoBackend);

        if (!response.ok) {
            let errorMsg = "Erro ao registrar emoção.";
            try {
                const error = await response.text();
                if (error) errorMsg = error;
            } catch (e) {}
            return alert("❌ " + errorMsg);
        }

        const diario = await response.json();

        // Atualizar dados locais
        var registro = {
            emocao: emocaoSelecionada,
            intensidade: parseInt(document.getElementById("intensidadeEmocao").value) || 1,
            descricao: document.getElementById("motivo").value.trim(),
            data: new Date().toLocaleDateString("pt-BR"),
            hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            timestamp: new Date().getTime()
        };

        if (!alunoAtual.historico) alunoAtual.historico = [];
        alunoAtual.historico.push(registro);
        alunoAtual.ultimaEmocao = new Date().getTime();

        desbloquearConquista("primeiro_registro");
        atualizarStreak();
        salvarAlunos();
        iniciarMonitorBloqueio();
        carregarHistorico();

        document.getElementById("motivo").value = "";
        document.getElementById("btnEnviarEmocao").disabled = true;
        document.getElementById("emocaoSelecionadaTexto").style.display = "none";
        emocaoSelecionada = null;
        document.querySelectorAll(".emocao").forEach(el => el.classList.remove("selecionada"));

        alert("✅ Emoção registrada! 💜");

    } catch (error) {
        console.error("Erro ao enviar emoção:", error);
        alert("❌ Erro ao conectar com o servidor.");
    }
}

// ========== CARREGAR DIÁRIOS DO BACKEND (CORRIGIDO) ==========
async function carregarDiariosBackend() {
    const email = localStorage.getItem("email");
    if (!email) return;

    try {
        const response = await api.getDiario(email);
        if (response.ok) {
            const diarios = await response.json();
            if (diarios && diarios.length > 0) {
                for (var i = 0; i < diarios.length; i++) {
                    var d = diarios[i];
                    var emocaoLocal = EMOCAO_REVERSE[d.emocoes] || d.emocoes;
                    var existe = alunoAtual.historico.some(h =>
                        h.data === new Date(d.dataExpiracao).toLocaleDateString("pt-BR") &&
                        h.emocao === emocaoLocal
                    );
                    if (!existe) {
                        alunoAtual.historico.push({
                            emocao: emocaoLocal,
                            intensidade: 1,
                            descricao: "",
                            data: new Date(d.dataExpiracao).toLocaleDateString("pt-BR"),
                            hora: "00:00",
                            timestamp: new Date(d.dataExpiracao).getTime()
                        });
                    }
                }
                salvarAlunos();
                carregarHistorico();
            }
        }
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
        document.getElementById("emocoes").style.display = "none";
        document.getElementById("motivoContainer").style.display = "none";
        document.getElementById("bloqueioHumora").style.display = "block";
        document.getElementById("bloqueioHumora").innerHTML =
            '<h3>✅ Emoção registrada!</h3><p>Próximo registro em:</p><strong style="font-size:24px;color:#c084fc;">⏳ ' +
            String(h).padStart(2, "0") + ":" +
            String(m).padStart(2, "0") + ":" +
            String(s).padStart(2, "0") + "</strong>";
    } else {
        clearInterval(intervalBloqueio);
        document.getElementById("emocoes").style.display = "grid";
        document.getElementById("motivoContainer").style.display = "block";
        document.getElementById("bloqueioHumora").style.display = "none";
    }
}

// ========== DIÁRIO ==========
function salvarDiario() {
    var texto = document.getElementById("textoDiario").value.trim();
    if (!texto) {
        alert("Escreva algo!");
        return;
    }
    if (!alunoAtual.diario) alunoAtual.diario = [];
    alunoAtual.diario.push({
        texto: texto,
        compartilhado: document.getElementById("compartilharDiario").checked,
        data: new Date().toLocaleDateString("pt-BR") + " - " +
              new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    desbloquearConquista("diario_mestre");
    salvarAlunos();
    document.getElementById("textoDiario").value = "";
    document.getElementById("compartilharDiario").checked = false;
    alert("✅ Diário salvo! 📝");
}

function abrirModalVerDiario() {
    var c = document.getElementById("containerListaDiario");
    c.innerHTML = "";
    var d = alunoAtual.diario || [];
    if (d.length === 0)
        c.innerHTML = '<p style="color:#94a3b8;padding:20px;">Nenhuma nota ainda.</p>';
    else
        for (var i = d.length - 1; i >= 0; i--)
            c.innerHTML +=
                '<div style="padding:12px 0;border-bottom:1px solid rgba(168,85,247,0.2);text-align:left;"><strong>📅 ' +
                d[i].data +
                '</strong><p style="color:#e2e8f0;">"' +
                d[i].texto +
                '"</p><small style="color:#c084fc;">' +
                (d[i].compartilhado ? "🔓 Compartilhado" : "🔒 Privado") +
                "</small></div>";
    document.getElementById("modalVerDiario").style.display = "flex";
}

function fecharModalVerDiario() {
    document.getElementById("modalVerDiario").style.display = "none";
}

// ========== GRÁFICOS ==========
function carregarGraficoSemana() {
    var canvas = document.getElementById("graficoSemana");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (graficoSemana) graficoSemana.destroy();
    var hist = alunoAtual.historico || [],
        ultimos = hist.slice(-7),
        labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
        dados = [2, 1, 3, 5, 4, 3, 2];
    if (ultimos.length > 0) {
        labels = [];
        dados = [];
        for (var i = 0; i < ultimos.length; i++) {
            labels.push(ultimos[i].data);
            dados.push(ultimos[i].intensidade || 1);
        }
    }
    graficoSemana = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                borderColor: "#c084fc",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#94a3b8" } },
                y: { min: 1, max: 5, ticks: { stepSize: 1, color: "#94a3b8" } }
            }
        }
    });
}

function carregarGraficoRadar() {
    var canvas = document.getElementById("graficoRadar");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (graficoRadar) graficoRadar.destroy();
    var cont = { feliz: 0, triste: 0, cansado: 0, calmo: 0, ansioso: 0, irritado: 0 },
        hist = alunoAtual.historico || [];
    for (var i = 0; i < hist.length; i++) {
        if (cont[hist[i].emocao] !== undefined) cont[hist[i].emocao]++;
    }
    var vals = [cont.feliz, cont.triste, cont.cansado, cont.calmo, cont.ansioso, cont.irritado],
        max = 5;
    for (var j = 0; j < vals.length; j++) {
        if (vals[j] > max) max = vals[j];
    }
    graficoRadar = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["😊 Feliz", "😔 Triste", "😴 Cansado", "😌 Calmo", "😰 Ansioso", "😡 Irritado"],
            datasets: [{
                data: vals,
                backgroundColor: "rgba(168,85,247,0.35)",
                borderColor: "#c084fc",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { min: 0, max: max, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// ========== RESPIRAÇÃO ==========
function iniciarRespiracaoTab() {
    var el = document.getElementById("textoRespiracaoTab"),
        circ = document.getElementById("circuloRespiracao"),
        btnI = document.getElementById("btnIniciarRespiracao"),
        btnP = document.getElementById("btnPararRespiracao");
    if (!el) return;
    clearInterval(intervalRespiracao);
    circ.classList.add("animando");
    btnI.disabled = true;
    btnP.disabled = false;
    var fases = ["Inspire...", "Segure...", "Expire..."],
        etapa = 0;
    el.innerText = fases[0];
    intervalRespiracao = setInterval(function () {
        etapa = (etapa + 1) % 3;
        el.innerText = fases[etapa];
    }, 2600);
    desbloquearConquista("respirou");
}

function pararRespiracaoTab() {
    clearInterval(intervalRespiracao);
    intervalRespiracao = null;
    var el = document.getElementById("textoRespiracaoTab"),
        circ = document.getElementById("circuloRespiracao"),
        btnI = document.getElementById("btnIniciarRespiracao"),
        btnP = document.getElementById("btnPararRespiracao");
    if (el) el.innerText = "Inspire...";
    if (circ) circ.classList.remove("animando");
    if (btnI) btnI.disabled = false;
    if (btnP) btnP.disabled = true;
}

// ========== HISTÓRICO ==========
function carregarHistorico() {
    var c = document.getElementById("historico");
    if (!c) return;
    c.innerHTML = "";
    var h = alunoAtual.historico || [];
    if (h.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;padding:15px;">Nenhum registro ainda.</p>';
        return;
    }
    for (var i = h.length - 1; i >= 0; i--) {
        var info = emocoes[h[i].emocao] || { emoji: "❓", nome: h[i].emocao };
        c.innerHTML +=
            '<div style="padding:10px 0;border-bottom:1px solid rgba(168,85,247,0.2);"><span style="font-size:20px;">' +
            info.emoji + "</span> <strong>" +
            info.nome + " (Nível " +
            (h[i].intensidade || 1) + ")</strong>" +
            (h[i].descricao ? '<br><small>📝 "' + h[i].descricao + '"</small>' : "") +
            "<br><small>" + h[i].data + " às " + h[i].hora + "</small></div>";
    }
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
    var c = document.getElementById("mensagensProfessor");
    if (!c) return;
    c.innerHTML = "";
    var msgs = alunoAtual.mensagensProfessor || [];
    if (msgs.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;padding:15px;">Nenhuma mensagem.</p>';
        return;
    }
    for (var i = msgs.length - 1; i >= 0; i--)
        c.innerHTML +=
            '<div style="padding:10px 0;border-bottom:1px solid rgba(168,85,247,0.2);"><strong>👨‍🏫 ' +
            msgs[i].professor + "</strong><small> " + msgs[i].data +
            '</small><p style="color:#e2e8f0;">' + msgs[i].texto + "</p></div>";
}

function carregarAtividadesAluno() {
    var c = document.getElementById("atividadesAluno");
    if (!c) return;
    c.innerHTML = "";
    var ag = JSON.parse(localStorage.getItem("agendamentosHumora")) || [],
        minhas = [];
    for (var i = 0; i < ag.length; i++) {
        if (ag[i].turma === alunoAtual.turma) minhas.push(ag[i]);
    }
    if (minhas.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;padding:15px;">Nenhuma atividade.</p>';
        return;
    }
    for (var j = 0; j < minhas.length; j++)
        c.innerHTML +=
            '<div style="padding:10px 0;border-bottom:1px solid rgba(168,85,247,0.2);"><strong>📅 ' +
            minhas[j].titulo + "</strong><br><small>" +
            minhas[j].turma + " | " + minhas[j].data + "</small></div>";
}

function carregarAvisosAluno() {
    var c = document.getElementById("avisosAluno");
    if (!c) return;
    c.innerHTML = "";
    var av = JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [];
    if (av.length === 0) {
        c.innerHTML = '<p style="color:#94a3b8;padding:15px;">Nenhum aviso.</p>';
        return;
    }
    for (var i = av.length - 1; i >= 0; i--)
        c.innerHTML +=
            '<div style="padding:10px 0;border-bottom:1px solid rgba(168,85,247,0.2);"><strong>📢 Aviso</strong><p style="color:#e2e8f0;">' +
            av[i].texto + "</p><small>" + av[i].data + "</small></div>";
}

function abrirModalNotificacoes() {
    document.getElementById("modalNotificacoes").style.display = "flex";
    alunoAtual.mensagensVisualizadas = true;
    salvarAlunos();
    var badge = document.getElementById("badgeNotificacao");
    badge.style.display = "none";
    badge.innerText = "0";
    carregarMensagensProfessor();
}

function fecharModalNotificacoes() {
    document.getElementById("modalNotificacoes").style.display = "none";
}

function abrirModalHistorico() {
    carregarHistorico();
    document.getElementById("modalHistorico").style.display = "flex";
}

function fecharModalHistorico() {
    document.getElementById("modalHistorico").style.display = "none";
}

// ========== CONQUISTAS ==========
function carregarConquistasTab() {
    var c = document.getElementById("containerConquistasTab");
    if (!c) return;
    c.innerHTML = "";
    var d = alunoAtual.conquistas || [];
    for (var i = 0; i < conquistasLista.length; i++) {
        var con = conquistasLista[i],
            tem = d.indexOf(con.id) !== -1;
        c.innerHTML +=
            '<div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;background:' +
            (tem ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)") +
            ";border:1px solid " +
            (tem ? "#a855f7" : "rgba(255,255,255,0.1)") +
            ";margin-bottom:8px;opacity:" +
            (tem ? "1" : "0.5") +
            ';"><span style="font-size:28px;">' +
            con.icone + "</span><div><strong>" +
            con.titulo + '</strong><p style="font-size:12px;color:#94a3b8;">' +
            con.desc + "</p></div></div>";
    }
}

// ========== JOGOS (Pop-It) ==========
function abrirModalGame() {
    pontosGame = 0;
    bolasEstouradas = 0;
    document.getElementById("gamePontos").innerText = "0";
    gerarRodadaGame();
    document.getElementById("modalGame").style.display = "flex";
}

function fecharModalGame() {
    clearInterval(tempoGameInterval);
    document.getElementById("modalGame").style.display = "none";
}

function gerarRodadaGame() {
    clearInterval(tempoGameInterval);
    var sort = coresGame[Math.floor(Math.random() * coresGame.length)];
    corAlvoAtual = sort.nome;
    document.getElementById("corAlvoTexto").innerText = sort.nome;
    document.getElementById("corAlvoTexto").style.color = sort.hex;
    var grid = document.getElementById("gridBolasGame");
    grid.innerHTML = "";
    var bolas = [sort];
    for (var i = 0; i < 11; i++)
        bolas.push(coresGame[Math.floor(Math.random() * coresGame.length)]);
    bolas.sort(function () { return Math.random() - 0.5; });
    for (var j = 0; j < bolas.length; j++) {
        (function (cor) {
            var bola = document.createElement("div");
            bola.className = "bola-game";
            bola.style.backgroundColor = cor.hex;
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
    barra.style.transition = "none";
    barra.style.width = "100%";
    setTimeout(function () {
        barra.style.transition = "width " + tempo + "s linear";
        barra.style.width = "0%";
    }, 50);
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
            alert("⏰ Tempo esgotado!");
            gerarRodadaGame();
        }
    }, 1000);
}

function clicarBolaGame(cor, el) {
    if (cor === corAlvoAtual) {
        clearInterval(tempoGameInterval);
        pontosGame += 10;
        bolasEstouradas++;
        document.getElementById("gamePontos").innerText = pontosGame;
        if (pontosGame >= 500) desbloquearConquista("game_500");
        el.style.transform = "scale(0)";
        el.style.opacity = "0";
        setTimeout(function () {
            gerarRodadaGame();
        }, 200);
    } else {
        el.classList.add("erro-shake");
        setTimeout(function () {
            el.classList.remove("erro-shake");
        }, 400);
    }
}

// ========== MEMÓRIA ==========
function abrirJogoMemoria() {
    var emojis = ["😊", "😔", "😴", "😌", "😰", "😡", "🥰", "😎"];
    cartasMemoria = emojis.concat(emojis).sort(function () { return Math.random() - 0.5; });
    cartasViradas = [];
    paresEncontrados = 0;
    tentativasMemoria = 0;
    document.getElementById("tentativasMemoria").innerText = "0";
    document.getElementById("modalMemoria").style.display = "flex";
    renderizarMemoria();
}

function fecharJogoMemoria() {
    document.getElementById("modalMemoria").style.display = "none";
}

function renderizarMemoria() {
    var grid = document.getElementById("gridMemoria");
    grid.innerHTML = "";
    for (var i = 0; i < cartasMemoria.length; i++) {
        (function (emoji) {
            var carta = document.createElement("div");
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
    carta.innerText = emoji;
    cartasViradas.push({ carta: carta, emoji: emoji });
    if (cartasViradas.length === 2) {
        tentativasMemoria++;
        document.getElementById("tentativasMemoria").innerText = tentativasMemoria;
        if (cartasViradas[0].emoji === cartasViradas[1].emoji) {
            cartasViradas[0].carta.classList.add("par");
            cartasViradas[1].carta.classList.add("par");
            paresEncontrados++;
            cartasViradas = [];
            if (paresEncontrados === 8) {
                if (tentativasMemoria <= 10) desbloquearConquista("memoria_10");
                setTimeout(function () {
                    alert("🎉 Parabéns!");
                    fecharJogoMemoria();
                }, 500);
            }
        } else {
            var c1 = cartasViradas[0].carta,
                c2 = cartasViradas[1].carta;
            setTimeout(function () {
                c1.classList.remove("virada");
                c1.innerText = "?";
                c2.classList.remove("virada");
                c2.innerText = "?";
                cartasViradas = [];
            }, 800);
        }
    }
}

// ========== CÉREBRO SALTADOR ==========
function abrirJogoSubir() {
    document.getElementById("modalSubir").style.display = "flex";
    setTimeout(function () {
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
    clearInterval(gameLoopSubir);
    document.removeEventListener("keydown", keydownSubir);
    document.removeEventListener("keyup", keyupSubir);
    document.getElementById("modalSubir").style.display = "none";
    if (pontosSubir > melhorPontuacaoSubir) melhorPontuacaoSubir = pontosSubir;
    if (pontosSubir >= 50) desbloquearConquista("subir_50");
}

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
            alert("🧠 Fim de jogo!\nPontuação: " + pontosSubir + "\nMelhor: " + melhorPontuacaoSubir);
            fecharJogoSubir();
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
    document.getElementById("modalCacaPalavras").style.display = "flex";
}

function fecharCacaPalavras() {
    document.getElementById("modalCacaPalavras").style.display = "none";
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
    var container = document.getElementById("gradeCacaPalavras");
    container.innerHTML = "";
    container.style.gridTemplateColumns = "repeat(10, 32px)";
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            (function (row, col) {
                var cel = document.createElement("div");
                cel.className = "celula-caca";
                cel.innerText = gradeCaca[row][col];
                cel.setAttribute("data-row", row);
                cel.setAttribute("data-col", col);
                cel.addEventListener("mousedown", function (e) {
                    e.preventDefault();
                    selecaoCaca.ativa = true;
                    selecaoCaca.inicioRow = row;
                    selecaoCaca.inicioCol = col;
                    limparSelecaoCaca();
                    cel.classList.add("selecionada");
                    selecaoCaca.celulas.push({ row: row, col: col, el: cel });
                });
                cel.addEventListener("mouseenter", function (e) {
                    if (!selecaoCaca.ativa || selecaoCaca.celulas.length === 0) return;
                    var ultima = selecaoCaca.celulas[selecaoCaca.celulas.length - 1],
                        dRow = row - selecaoCaca.inicioRow,
                        dCol = col - selecaoCaca.inicioCol;
                    if (selecaoCaca.celulas.length === 1) {
                        if (dRow === 0 || dCol === 0 || Math.abs(dRow) === Math.abs(dCol)) {
                            cel.classList.add("selecionada");
                            selecaoCaca.celulas.push({ row: row, col: col, el: cel });
                        }
                    } else {
                        var dirRow = selecaoCaca.celulas[1].row - selecaoCaca.celulas[0].row,
                            dirCol = selecaoCaca.celulas[1].col - selecaoCaca.celulas[0].col,
                            expectedRow = ultima.row + (dirRow !== 0 ? (dirRow > 0 ? 1 : -1) : 0),
                            expectedCol = ultima.col + (dirCol !== 0 ? (dirCol > 0 ? 1 : -1) : 0);
                        if (row === expectedRow && col === expectedCol) {
                            cel.classList.add("selecionada");
                            selecaoCaca.celulas.push({ row: row, col: col, el: cel });
                        }
                    }
                });
                container.appendChild(cel);
            })(i, j);
        }
    }
    document.addEventListener("mouseup", finalizarSelecaoCaca);
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
        if (palavrasCaca[j] === palavraFormada && palavrasEncontradasCaca.indexOf(palavrasCaca[j]) === -1) {
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
                    alert("🎉 Parabéns! Você encontrou todas as palavras!");
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
            alert("💡 A palavra tem " + palavrasCaca[i].length + " letras e começa com '" + palavrasCaca[i][0] + "'");
            dicasCaca--;
            document.getElementById("dicasRestantes").innerText = dicasCaca;
            if (dicasCaca <= 0) document.getElementById("btnDica").disabled = true;
            return;
        }
    }
}

// ========== AVATAR ==========
function abrirModalAvatar() {
    document.getElementById("modalAvatar").style.display = "flex";
}

function fecharModalAvatar() {
    document.getElementById("modalAvatar").style.display = "none";
}

function mudarAvatar(emoji) {
    alunoAtual.avatar = emoji;
    document.getElementById("avatarAtual").innerText = emoji;
    salvarAlunos();
    fecharModalAvatar();
}

// ========== SAIR ==========
function sair() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("token");
        localStorage.removeItem("tipoUsuario");
        localStorage.removeItem("email");
        window.location.href = "login.html";
    }
}