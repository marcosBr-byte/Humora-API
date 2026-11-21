document.getElementById('formVisitante').addEventListener('submit', event => {
    event.preventDefault();
    const { primeiroNome, cidade } = event.currentTarget.elements;
    const nome = primeiroNome.value.trim();
    const origem = cidade.value.trim();
    if (!nome || !origem) {
        document.getElementById('feedbackVisitante').textContent = 'Preencha seu primeiro nome e sua cidade.';
        (nome ? cidade : primeiroNome).focus();
        return;
    }

    ['token', 'tipoUsuario', 'email', 'humoraVisitanteDados'].forEach(key => sessionStorage.removeItem(key));
    sessionStorage.setItem('usuarioLogado', JSON.stringify({ tipo: 'visitante', nome, cidade: origem }));
    window.location.assign('visitante.html');
});
