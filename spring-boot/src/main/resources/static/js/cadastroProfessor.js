// js/cadastroProfessor.js
function inicializarCadastroProfessor() {
    const botoesTurma = document.querySelectorAll(".turma-btn");
    const inputHidden = document.getElementById("turmasSelecionadas");
    if (!botoesTurma.length) return;

    botoesTurma.forEach(b => b.classList.remove("selecionado"));
    if (inputHidden) inputHidden.value = "[]";

    function atualizarTurmas() {
        const selecionadas = [...document.querySelectorAll(".turma-btn.selecionado")]
            .map(b => b.dataset.value);
        if (inputHidden) {
            inputHidden.value = selecionadas.includes("Todas")
                ? JSON.stringify(["Todas"])
                : JSON.stringify(selecionadas);
        }
    }

    botoesTurma.forEach(botao => {
        botao.addEventListener("click", function (e) {
            e.stopPropagation();
            const valor = this.dataset.value;

            if (valor === "Todas") {
                const marcado = this.classList.toggle("selecionado");
                if (marcado) {
                    document.querySelectorAll(".turma-btn:not(.todas)")
                        .forEach(b => b.classList.remove("selecionado"));
                }
            } else {
                const todas = document.querySelector(".turma-btn.todas");
                if (todas) todas.classList.remove("selecionado");
                this.classList.toggle("selecionado");
            }
            atualizarTurmas();
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarCadastroProfessor);
} else {
    inicializarCadastroProfessor();
}

async function cadastrarProfessor() {
    const nome        = document.getElementById("nome").value.trim();
    const email       = document.getElementById("email").value.trim().toLowerCase();
    const senha       = document.getElementById("senha").value.trim();
    const area        = document.getElementById("area").value;
    const chaveAcesso = document.getElementById("chaveAcesso").value.trim();

    if (!nome || !email || !senha || !area) return alert("❌ Preencha todos os campos obrigatórios.");
    if (senha.length < 8) return alert("❌ A senha deve possuir no mínimo 8 caracteres.");
    if (chaveAcesso !== "HUMORADM2026") return alert("❌ Chave de acesso inválida! Use: HUMORADM2026");

    try {
        const response = await api.registerProfessor({
            nome, email, senha, chaveAcesso, materia: area
        });

        const texto = await response.text();
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