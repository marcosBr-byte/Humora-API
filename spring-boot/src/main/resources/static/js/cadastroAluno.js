// js/cadastroAluno.js
const TURMA_MAP = {
    '1º AGROECOLOGIA - A':       { serie: 'PRIMEIRO_ANO', turma: 'A' },
    '1º ANÁLISES CLÍNICAS - B':  { serie: 'PRIMEIRO_ANO', turma: 'B' },
    '1º ANÁLISES CLÍNICAS - C':  { serie: 'PRIMEIRO_ANO', turma: 'C' },
    '1º INFORMÁTICA - D':        { serie: 'PRIMEIRO_ANO', turma: 'D' },
    '1º INFORMÁTICA - E':        { serie: 'PRIMEIRO_ANO', turma: 'E' },
    '2º AGROECOLOGIA - F':       { serie: 'SEGUNDO_ANO',  turma: 'F' },
    '2º ANÁLISES CLÍNICAS - G':  { serie: 'SEGUNDO_ANO',  turma: 'G' },
    '2º INFORMÁTICA - H':        { serie: 'SEGUNDO_ANO',  turma: 'H' },
    '2º INFORMÁTICA - I':        { serie: 'SEGUNDO_ANO',  turma: 'I' },
    '2º INFORMÁTICA - J':        { serie: 'SEGUNDO_ANO',  turma: 'J' },
    '3º AGROECOLOGIA - K':       { serie: 'TERCEIRO_ANO', turma: 'K' },
    '3º ANÁLISES CLÍNICAS - L':  { serie: 'TERCEIRO_ANO', turma: 'L' },
    '3º ANÁLISES CLÍNICAS - M':  { serie: 'TERCEIRO_ANO', turma: 'M' },
    '3º INFORMÁTICA - N':        { serie: 'TERCEIRO_ANO', turma: 'N' },
    '3º INFORMÁTICA - O':        { serie: 'TERCEIRO_ANO', turma: 'O' },
    '3º INFORMÁTICA - P':        { serie: 'TERCEIRO_ANO', turma: 'P' }
};

async function cadastrarAluno() {
    const nome  = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value.trim();
    const turma = document.getElementById("sala").value;

    if (!nome || !email || !senha || !turma) return alert("❌ Preencha todos os campos.");
    if (senha.length < 8) return alert("❌ A senha deve possuir no mínimo 8 caracteres.");

    const turmaInfo = TURMA_MAP[turma];
    if (!turmaInfo) return alert("❌ Turma inválida. Selecione uma turma válida.");

    try {
        const response = await api.registerAluno({
            nome, email, senha,
            turma: turmaInfo.turma,
            serie: turmaInfo.serie
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