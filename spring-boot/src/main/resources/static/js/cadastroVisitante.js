document.getElementById('formVisitante').addEventListener('submit', async event => {
    event.preventDefault();
    const formulario = event.currentTarget;
    const { primeiroNome, cidade } = formulario.elements;
    const botao = formulario.querySelector('button[type="submit"]');
    const feedback = document.getElementById('feedbackVisitante');
    if (botao.disabled) return;
    const nome = primeiroNome.value.trim();
    const origem = cidade.value.trim();
    if (!nome || !origem) {
        feedback.textContent = 'Preencha seu primeiro nome e sua cidade.';
        (nome ? cidade : primeiroNome).focus();
        return;
    }

    botao.disabled = true;
    feedback.textContent = 'Salvando cadastro…';
    try {
        const resposta = await fetch('/fect/visitantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ primeiroNome: nome, cidade: origem }),
        });
        if (!resposta.ok) {
            throw new Error('Falha ao salvar visitante');
        }
    } catch {
        feedback.textContent = 'Não foi possível salvar o cadastro. Tente novamente.';
        botao.disabled = false;
        return;
    }

    ['token', 'tipoUsuario', 'email', 'humoraVisitanteDados'].forEach(key => sessionStorage.removeItem(key));
    sessionStorage.setItem('usuarioLogado', JSON.stringify({ tipo: 'visitante', nome, cidade: origem }));
    window.location.assign('visitante.html');
});
