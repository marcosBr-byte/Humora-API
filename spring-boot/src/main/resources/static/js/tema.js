const temasHumora = Object.freeze({
    claro: 'Claro',
    ameixa: 'Ameixa (escuro)'
});
const chaveTemaHumora = 'humoraTema';
const raizTemaHumora = document.documentElement;

function aplicarTemaHumora(tema) {
    raizTemaHumora.dataset.tema = tema === 'ameixa' || tema === 'ametista' ? 'ameixa' : 'claro';
}

function lerPreferenciaHumora(chave) {
    try {
        return localStorage.getItem(chave);
    } catch {
        return null;
    }
}

aplicarTemaHumora(lerPreferenciaHumora(chaveTemaHumora));

document.addEventListener('DOMContentLoaded', () => {
    const barra = document.createElement('div');
    barra.className = 'humora-tema';
    const seletor = document.createElement('label');
    const texto = document.createElement('span');
    texto.textContent = 'Tema';
    const opcoes = document.createElement('select');
    for (const [valor, rotulo] of Object.entries(temasHumora)) {
        opcoes.add(new Option(rotulo, valor));
    }
    function atualizar(tema) {
        aplicarTemaHumora(tema);
        opcoes.value = raizTemaHumora.dataset.tema;
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
        if (evento.key === chaveTemaHumora || evento.key === null) atualizar(lerPreferenciaHumora(chaveTemaHumora));
    });
    seletor.append(texto, opcoes);
    barra.append(seletor);
    document.body.prepend(barra);
    atualizar(raizTemaHumora.dataset.tema);
});
