// js/cadastroProfessor.js

console.log("📄 cadastroProfessor.js carregado!");

// ====== FUNÇÃO PARA INICIALIZAR TUDO ======
function inicializarCadastroProfessor() {
    console.log("🔧 Inicializando cadastroProfessor...");

    const botoesTurma = document.querySelectorAll(".turma-btn");
    const inputHidden = document.getElementById("turmasSelecionadas");

    console.log("🔍 Botões de turma encontrados:", botoesTurma.length);

    if (botoesTurma.length === 0) {
        console.error("❌ Nenhum botão .turma-btn encontrado!");
        return;
    }

    // Limpa seleções
    botoesTurma.forEach(function(botao) {
        botao.classList.remove("selecionado");
    });
    if (inputHidden) inputHidden.value = "[]";

    // Função para atualizar o campo oculto
    function atualizarTurmas() {
        var selecionadas = [];
        var todosBotoes = document.querySelectorAll(".turma-btn.selecionado");
        for (var i = 0; i < todosBotoes.length; i++) {
            selecionadas.push(todosBotoes[i].dataset.value);
        }

        if (selecionadas.indexOf("Todas") !== -1) {
            inputHidden.value = JSON.stringify(["Todas"]);
        } else {
            inputHidden.value = JSON.stringify(selecionadas);
        }
        console.log("📋 Turmas selecionadas:", inputHidden.value);
    }

    // Adiciona eventos de clique
    for (var i = 0; i < botoesTurma.length; i++) {
        (function(botao) {
            botao.addEventListener("click", function(event) {
                event.stopPropagation();
                var valor = this.dataset.value;
                console.log("🖱️ Clicou na turma:", valor);

                if (valor === "Todas") {
                    var marcado = this.classList.toggle("selecionado");
                    if (marcado) {
                        var outros = document.querySelectorAll(".turma-btn:not(.todas)");
                        for (var j = 0; j < outros.length; j++) {
                            outros[j].classList.remove("selecionado");
                        }
                    }
                } else {
                    var todasBtn = document.querySelector(".turma-btn.todas");
                    if (todasBtn) todasBtn.classList.remove("selecionado");
                    this.classList.toggle("selecionado");
                }
                atualizarTurmas();
            });
        })(botoesTurma[i]);
    }

    console.log("✅ Listeners de turmas adicionados!");
}

// ====== INICIALIZAÇÃO ======
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarCadastroProfessor);
} else {
    inicializarCadastroProfessor();
}

// ====== FUNÇÃO DE CADASTRO ======
async function cadastrarProfessor() {
    console.log("🚀 Função cadastrarProfessor() chamada");

    var nome = document.getElementById("nome").value.trim();
    var email = document.getElementById("email").value.trim().toLowerCase();
    var senha = document.getElementById("senha").value.trim();
    var area = document.getElementById("area").value;
    var chaveAcesso = document.getElementById("chaveAcesso").value.trim();

    console.log("📝 Dados:", { nome, email, area, chaveAcesso });

    if (!nome || !email || !senha || !area) {
        alert("❌ Preencha todos os campos obrigatórios.");
        return;
    }
    if (senha.length < 8) {
        alert("❌ A senha deve possuir no mínimo 8 caracteres.");
        return;
    }
    if (chaveAcesso !== "HUMORADM2026") {
        alert("❌ Chave de acesso inválida! Use: HUMORADM2026");
        return;
    }

    var dados = {
        nome: nome,
        email: email,
        senha: senha,
        chaveAcesso: chaveAcesso,
        materia: area
    };

    try {
        console.log("📤 Enviando...");
        var response = await fetch("http://localhost:8080/auth/register/professor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        var texto = await response.text();
        console.log("📥 Resposta:", response.status, texto);

        if (response.ok) {
            alert("✅ " + texto);
            window.location.href = "login.html";
        } else {
            alert("❌ " + texto);
        }
    } catch (error) {
        console.error("❌ Erro:", error);
        alert("❌ Erro ao conectar com o servidor.\n\n" + error.message);
    }
}