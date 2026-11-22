async function login() {
    await executarEnvioFormulario('login', async () => {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const senha = document.getElementById('senha').value.trim();

        if (!email || senha.length < 8) {
            feedbackFormulario('Informe seu e-mail e uma senha com pelo menos 8 caracteres.', true);
            return;
        }

        const resposta = await api.loginProfessor(email, senha);
        if (!resposta.ok) {
            feedbackFormulario(await erroDoFormulario(resposta, 'Não foi possível entrar. Confira seus dados.'), true);
            return;
        }

        const data = await resposta.json();
        api.logout();
        sessionStorage.setItem('token', data.token);
        try {
            const perfil = await api.getPerfil('professor');
            if (!perfil.ok) {
                api.logout();
                feedbackFormulario('Não foi possível carregar o perfil. Tente entrar novamente.', true);
                return;
            }
            const usuario = await perfil.json();
            sessionStorage.setItem('usuarioLogado', JSON.stringify({ ...usuario, tipo: 'professor' }));
            window.location.href = 'professor.html';
        } catch (erro) {
            api.logout();
            throw erro;
        }
    });
}

habilitarEnvioPorTeclado('login');
