// js/login.js
const CHAVE_ACESSO_CORRETA = "HUMORADM2026";

async function login() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value.trim();
    const tipo  = document.getElementById("tipoUsuario").value;

    if (!email || !senha) return alert("Preencha todos os campos.");
    if (senha.length < 8) return alert("A senha deve possuir no mínimo 8 caracteres.");

    try {
        let response;
        if (tipo === "aluno") {
            response = await api.loginAluno(email, senha);
        } else {
            const chave = prompt("🔑 Digite a chave de acesso do professor:");
            if (!chave || chave !== CHAVE_ACESSO_CORRETA) {
                return alert("❌ Chave de acesso inválida! Acesso negado.");
            }
            response = await api.loginProfessor(email, senha);
        }

        if (!response.ok) {
            let msg = "Erro no login.";
            try { const t = await response.text(); if (t) msg = t; } catch (_) {}
            return alert("❌ " + msg);
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("tipoUsuario", tipo);
        localStorage.setItem("email", email);

        if (tipo === "aluno") {
            const aluno = await api.getAlunoByEmail(email);
            const usuario = aluno
                ? { ...aluno, tipo: 'aluno' }
                : { nome: email.split('@')[0], email, tipo: 'aluno' };
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            window.location.href = "aluno.html";
        } else {
            const prof = await api.getProfessorByEmail(email);
            const usuario = prof
                ? { ...prof, tipo: 'professor' }
                : { nome: email.split('@')[0], email, tipo: 'professor' };
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            window.location.href = "professor.html";
        }
    } catch (error) {
        console.error("Erro no login:", error);
        alert("❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnAluno = document.getElementById("btnAluno");
    const btnProfessor = document.getElementById("btnProfessor");
    const tipo = document.getElementById("tipoUsuario");
    if (!btnAluno || !btnProfessor) return;

    btnAluno.onclick = () => {
        btnAluno.classList.add("ativo");
        btnProfessor.classList.remove("ativo");
        tipo.value = "aluno";
    };
    btnProfessor.onclick = () => {
        btnProfessor.classList.add("ativo");
        btnAluno.classList.remove("ativo");
        tipo.value = "professor";
    };
});