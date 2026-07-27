var usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
  window.location.href = "login.html";
}

var alunos = JSON.parse(localStorage.getItem("alunosHumora")) || [];
var agendamentos = JSON.parse(localStorage.getItem("agendamentosHumora")) || [];
var avisosTurma = JSON.parse(localStorage.getItem("avisosTurmaHumora")) || [];
var anotacoesProfessor =
  JSON.parse(localStorage.getItem("anotacoesProfessorHumora")) || [];
var alunoSelecionadoEmail = null;
var graficoGeral = null,
  graficoBarra = null,
  graficoPizza = null;

var pontosGameProf = 0,
  bolasEstouradasProf = 0,
  corAlvoAtualProf = "",
  tempoGameIntervalProf = null;
var cartasMemoriaProf = [],
  cartasViradasProf = [],
  paresEncontradosProf = 0,
  tentativasMemoriaProf = 0;
var canvasSubirProf,
  ctxSubirProf,
  jogadorSubirProf,
  plataformasSubirProf,
  pontosSubirProf,
  gameLoopSubirProf,
  teclasSubirProf,
  melhorPontuacaoSubirProf = 0;
var gradeCacaProf = [],
  palavrasCacaProf = [],
  palavrasEncontradasCacaProf = [],
  dicasCacaProf = 3,
  selecaoCacaProf = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };
var bancoPalavrasProf = [
  "FELIZ",
  "ALEGRE",
  "CALMA",
  "PAZ",
  "AMOR",
  "GRATO",
  "BEM",
  "LUZ",
  "FORCA",
  "UNIAO",
  "VIDA",
  "SONHO",
  "TRISTE",
  "MEDO",
  "RAIVA",
  "CANSA",
  "RESPIRA",
  "OUVIR",
  "FALAR",
  "AJUDA",
  "CUIDA",
  "SORRIR",
  "ABRACO",
  "DANCAR",
  "CANTAR",
  "MENTE",
  "CORPO",
  "SERENO",
  "PLENO",
  "AFETO",
  "LACO",
  "APOIO",
  "LIVRE",
  "HUMORA",
  "ENSINAR",
  "SABER",
];

var coresGame = [
  { nome: "Vermelho", hex: "#ef4444" },
  { nome: "Azul", hex: "#3b82f6" },
  { nome: "Verde", hex: "#22c55e" },
  { nome: "Amarelo", hex: "#eab308" },
  { nome: "Roxo", hex: "#a855f7" },
];
var emocoesMeta = {
  feliz: { emoji: "😊", nome: "Feliz", cor: "#FFD700" },
  triste: { emoji: "😔", nome: "Triste", cor: "#4A90E2" },
  cansado: { emoji: "😴", nome: "Cansado", cor: "#B0B0B0" },
  calmo: { emoji: "😌", nome: "Calmo", cor: "#00C896" },
  ansioso: { emoji: "😰", nome: "Ansioso", cor: "#FF8C00" },
  irritado: { emoji: "😡", nome: "Irritado", cor: "#E74C3C" },
};

document.addEventListener("DOMContentLoaded", function () {
  if (usuarioLogado?.nome) {
    document.getElementById("nomeProfessor").innerText = usuarioLogado.nome;
    document.getElementById("areaProfessor").innerText =
      usuarioLogado.area || "Docente";
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
});

function trocarTab(nomeTab, elemento) {
  var tabs = document.querySelectorAll(".tab-content");
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("ativo");
  var menus = document.querySelectorAll(".menu-item");
  for (var j = 0; j < menus.length; j++) menus[j].classList.remove("ativo");
  var tab = document.getElementById("tab-" + nomeTab);
  if (tab) tab.classList.add("ativo");
  if (elemento) elemento.classList.add("ativo");
  if (nomeTab === "dashboard")
    setTimeout(function () {
      carregarGraficoGeral();
    }, 200);
  if (nomeTab === "graficos")
    setTimeout(function () {
      carregarGraficosFiltrados();
    }, 200);
  if (nomeTab === "alunos") aplicarFiltros();
  if (nomeTab === "anotacoes") renderizarAnotacoes();
  if (nomeTab === "conquistas") renderizarConquistasProf();
}

function popularFiltros() {
  var turmas = [
    ...new Set(
      alunos
        .map(function (a) {
          return a.turma;
        })
        .filter(Boolean),
    ),
  ].sort();
  var selects = [
    document.getElementById("filtroTurma"),
    document.getElementById("filtroTurmaGrafico"),
  ];
  for (var s = 0; s < selects.length; s++) {
    var sel = selects[s];
    if (sel) {
      sel.innerHTML = '<option value="">Todas as Turmas</option>';
      for (var i = 0; i < turmas.length; i++)
        sel.innerHTML +=
          '<option value="' + turmas[i] + '">' + turmas[i] + "</option>";
    }
  }
  var selAg = document.getElementById("turmaAtividade");
  if (selAg) {
    selAg.innerHTML = '<option value="">Selecione a Turma</option>';
    for (var j = 0; j < turmas.length; j++)
      selAg.innerHTML +=
        '<option value="' + turmas[j] + '">' + turmas[j] + "</option>";
  }
}
function popularSelectAlunos() {
  var sel = document.getElementById("selectAlunoMensagem");
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione um aluno...</option>';
  for (var i = 0; i < alunos.length; i++)
    sel.innerHTML +=
      '<option value="' +
      alunos[i].email +
      '">' +
      alunos[i].nome +
      " (" +
      (alunos[i].turma || "Sem Turma") +
      ")</option>";
}

function aplicarFiltros() {
  var busca = (document.getElementById("buscaAluno")?.value || "")
    .toLowerCase()
    .trim();
  var turma = document.getElementById("filtroTurma")?.value || "";
  var emocao = document.getElementById("filtroEmocao")?.value || "";
  var filtrados = alunos.filter(function (a) {
    var b = (a.nome || "").toLowerCase().indexOf(busca) !== -1;
    var t = turma === "" || a.turma === turma;
    var e = true;
    var ult =
      a.historico && a.historico.length > 0
        ? a.historico[a.historico.length - 1]
        : null;
    if (emocao === "alerta")
      e = ult && ["triste", "ansioso", "irritado"].indexOf(ult.emocao) !== -1;
    else if (emocao !== "") e = ult && ult.emocao === emocao;
    return b && t && e;
  });
  renderizarListaAlunos(filtrados);
  atualizarCardsResumo(filtrados);
  atualizarListaAlerta(filtrados);
}
function limparFiltros() {
  document.getElementById("buscaAluno").value = "";
  document.getElementById("filtroTurma").value = "";
  document.getElementById("filtroEmocao").value = "";
  aplicarFiltros();
}

function atualizarCardsResumo(lista) {
  var cont = {
    feliz: 0,
    triste: 0,
    cansado: 0,
    calmo: 0,
    ansioso: 0,
    irritado: 0,
  };
  for (var i = 0; i < lista.length; i++) {
    var a = lista[i];
    if (a.historico && a.historico.length > 0) {
      var u = a.historico[a.historico.length - 1].emocao;
      if (cont[u] !== undefined) cont[u]++;
    }
  }
  var ids = {
    feliz: "totalFeliz",
    triste: "totalTriste",
    cansado: "totalCansado",
    calmo: "totalCalmo",
    ansioso: "totalAnsioso",
    irritado: "totalIrritado",
  };
  for (var k in ids) {
    var el = document.getElementById(ids[k]);
    if (el) el.innerText = cont[k];
  }
}
function renderizarListaAlunos(lista) {
  var c = document.getElementById("listaAlunosTurma");
  if (!c) return;
  c.innerHTML = "";
  if (lista.length === 0) {
    c.innerHTML =
      '<p style="text-align:center;color:#94a3b8;padding:20px;">Nenhum aluno encontrado.</p>';
    return;
  }
  for (var i = 0; i < lista.length; i++) {
    var a = lista[i];
    var ult =
      a.historico && a.historico.length > 0
        ? a.historico[a.historico.length - 1]
        : null;
    var info =
      ult && emocoesMeta[ult.emocao]
        ? emocoesMeta[ult.emocao].emoji + " " + emocoesMeta[ult.emocao].nome
        : "Sem registros";
    var alerta =
      ult && ["triste", "ansioso", "irritado"].indexOf(ult.emocao) !== -1;
    c.innerHTML +=
      '<div class="aluno-card ' +
      (alerta ? "alerta" : "") +
      '"><div><strong>' +
      a.nome +
      '</strong> <small class="turma-tag">(' +
      (a.turma || "Sem Turma") +
      ")</small><br><small>Último humor: <b>" +
      info +
      '</b></small></div><div class="acoes-aluno-card"><button class="btn-msg" onclick="abrirModalMensagem(\'' +
      a.email +
      "','" +
      a.nome +
      '\')">💬</button><button class="btn-badge" onclick="abrirModalBadge(\'' +
      a.email +
      "','" +
      a.nome +
      "')\">🌟</button></div></div>";
  }
}
function atualizarListaAlerta(lista) {
  var c = document.getElementById("listaAlunosAlerta");
  if (!c) return;
  var alertas = lista.filter(function (a) {
    var u =
      a.historico && a.historico.length > 0
        ? a.historico[a.historico.length - 1]
        : null;
    return u && ["triste", "ansioso", "irritado"].indexOf(u.emocao) !== -1;
  });
  if (alertas.length === 0) {
    c.innerHTML =
      '<p style="color:#94a3b8;text-align:center;padding:15px;">✅ Nenhum aluno em estado de alerta.</p>';
    return;
  }
  c.innerHTML = "";
  for (var i = 0; i < alertas.length; i++)
    c.innerHTML +=
      '<div class="aluno-card alerta"><div><strong>' +
      alertas[i].nome +
      '</strong></div><button class="btn-msg" onclick="abrirModalMensagem(\'' +
      alertas[i].email +
      "','" +
      alertas[i].nome +
      "')\">💬 Apoiar</button></div>";
}

function carregarGraficoGeral() {
  var canvas = document.getElementById("graficoTurma");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (graficoGeral) graficoGeral.destroy();
  var cont = {
    feliz: 0,
    triste: 0,
    cansado: 0,
    calmo: 0,
    ansioso: 0,
    irritado: 0,
  };
  for (var i = 0; i < alunos.length; i++) {
    if (alunos[i].historico && alunos[i].historico.length > 0) {
      var u = alunos[i].historico[alunos[i].historico.length - 1].emocao;
      if (cont[u] !== undefined) cont[u]++;
    }
  }
  graficoGeral = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.values(emocoesMeta).map(function (e) {
        return e.emoji + " " + e.nome;
      }),
      datasets: [
        {
          data: Object.keys(emocoesMeta).map(function (e) {
            return cont[e];
          }),
          backgroundColor: Object.values(emocoesMeta).map(function (e) {
            return e.cor;
          }),
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, color: "#94a3b8" } },
        x: { ticks: { color: "#f3e8ff" } },
      },
    },
  });
}
function carregarGraficosFiltrados() {
  var t = document.getElementById("filtroTurmaGrafico")?.value || "";
  var e = document.getElementById("filtroEmocaoGrafico")?.value || "";
  var filt = alunos;
  if (t)
    filt = filt.filter(function (a) {
      return a.turma === t;
    });
  if (e)
    filt = filt.filter(function (a) {
      var u =
        a.historico && a.historico.length > 0
          ? a.historico[a.historico.length - 1]
          : null;
      return u && u.emocao === e;
    });
  carregarGraficoBarra(filt);
  carregarGraficoPizza(filt);
}
function carregarGraficoBarra(lista) {
  var canvas = document.getElementById("graficoBarra");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (graficoBarra) graficoBarra.destroy();
  var turmas = [
    ...new Set(
      lista
        .map(function (a) {
          return a.turma;
        })
        .filter(Boolean),
    ),
  ];
  var dados = turmas.map(function (t) {
    return lista.filter(function (a) {
      return a.turma === t;
    }).length;
  });
  graficoBarra = new Chart(ctx, {
    type: "bar",
    data: {
      labels: turmas,
      datasets: [{ data: dados, backgroundColor: "#a855f7", borderRadius: 8 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, color: "#94a3b8" } },
        x: { ticks: { color: "#f3e8ff" } },
      },
    },
  });
}
function carregarGraficoPizza(lista) {
  var canvas = document.getElementById("graficoPizza");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (graficoPizza) graficoPizza.destroy();
  var cont = {
    feliz: 0,
    triste: 0,
    cansado: 0,
    calmo: 0,
    ansioso: 0,
    irritado: 0,
  };
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].historico && lista[i].historico.length > 0) {
      var u = lista[i].historico[lista[i].historico.length - 1].emocao;
      if (cont[u] !== undefined) cont[u]++;
    }
  }
  graficoPizza = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.values(emocoesMeta).map(function (e) {
        return e.emoji + " " + e.nome;
      }),
      datasets: [
        {
          data: Object.keys(emocoesMeta).map(function (e) {
            return cont[e];
          }),
          backgroundColor: Object.values(emocoesMeta).map(function (e) {
            return e.cor;
          }),
          borderWidth: 2,
          borderColor: "#18032b",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#cbd5e1", padding: 15, font: { size: 11 } },
        },
      },
    },
  });
}
function atualizarGraficosFiltrados() {
  carregarGraficosFiltrados();
}
function limparFiltrosGraficos() {
  document.getElementById("filtroTurmaGrafico").value = "";
  document.getElementById("filtroEmocaoGrafico").value = "";
  carregarGraficosFiltrados();
}

function abrirModalMensagem(email, nome) {
  alunoSelecionadoEmail = email;
  document.getElementById("nomeAlunoModal").innerText = nome || "Aluno";
  document.getElementById("modalMensagem").style.display = "flex";
}
function fecharModal() {
  document.getElementById("modalMensagem").style.display = "none";
  document.getElementById("textoMensagemModal").value = "";
  alunoSelecionadoEmail = null;
}
function enviarMensagem() {
  var texto = document.getElementById("textoMensagemModal")?.value.trim();
  if (!texto) return alert("Digite uma mensagem!");
  var idx = alunos.findIndex(function (a) {
    return a.email === alunoSelecionadoEmail;
  });
  if (idx !== -1) {
    if (!alunos[idx].mensagensProfessor) alunos[idx].mensagensProfessor = [];
    alunos[idx].mensagensProfessor.push({
      professor: usuarioLogado?.nome || "Professor",
      texto: texto,
      data:
        new Date().toLocaleDateString("pt-BR") +
        " " +
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    });
    alunos[idx].mensagensVisualizadas = false;
    localStorage.setItem("alunosHumora", JSON.stringify(alunos));
    alert("Mensagem enviada! 📩");
    fecharModal();
  }
}
function enviarMensagemDireta() {
  var sel = document.getElementById("selectAlunoMensagem");
  var texto = document.getElementById("textoMensagemProf").value.trim();
  if (!sel.value) return alert("Selecione um aluno!");
  if (!texto) return alert("Digite uma mensagem!");
  var idx = alunos.findIndex(function (a) {
    return a.email === sel.value;
  });
  if (idx !== -1) {
    if (!alunos[idx].mensagensProfessor) alunos[idx].mensagensProfessor = [];
    alunos[idx].mensagensProfessor.push({
      professor: usuarioLogado?.nome || "Professor",
      texto: texto,
      data:
        new Date().toLocaleDateString("pt-BR") +
        " " +
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    });
    alunos[idx].mensagensVisualizadas = false;
    localStorage.setItem("alunosHumora", JSON.stringify(alunos));
    alert("Mensagem enviada! 📩");
    document.getElementById("textoMensagemProf").value = "";
  }
}

function abrirModalBadge(email, nome) {
  alunoSelecionadoEmail = email;
  document.getElementById("nomeAlunoBadge").innerText = nome;
  document.getElementById("modalBadge").style.display = "flex";
}
function fecharModalBadge() {
  document.getElementById("modalBadge").style.display = "none";
  alunoSelecionadoEmail = null;
}
function enviarBadge(badge) {
  var idx = alunos.findIndex(function (a) {
    return a.email === alunoSelecionadoEmail;
  });
  if (idx !== -1) {
    if (!alunos[idx].badges) alunos[idx].badges = [];
    alunos[idx].badges.push({
      badge: badge,
      professor: usuarioLogado?.nome || "Professor",
      data: new Date().toLocaleDateString("pt-BR"),
    });
    localStorage.setItem("alunosHumora", JSON.stringify(alunos));
    alert("Reconhecimento enviado! 🎉");
    fecharModalBadge();
  }
}

function salvarAgendamento(e) {
  e.preventDefault();
  var titulo = document.getElementById("tituloAtividade").value.trim();
  var data = document.getElementById("dataAtividade").value;
  var turma = document.getElementById("turmaAtividade").value;
  if (!titulo || !data || !turma) return;
  agendamentos.push({
    id: Date.now(),
    titulo: titulo,
    data: data,
    turma: turma,
    professor: usuarioLogado?.nome || "Professor",
  });
  localStorage.setItem("agendamentosHumora", JSON.stringify(agendamentos));
  document.getElementById("formAgendamento").reset();
  renderizarAgendamentos();
  alert("Atividade agendada!");
}
function renderizarAgendamentos() {
  var c = document.getElementById("listaAgendamentos");
  if (!c) return;
  c.innerHTML =
    agendamentos.length === 0
      ? '<p style="color:#94a3b8;font-size:12px;">Nenhuma atividade.</p>'
      : agendamentos
          .map(function (a) {
            return (
              '<div class="item-mini"><div><strong>' +
              a.titulo +
              "</strong> <small>(" +
              a.turma +
              ")</small><br><small>📅 " +
              a.data +
              '</small></div><button onclick="removerAgendamento(' +
              a.id +
              ')" class="btn-deletar">&times;</button></div>'
            );
          })
          .join("");
}
function removerAgendamento(id) {
  agendamentos = agendamentos.filter(function (a) {
    return a.id !== id;
  });
  localStorage.setItem("agendamentosHumora", JSON.stringify(agendamentos));
  renderizarAgendamentos();
}

function publicarAvisoTurma() {
  var texto = document.getElementById("textoAvisoTurma").value.trim();
  if (!texto) return alert("Digite o aviso!");
  avisosTurma.push({
    id: Date.now(),
    texto: texto,
    data: new Date().toLocaleDateString("pt-BR"),
    professor: usuarioLogado?.nome || "Professor",
  });
  localStorage.setItem("avisosTurmaHumora", JSON.stringify(avisosTurma));
  document.getElementById("textoAvisoTurma").value = "";
  renderizarAvisos();
}
function renderizarAvisos() {
  var c = document.getElementById("listaAvisosProf");
  if (!c) return;
  c.innerHTML =
    avisosTurma.length === 0
      ? '<p style="color:#94a3b8;font-size:12px;">Nenhum aviso.</p>'
      : avisosTurma
          .map(function (a) {
            return (
              '<div class="item-mini"><div><span>📌 "' +
              a.texto +
              '"</span><br><small>' +
              a.data +
              '</small></div><button onclick="removerAviso(' +
              a.id +
              ')" class="btn-deletar">&times;</button></div>'
            );
          })
          .join("");
}
function removerAviso(id) {
  avisosTurma = avisosTurma.filter(function (a) {
    return a.id !== id;
  });
  localStorage.setItem("avisosTurmaHumora", JSON.stringify(avisosTurma));
  renderizarAvisos();
}

function adicionarAnotacao() {
  var texto = document.getElementById("novaAnotacaoTexto").value.trim();
  if (!texto) return alert("Digite uma anotação!");
  anotacoesProfessor.push({
    id: Date.now(),
    texto: texto,
    data:
      new Date().toLocaleDateString("pt-BR") +
      " " +
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  });
  localStorage.setItem(
    "anotacoesProfessorHumora",
    JSON.stringify(anotacoesProfessor),
  );
  document.getElementById("novaAnotacaoTexto").value = "";
  renderizarAnotacoes();
  alert("📝 Anotação salva!");
}
function renderizarAnotacoes() {
  var c = document.getElementById("containerAnotacoes");
  if (!c) return;
  c.innerHTML =
    anotacoesProfessor.length === 0
      ? '<p style="color:#94a3b8;text-align:center;padding:20px;">📋 Nenhuma anotação.</p>'
      : anotacoesProfessor
          .slice()
          .reverse()
          .map(function (a) {
            return (
              '<div class="anotacao-card"><span onclick="removerAnotacao(' +
              a.id +
              ')" class="fechar-anotacao">&times;</span><p>' +
              a.texto +
              '</p><p class="anotacao-data">📅 ' +
              a.data +
              "</p></div>"
            );
          })
          .join("");
}
function removerAnotacao(id) {
  anotacoesProfessor = anotacoesProfessor.filter(function (a) {
    return a.id !== id;
  });
  localStorage.setItem(
    "anotacoesProfessorHumora",
    JSON.stringify(anotacoesProfessor),
  );
  renderizarAnotacoes();
}

function renderizarDiariosCompartilhados() {
  var c = document.getElementById("containerDiariosCompartilhados");
  if (!c) return;
  c.innerHTML = "";
  var enc = 0;
  for (var i = 0; i < alunos.length; i++) {
    var a = alunos[i];
    if (a.diario) {
      for (var j = 0; j < a.diario.length; j++) {
        if (a.diario[j].compartilhado) {
          enc++;
          c.innerHTML +=
            '<div class="item-mini flex-col"><div><strong>' +
            a.nome +
            " (" +
            (a.turma || "Sem Turma") +
            ")</strong><small> " +
            (a.diario[j].data || "Hoje") +
            '</small></div><p style="font-size:13px;color:#cbd5e1;">📖 "' +
            a.diario[j].texto +
            '"</p></div>';
        }
      }
    }
  }
  if (enc === 0)
    c.innerHTML =
      '<p style="color:#94a3b8;font-size:12px;">Nenhum diário compartilhado.</p>';
}

function renderizarConquistasProf() {
  var c = document.getElementById("containerConquistasProf");
  if (!c) return;
  var enviouMensagem = false,
    enviouBadge = false;
  for (var i = 0; i < alunos.length; i++) {
    if (alunos[i].mensagensProfessor && alunos[i].mensagensProfessor.length > 0)
      enviouMensagem = true;
    if (alunos[i].badges && alunos[i].badges.length > 0) enviouBadge = true;
  }
  var conquistas = [
    {
      icone: "🏠",
      titulo: "Primeiro Acesso",
      desc: "Acessou o painel do professor",
      desbloqueada: true,
    },
    {
      icone: "💬",
      titulo: "Ouvidor Atento",
      desc: "Enviou mensagem de apoio",
      desbloqueada: enviouMensagem,
    },
    {
      icone: "🌟",
      titulo: "Impulsionador",
      desc: "Enviou reconhecimento (badge)",
      desbloqueada: enviouBadge,
    },
    {
      icone: "📅",
      titulo: "Planejador",
      desc: "Agendou uma atividade",
      desbloqueada: agendamentos.length > 0,
    },
    {
      icone: "📢",
      titulo: "Comunicador",
      desc: "Publicou um aviso no mural",
      desbloqueada: avisosTurma.length > 0,
    },
    {
      icone: "📝",
      titulo: "Organizador",
      desc: "Criou anotações pessoais",
      desbloqueada: anotacoesProfessor.length > 0,
    },
  ];
  c.innerHTML = "";
  for (var i = 0; i < conquistas.length; i++) {
    var con = conquistas[i];
    c.innerHTML +=
      '<div class="conquista-prof-card ' +
      (con.desbloqueada ? "ativa" : "bloqueada") +
      '"><span style="font-size:32px;">' +
      con.icone +
      "</span><strong>" +
      con.titulo +
      "</strong><small>" +
      con.desc +
      "</small></div>";
  }
}

// JOGOS
function abrirModalGameProf() {
  pontosGameProf = 0;
  bolasEstouradasProf = 0;
  document.getElementById("gamePontosProf").innerText = "0";
  gerarRodadaGameProf();
  document.getElementById("modalGameProf").style.display = "flex";
}
function fecharModalGameProf() {
  clearInterval(tempoGameIntervalProf);
  document.getElementById("modalGameProf").style.display = "none";
}
function gerarRodadaGameProf() {
  clearInterval(tempoGameIntervalProf);
  var sort = coresGame[Math.floor(Math.random() * coresGame.length)];
  corAlvoAtualProf = sort.nome;
  document.getElementById("corAlvoTextoProf").innerText = sort.nome;
  document.getElementById("corAlvoTextoProf").style.color = sort.hex;
  var grid = document.getElementById("gridBolasGameProf");
  grid.innerHTML = "";
  var bolas = [sort];
  for (var i = 0; i < 11; i++)
    bolas.push(coresGame[Math.floor(Math.random() * coresGame.length)]);
  bolas.sort(function () {
    return Math.random() - 0.5;
  });
  for (var j = 0; j < bolas.length; j++) {
    (function (cor) {
      var bola = document.createElement("div");
      bola.className = "bola-game";
      bola.style.backgroundColor = cor.hex;
      bola.onclick = function () {
        clicarBolaGameProf(cor.nome, bola);
      };
      grid.appendChild(bola);
    })(bolas[j]);
  }
  iniciarTimerGameProf(bolasEstouradasProf >= 5 ? 3 : 5);
}
function iniciarTimerGameProf(tempo) {
  var barra = document.getElementById("barraTempoProgressoProf");
  barra.style.transition = "none";
  barra.style.width = "100%";
  setTimeout(function () {
    barra.style.transition = "width " + tempo + "s linear";
    barra.style.width = "0%";
  }, 50);
  var r = tempo;
  document.getElementById("tempoGameTextoProf").innerText = r + "s";
  tempoGameIntervalProf = setInterval(function () {
    r--;
    document.getElementById("tempoGameTextoProf").innerText = r + "s";
    if (r <= 0) {
      clearInterval(tempoGameIntervalProf);
      pontosGameProf = 0;
      bolasEstouradasProf = 0;
      document.getElementById("gamePontosProf").innerText = "0";
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
    document.getElementById("gamePontosProf").innerText = pontosGameProf;
    el.style.transform = "scale(0)";
    el.style.opacity = "0";
    setTimeout(function () {
      gerarRodadaGameProf();
    }, 200);
  } else {
    el.classList.add("erro-shake");
    setTimeout(function () {
      el.classList.remove("erro-shake");
    }, 400);
  }
}

function abrirJogoMemoriaProf() {
  var emojis = ["😊", "😔", "😴", "😌", "😰", "😡", "🥰", "😎"];
  cartasMemoriaProf = emojis.concat(emojis).sort(function () {
    return Math.random() - 0.5;
  });
  cartasViradasProf = [];
  paresEncontradosProf = 0;
  tentativasMemoriaProf = 0;
  document.getElementById("tentativasMemoriaProf").innerText = "0";
  document.getElementById("modalMemoriaProf").style.display = "flex";
  renderizarMemoriaProf();
}
function fecharJogoMemoriaProf() {
  document.getElementById("modalMemoriaProf").style.display = "none";
}
function renderizarMemoriaProf() {
  var grid = document.getElementById("gridMemoriaProf");
  grid.innerHTML = "";
  for (var i = 0; i < cartasMemoriaProf.length; i++) {
    (function (emoji) {
      var carta = document.createElement("div");
      carta.className = "carta-memoria";
      carta.innerText = "?";
      carta.onclick = function () {
        virarCartaProf(carta, emoji);
      };
      grid.appendChild(carta);
    })(cartasMemoriaProf[i]);
  }
}
function virarCartaProf(carta, emoji) {
  if (
    cartasViradasProf.length === 2 ||
    carta.classList.contains("virada") ||
    carta.classList.contains("par")
  )
    return;
  carta.classList.add("virada");
  carta.innerText = emoji;
  cartasViradasProf.push({ carta: carta, emoji: emoji });
  if (cartasViradasProf.length === 2) {
    tentativasMemoriaProf++;
    document.getElementById("tentativasMemoriaProf").innerText =
      tentativasMemoriaProf;
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
      var c1 = cartasViradasProf[0].carta,
        c2 = cartasViradasProf[1].carta;
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

function abrirJogoSubirProf() {
  document.getElementById("modalSubirProf").style.display = "flex";
  setTimeout(function () {
    canvasSubirProf = document.getElementById("canvasSubirProf");
    ctxSubirProf = canvasSubirProf.getContext("2d");
    jogadorSubirProf = {
      x: 175,
      y: 335,
      vx: 0,
      vy: 0,
      largura: 35,
      altura: 35,
      noChao: true,
      ultimaPlataforma: 0,
    };
    plataformasSubirProf = [
      {
        id: 0,
        x: 100,
        y: 370,
        largura: 160,
        altura: 12,
        velocidade: 0,
        direcao: 0,
      },
      {
        id: 1,
        x: 140,
        y: 300,
        largura: 100,
        altura: 10,
        velocidade: 0,
        direcao: 0,
      },
      {
        id: 2,
        x: 60,
        y: 235,
        largura: 90,
        altura: 10,
        velocidade: 0.8,
        direcao: 1,
      },
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
        direcao: Math.random() > 0.5 ? 1 : -1,
      });
    }
    pontosSubirProf = 0;
    teclasSubirProf = {};
    document.getElementById("pontosSubirProf").innerText = "0";
    document.getElementById("melhorSubirProf").innerText =
      melhorPontuacaoSubirProf;
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
  document.getElementById("modalSubirProf").style.display = "none";
  if (pontosSubirProf > melhorPontuacaoSubirProf)
    melhorPontuacaoSubirProf = pontosSubirProf;
}
function keydownSubirProf(e) {
  teclasSubirProf[e.key] = true;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
}
function keyupSubirProf(e) {
  teclasSubirProf[e.key] = false;
}
function atualizarSubirProf() {
  if (teclasSubirProf["ArrowLeft"]) jogadorSubirProf.vx = -6;
  else if (teclasSubirProf["ArrowRight"]) jogadorSubirProf.vx = 6;
  else jogadorSubirProf.vx *= 0.85;
  jogadorSubirProf.vy += 0.6;
  jogadorSubirProf.x += jogadorSubirProf.vx;
  jogadorSubirProf.y += jogadorSubirProf.vy;
  if (jogadorSubirProf.x > 400) jogadorSubirProf.x = -jogadorSubirProf.largura;
  if (jogadorSubirProf.x < -jogadorSubirProf.largura) jogadorSubirProf.x = 400;
  for (var i = 0; i < plataformasSubirProf.length; i++) {
    var p = plataformasSubirProf[i];
    if (p.velocidade > 0) {
      p.x += p.velocidade * p.direcao;
      if (p.x <= -30) {
        p.x = -30;
        p.direcao = 1;
      }
      if (p.x + p.largura >= 430) {
        p.x = 430 - p.largura;
        p.direcao = -1;
      }
    }
  }
  jogadorSubirProf.noChao = false;
  for (var i = 0; i < plataformasSubirProf.length; i++) {
    var p = plataformasSubirProf[i];
    if (jogadorSubirProf.vy > 0) {
      var pe = jogadorSubirProf.y + jogadorSubirProf.altura,
        peA = pe - jogadorSubirProf.vy;
      if (
        pe >= p.y &&
        peA <= p.y + 8 &&
        jogadorSubirProf.x + jogadorSubirProf.largura - 10 > p.x &&
        jogadorSubirProf.x + 10 < p.x + p.largura
      ) {
        jogadorSubirProf.vy = -11;
        jogadorSubirProf.y = p.y - jogadorSubirProf.altura;
        jogadorSubirProf.noChao = true;
        if (jogadorSubirProf.ultimaPlataforma !== p.id) {
          jogadorSubirProf.ultimaPlataforma = p.id;
          pontosSubirProf += 10;
          document.getElementById("pontosSubirProf").innerText =
            pontosSubirProf;
          if (pontosSubirProf > melhorPontuacaoSubirProf)
            document.getElementById("melhorSubirProf").innerText =
              pontosSubirProf;
        }
      }
    }
  }
  var maiorId = 0,
    maisAlta = 9999;
  for (var k = 0; k < plataformasSubirProf.length; k++) {
    if (plataformasSubirProf[k].id > maiorId)
      maiorId = plataformasSubirProf[k].id;
    if (plataformasSubirProf[k].y < maisAlta)
      maisAlta = plataformasSubirProf[k].y;
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
      direcao: Math.random() > 0.5 ? 1 : -1,
    });
    maisAlta -= 65;
  }
  for (var n = plataformasSubirProf.length - 1; n >= 0; n--) {
    if (plataformasSubirProf[n].y > 500 && plataformasSubirProf.length > 50)
      plataformasSubirProf.splice(n, 1);
  }
  if (jogadorSubirProf.y < 180) {
    var diff = 180 - jogadorSubirProf.y;
    jogadorSubirProf.y = 180;
    for (var j = 0; j < plataformasSubirProf.length; j++)
      plataformasSubirProf[j].y += diff;
  }
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

function abrirCacaPalavrasProf() {
  var sort = [],
    copia = bancoPalavrasProf.slice();
  for (var i = 0; i < 8; i++) {
    var idx = Math.floor(Math.random() * copia.length);
    sort.push(copia[idx]);
    copia.splice(idx, 1);
  }
  palavrasCacaProf = sort;
  palavrasEncontradasCacaProf = [];
  dicasCacaProf = 3;
  selecaoCacaProf = { ativa: false, inicioRow: -1, inicioCol: -1, celulas: [] };
  document.getElementById("palavrasEncontradasProf").innerText = "0/8";
  document.getElementById("dicasRestantesProf").innerText = dicasCacaProf;
  document.getElementById("btnDicaProf").disabled = false;
  gerarGradeCacaProf();
  document.getElementById("modalCacaPalavrasProf").style.display = "flex";
}
function fecharCacaPalavrasProf() {
  document.getElementById("modalCacaPalavrasProf").style.display = "none";
}
function gerarGradeCacaProf() {
  gradeCacaProf = [];
  for (var i = 0; i < 10; i++) {
    gradeCacaProf[i] = [];
    for (var j = 0; j < 10; j++) gradeCacaProf[i][j] = "";
  }
  for (var p = 0; p < palavrasCacaProf.length; p++) {
    var palavra = palavrasCacaProf[p],
      colocada = false,
      tent = 0;
    while (!colocada && tent < 200) {
      var dir = Math.floor(Math.random() * 3),
        row,
        col;
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
        if (gradeCacaProf[r][c] !== "" && gradeCacaProf[r][c] !== palavra[l]) {
          cabe = false;
          break;
        }
      }
      if (cabe) {
        for (var l2 = 0; l2 < palavra.length; l2++) {
          var r2 = dir === 1 ? row + l2 : dir === 2 ? row + l2 : row,
            c2 = dir === 0 ? col + l2 : dir === 2 ? col + l2 : col;
          gradeCacaProf[r2][c2] = palavra[l2];
        }
        colocada = true;
      }
      tent++;
    }
  }
  var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (gradeCacaProf[i][j] === "")
        gradeCacaProf[i][j] = letras[Math.floor(Math.random() * letras.length)];
    }
  }
  renderizarGradeCacaProf();
  renderizarListaPalavrasProf();
}
function renderizarGradeCacaProf() {
  var c = document.getElementById("gradeCacaPalavrasProf");
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
        cel.addEventListener("mouseenter", function (e) {
          if (!selecaoCacaProf.ativa || selecaoCacaProf.celulas.length === 0)
            return;
          var ult = selecaoCacaProf.celulas[selecaoCacaProf.celulas.length - 1];
          if (selecaoCacaProf.celulas.length === 1) {
            var dR = row - selecaoCacaProf.inicioRow,
              dC = col - selecaoCacaProf.inicioCol;
            if (dR === 0 || dC === 0 || Math.abs(dR) === Math.abs(dC)) {
              cel.classList.add("selecionada");
              selecaoCacaProf.celulas.push({ row: row, col: col, el: cel });
            }
          } else {
            var dRR =
                selecaoCacaProf.celulas[1].row - selecaoCacaProf.celulas[0].row,
              dCC =
                selecaoCacaProf.celulas[1].col - selecaoCacaProf.celulas[0].col;
            if (
              row === ult.row + (dRR !== 0 ? (dRR > 0 ? 1 : -1) : 0) &&
              col === ult.col + (dCC !== 0 ? (dCC > 0 ? 1 : -1) : 0)
            ) {
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
    if (!selecaoCacaProf.celulas[i].el.classList.contains("encontrada"))
      selecaoCacaProf.celulas[i].el.classList.remove("selecionada");
  }
  selecaoCacaProf.celulas = [];
}
function finalizarSelecaoCacaProf() {
  selecaoCacaProf.ativa = false;
  var palavra = "";
  for (var i = 0; i < selecaoCacaProf.celulas.length; i++)
    palavra +=
      gradeCacaProf[selecaoCacaProf.celulas[i].row][
        selecaoCacaProf.celulas[i].col
      ];
  var enc = false;
  for (var j = 0; j < palavrasCacaProf.length; j++) {
    if (
      palavrasCacaProf[j] === palavra &&
      palavrasEncontradasCacaProf.indexOf(palavrasCacaProf[j]) === -1
    ) {
      enc = true;
      palavrasEncontradasCacaProf.push(palavrasCacaProf[j]);
      for (var k = 0; k < selecaoCacaProf.celulas.length; k++) {
        selecaoCacaProf.celulas[k].el.classList.add("encontrada");
        selecaoCacaProf.celulas[k].el.classList.remove("selecionada");
      }
      document.getElementById("palavrasEncontradasProf").innerText =
        palavrasEncontradasCacaProf.length + "/8";
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
      alert(
        "💡 A palavra tem " +
          palavrasCacaProf[i].length +
          " letras e começa com '" +
          palavrasCacaProf[i][0] +
          "'",
      );
      dicasCacaProf--;
      document.getElementById("dicasRestantesProf").innerText = dicasCacaProf;
      if (dicasCacaProf <= 0)
        document.getElementById("btnDicaProf").disabled = true;
      return;
    }
  }
}

function abrirModalAvatarProf() {
  document.getElementById("modalAvatarProf").style.display = "flex";
}
function fecharModalAvatarProf() {
  document.getElementById("modalAvatarProf").style.display = "none";
}
function mudarAvatarProf(emoji) {
  document.getElementById("avatarProfAtual").innerText = emoji;
  fecharModalAvatarProf();
}
function sair() {
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  }
}
