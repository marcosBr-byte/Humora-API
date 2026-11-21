const formProfessor = document.getElementById('formProfessor');
const feedbackProfessor = document.getElementById('feedbackProfessor');

async function verificarCadastroProfessor() {
    try {
        const resposta = await fetch('/professor/permissoes', { headers: api.getHeaders() });
        if (resposta.ok && (await resposta.json()).administrador) {
            formProfessor.hidden = false;
            feedbackProfessor.textContent = '';
            return;
        }
        feedbackProfessor.textContent = 'Entre com a conta de administrador para cadastrar professores.';
    } catch {
        feedbackProfessor.textContent = 'Não foi possível verificar o acesso. Recarregue a página.';
    }
}

formProfessor.addEventListener('submit', async event => {
    event.preventDefault();
    const botao = formProfessor.querySelector('button');
    botao.disabled = true;
    const dados = Object.fromEntries(new FormData(formProfessor));
    dados.nome = dados.nome.trim();
    dados.email = dados.email.trim().toLowerCase();
    try {
        const resposta = await api.registerProfessor(dados);
        if (resposta.ok) {
            formProfessor.reset();
            feedbackProfessor.textContent = 'Professor cadastrado com sucesso.';
        } else {
            feedbackProfessor.textContent = resposta.status === 409
                ? 'Este e-mail já foi cadastrado.'
                : 'Não foi possível cadastrar o professor. Confira os dados e sua sessão.';
        }
    } catch {
        feedbackProfessor.textContent = 'Falha de conexão. Tente novamente.';
    } finally {
        botao.disabled = false;
    }
});

verificarCadastroProfessor();
