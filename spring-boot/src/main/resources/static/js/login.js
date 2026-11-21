async function login() {
    await executarEnvioFormulario('login', async () => {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const senha = document.getElementById('senha').value.trim();
        const tipo = document.getElementById('tipoUsuario').value;

        if (!email || senha.length < 8) {
            feedbackFormulario('Informe seu e-mail e uma senha com pelo menos 8 caracteres.', true);
            return;
        }

        const resposta = tipo === 'aluno' ? await api.loginAluno(email, senha) : await api.loginProfessor(email, senha);
        if (!resposta.ok) {
            feedbackFormulario(await erroDoFormulario(resposta, 'Não foi possível entrar. Confira seus dados.'), true);
            return;
        }

        const data = await resposta.json();
        api.logout();
        sessionStorage.setItem('token', data.token);
        try {
            const perfil = await api.getPerfil(tipo);
            if (!perfil.ok) {
                api.logout();
                feedbackFormulario('Não foi possível carregar o perfil. Tente entrar novamente.', true);
                return;
            }
            const usuario = await perfil.json();
            sessionStorage.setItem('usuarioLogado', JSON.stringify({ ...usuario, tipo }));
            window.location.href = tipo === 'aluno' ? 'aluno.html' : 'professor.html';
        } catch (erro) {
            api.logout();
            throw erro;
        }
    });
}

const perfis = [
    { botao: document.getElementById('btnAluno'), tipo: 'aluno' },
    { botao: document.getElementById('btnProfessor'), tipo: 'professor' }
];

for (const perfil of perfis) {
    perfil.botao.addEventListener('click', () => {
        if (botaoDoFormulario('login').disabled) return;
        document.getElementById('tipoUsuario').value = perfil.tipo;
        for (const item of perfis) {
            const selecionado = item === perfil;
            item.botao.classList.toggle('ativo', selecionado);
            item.botao.setAttribute('aria-pressed', String(selecionado));
        }
        feedbackFormulario('');
    });
}

habilitarEnvioPorTeclado('login');
if (sessionStorage.getItem('humoraCadastroConcluido')) {
    sessionStorage.removeItem('humoraCadastroConcluido');
    feedbackFormulario('Cadastro concluído. Você já pode entrar com sua conta.');
}
