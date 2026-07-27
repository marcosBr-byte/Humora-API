// js/cadastroProfessor.js
const CHAVE_ACESSO_CORRETA = "profDM2026";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".area-btn").forEach(botao => 
        botao.classList.remove("selecionado")
    );
    document.getElementById("turmasSelecionadas").value = "[]";
});

const botoesTurma = document.querySelectorAll(".area-btn");
const inputHidden = document.getElementById("turmasSelecionadas");

function atualizarTurmas() {
    const selecionadas = Array.from(
        document.querySelectorAll(".area-btn.selecionado")
    ).map(botao => botao.dataset.value);
    if (selecionadas.includes("Todas")) {
        inputHidden.value = JSON.stringify(["Todas"]);
    } else {
        inputHidden.value = JSON.stringify(selecionadas);
    }
}

botoesTurma.forEach(botao => {
    botao.addEventListener("click", () => {
        const valor = botao.dataset.value;
        if (valor === "Todas") {
            const marcado = botao.classList.toggle("selecionado");
            if (marcado) {
                document.querySelectorAll(".area-btn:not(.todas)").forEach(b => 
                    b.classList.remove("selecionado")
                );
            }
        } else {
            document.querySelector(".area-btn.todas")?.classList.remove("selecionado");
            botao.classList.toggle("selecionado");
        }
        atualizarTurmas();
    });
});

async function cadastrarProfessor() {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value.trim();
    const area = document.getElementById("area").value;
    const chaveAcesso = document.getElementById("chaveAcesso").value.trim();

    if (!nome || !email || !senha || !area) {
        return alert("Preencha todos os campos obrigatórios.");
    }
    if (senha.length < 8) {
        return alert("A senha deve possuir no mínimo 8 caracteres.");
    }
    if (!chaveAcesso) {
        return alert("⚠️ A chave de acesso do professor é obrigatória!");
    }
    if (chaveAcesso !== CHAVE_ACESSO_CORRETA) {
        return alert("❌ Chave de acesso inválida!");
    }

    try {
        const response = await api.registerProfessor({
            nome: nome,
            email: email,
            senha: senha,
            materia: area,
            chaveAcesso: chaveAcesso
        });

        if (!response.ok) {
            let errorMsg = "Erro ao cadastrar.";
            try {
                const error = await response.text();
                if (error) errorMsg = error;
            } catch (e) {}
            return alert("❌ " + errorMsg);
        }

        alert("✅ Professor cadastrado com sucesso! 👨‍🏫");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Erro no cadastro:", error);
        alert("❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
}