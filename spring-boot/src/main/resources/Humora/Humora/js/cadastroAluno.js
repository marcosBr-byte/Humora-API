// js/cadastroAluno.js

async function cadastrarAluno() {
    console.log("🚀 Botão cadastrar clicado");
    
    // Pegar valores
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value.trim();
    const turma = document.getElementById("sala").value;

    console.log("📝 Nome:", nome);
    console.log("📝 Email:", email);
    console.log("📝 Turma:", turma);

    // Validações básicas
    if (!nome || !email || !senha || !turma) {
        alert("❌ Preencha todos os campos.");
        return;
    }

    if (senha.length < 8) {
        alert("❌ A senha deve possuir no mínimo 8 caracteres.");
        return;
    }

    // Mapeamento de turmas
    const turmaMap = {
        '1º AGROECOLOGIA - A': { serie: 'PRIMEIRO_ANO', turma: 'A' },
        '1º ANÁLISES CLÍNICAS - B': { serie: 'PRIMEIRO_ANO', turma: 'B' },
        '1º ANÁLISES CLÍNICAS - C': { serie: 'PRIMEIRO_ANO', turma: 'C' },
        '1º INFORMÁTICA - D': { serie: 'PRIMEIRO_ANO', turma: 'D' },
        '1º INFORMÁTICA - E': { serie: 'PRIMEIRO_ANO', turma: 'E' },
        '2º AGROECOLOGIA - F': { serie: 'SEGUNDO_ANO', turma: 'F' },
        '2º ANÁLISES CLÍNICAS - G': { serie: 'SEGUNDO_ANO', turma: 'G' },
        '2º INFORMÁTICA - H': { serie: 'SEGUNDO_ANO', turma: 'H' },
        '2º INFORMÁTICA - I': { serie: 'SEGUNDO_ANO', turma: 'I' },
        '2º INFORMÁTICA - J': { serie: 'SEGUNDO_ANO', turma: 'J' },
        '3º AGROECOLOGIA - K': { serie: 'TERCEIRO_ANO', turma: 'K' },
        '3º ANÁLISES CLÍNICAS - L': { serie: 'TERCEIRO_ANO', turma: 'L' },
        '3º ANÁLISES CLÍNICAS - M': { serie: 'TERCEIRO_ANO', turma: 'M' },
        '3º INFORMÁTICA - N': { serie: 'TERCEIRO_ANO', turma: 'N' },
        '3º INFORMÁTICA - O': { serie: 'TERCEIRO_ANO', turma: 'O' },
        '3º INFORMÁTICA - P': { serie: 'TERCEIRO_ANO', turma: 'P' }
    };

    const turmaInfo = turmaMap[turma];
    if (!turmaInfo) {
        alert("❌ Turma inválida. Selecione uma turma válida.");
        console.error("Turma não encontrada:", turma);
        return;
    }

    console.log("✅ Turma mapeada:", turmaInfo);

    // Verificar se a API existe
    if (typeof api === 'undefined') {
        alert("❌ Erro: API não carregada. Verifique o arquivo api.js");
        console.error("api is undefined");
        return;
    }

    try {
        // Preparar dados para enviar
        const dados = {
            nome: nome,
            email: email,
            senha: senha,
            turma: turmaInfo.turma,
            serie: turmaInfo.serie
        };

        console.log("📤 Enviando dados:", dados);

        // Fazer a requisição
        const response = await fetch('http://localhost:8080/auth/register/aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        console.log("📥 Status da resposta:", response.status);

        // Ler a resposta
        const texto = await response.text();
        console.log("📥 Resposta do servidor:", texto);

        if (response.ok) {
            alert("✅ " + texto);
            window.location.href = "login.html";
        } else {
            alert("❌ " + texto);
        }

    } catch (error) {
        console.error("❌ Erro completo:", error);
        alert("❌ Erro ao conectar com o servidor.\n\n" + error.message + "\n\nVerifique se o backend está rodando na porta 8080.");
    }
}

// Teste ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página de cadastro carregada");
    console.log("✅ API disponível?", typeof api !== 'undefined');
    
    // Testar conexão com o backend
    fetch('http://localhost:8080/auth/register/aluno', {
        method: 'OPTIONS'
    })
    .then(response => {
        console.log("🔗 Conexão com backend:", response.status);
    })
    .catch(error => {
        console.error("❌ Backend não está respondendo:", error);
    });
});