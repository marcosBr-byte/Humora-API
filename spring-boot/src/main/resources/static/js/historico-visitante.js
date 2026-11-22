function mostrarHistoricoVisitante(historico) {
    const lista = document.getElementById('historicoVisitante');
    const filtro = document.getElementById('diaHistoricoVisitante');
    const resumo = document.getElementById('resumoHistoricoVisitante');
    const dias = new Map();
    for (const registro of [...historico].sort((a, b) => b.timestamp - a.timestamp)) {
        const data = registro.data || new Date(registro.timestamp).toLocaleDateString('pt-BR');
        if (!dias.has(data)) dias.set(data, []);
        dias.get(data).push(registro);
    }

    const selecionado = filtro.value;
    filtro.replaceChildren(new Option('Todos os dias', ''),
        ...Array.from(dias.keys(), dia => new Option(dia, dia)));
    filtro.value = dias.has(selecionado) ? selecionado : '';
    filtro.disabled = !dias.size;

    const plural = (quantidade, singular, plural) => `${quantidade} ${quantidade === 1 ? singular : plural}`;
    resumo.textContent = historico.length
        ? `${plural(historico.length, 'registro', 'registros')} · ${plural(dias.size, 'dia', 'dias')}`
        : 'Nenhum registro ainda. Registre uma emoção no termômetro para começar.';
    const modelos = Array.from(dias, ([dia, registros]) => {
        if (filtro.value && filtro.value !== dia) return null;
        const grupo = document.createElement('section');
        grupo.className = 'historico-visitante-dia';
        const titulo = document.createElement('h3');
        titulo.textContent = dia;
        const itens = document.createElement('ul');
        for (const { emocao, intensidade, hora } of registros) {
            const item = document.createElement('li');
            if (Object.hasOwn(nomesEmocoes, emocao)) item.append(criarImagemEmocao(emocao));
            const nome = document.createElement('strong');
            nome.textContent = nomesEmocoes[emocao] ?? 'Emoção';
            const horario = document.createElement('span');
            horario.textContent = hora || '—';
            const nivel = document.createElement('span');
            nivel.className = 'historico-visitante-nivel';
            nivel.textContent = `Intensidade ${intensidade ?? '—'}/5`;
            item.append(nome, horario, nivel);
            itens.append(item);
        }
        grupo.append(titulo, itens);
        return grupo;
    });
    lista.replaceChildren(...modelos.filter(Boolean));
}
