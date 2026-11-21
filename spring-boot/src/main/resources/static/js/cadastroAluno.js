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
    await executarEnvioFormulario('cadastrarAluno', async () => {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const senha = document.getElementById('senha').value.trim();
        const turmaInfo = TURMA_MAP[document.getElementById('sala').value];

        if (!nome || !email || senha.length < 8 || !turmaInfo) {
            feedbackFormulario('Preencha os dados, escolha sua turma e informe uma senha de 8 caracteres ou mais.', true);
            return;
        }
        const resposta = await api.registerAluno({ nome, email, senha, ...turmaInfo });
        if (resposta.ok) concluirCadastro();
        else feedbackFormulario(await erroDoFormulario(resposta, 'Não foi possível concluir o cadastro.'), true);
    });
}

habilitarEnvioPorTeclado('cadastrarAluno');
