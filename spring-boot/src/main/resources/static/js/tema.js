const temasHumora = Object.freeze({
    claro: 'Claro',
    ameixa: 'Ameixa (escuro)'
});
const chaveTemaHumora = 'humoraTema';
const raizTemaHumora = document.documentElement;

function aplicarTemaHumora(tema) {
    raizTemaHumora.dataset.tema = tema === 'ameixa' || tema === 'ametista' ? 'ameixa' : 'claro';
}

function lerTemaHumora() {
    try {
        return localStorage.getItem(chaveTemaHumora);
    } catch {
        return null;
    }
}

function corTemaHumora(propriedade) {
    return getComputedStyle(raizTemaHumora).getPropertyValue(propriedade).trim();
}

function atualizarGraficosTemaHumora() {
    if (!window.Chart) return;
    Chart.defaults.color = corTemaHumora('--fect-secundario');
    Chart.defaults.borderColor = corTemaHumora('--fect-borda');
    for (const grafico of Object.values(Chart.instances)) grafico.update('none');
}

aplicarTemaHumora(lerTemaHumora());

document.addEventListener('DOMContentLoaded', () => {
    const seletor = document.createElement('label');
    seletor.className = 'humora-tema';
    const texto = document.createElement('span');
    texto.textContent = 'Tema';
    const opcoes = document.createElement('select');
    for (const [valor, rotulo] of Object.entries(temasHumora)) {
        opcoes.add(new Option(rotulo, valor));
    }
    function atualizar(tema) {
        aplicarTemaHumora(tema);
        opcoes.value = raizTemaHumora.dataset.tema;
        atualizarGraficosTemaHumora();
    }
    opcoes.addEventListener('change', () => {
        atualizar(opcoes.value);
        try {
            localStorage.setItem(chaveTemaHumora, opcoes.value);
        } catch {
            // O tema continua disponível nesta página quando o armazenamento está bloqueado.
        }
    });
    window.addEventListener('storage', evento => {
        if (evento.key === chaveTemaHumora || evento.key === null) atualizar(lerTemaHumora());
    });
    seletor.append(texto, opcoes);
    document.body.prepend(seletor);
    atualizar(raizTemaHumora.dataset.tema);
});
