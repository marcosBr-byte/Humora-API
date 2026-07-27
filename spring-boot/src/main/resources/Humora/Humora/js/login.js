// js/login.js
async function login() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value.trim();
    const tipo = document.getElementById("tipoUsuario").value;

    if (email === "" || senha === "") {
        return alert("Preencha todos os campos.");
    }
    if (senha.length < 8) {
        return alert("A senha deve possuir no mínimo 8 caracteres.");
    }

    try {
        let response;
        if (tipo === "aluno") {
            response = await api.loginAluno(email, senha);
        } else {
            const chaveAcesso = prompt("🔑 Digite a chave de acesso do professor:");
            const CHAVE_CORRETA = "profDM2026";
            
            if (!chaveAcesso || chaveAcesso !== CHAVE_CORRETA) {
                return alert("❌ Chave de acesso inválida! Acesso negado.");
            }
            response = await api.loginProfessor(email, senha);
        }

        if (!response.ok) {
            let errorMsg = "Erro no login.";
            try {
                const error = await response.text();
                if (error) errorMsg = error;
            } catch (e) {}
            return alert("❌ " + errorMsg);
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("tipoUsuario", tipo);
        localStorage.setItem("email", email);

        // Buscar dados do usuário
        if (tipo === "aluno") {
            const alunosResponse = await api.getAllAlunos();
            if (alunosResponse.ok) {
                const alunos = await alunosResponse.json();
                const aluno = alunos.find(a => a.email === email);
                if (aluno) {
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        ...aluno,
                        senha: senha,
                        tipo: 'aluno'
                    }));
                }
            }
            window.location.href = "aluno.html";
        } else {
            const profResponse = await api.getAllProfessores();
            if (profResponse.ok) {
                const professores = await profResponse.json();
                const professor = professores.find(p => p.email === email);
                if (professor) {
                    localStorage.setItem("usuarioLogado", JSON.stringify({
                        ...professor,
                        senha: senha,
                        tipo: 'professor'
                    }));
                }
            }
            window.location.href = "professor.html";
        }
    } catch (error) {
        console.error("Erro no login:", error);
        alert("❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
}

// Configurar os botões de tipo
document.addEventListener('DOMContentLoaded', function() {
    const btnAluno = document.getElementById("btnAluno");
    const btnProfessor = document.getElementById("btnProfessor");
    const tipo = document.getElementById("tipoUsuario");

    if (btnAluno && btnProfessor) {
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
    }
});