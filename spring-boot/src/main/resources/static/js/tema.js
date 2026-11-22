const temasHumora = Object.freeze({
    claro: 'Claro',
    ameixa: 'Ameixa (escuro)'
});
const chaveTemaHumora = 'humoraTema';
const chaveMovimentoHumora = 'humoraMovimento';
const movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)');
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

function aplicarMovimentoHumora() {
    const salvo = lerPreferenciaHumora(chaveMovimentoHumora);
    const animado = salvo === 'animado' || (salvo !== 'parado' && !movimentoReduzido.matches);
    raizTemaHumora.dataset.movimento = animado ? 'animado' : 'parado';
    return animado;
}

aplicarTemaHumora(lerPreferenciaHumora(chaveTemaHumora));
aplicarMovimentoHumora();

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
    const botaoMovimento = document.createElement('button');
    botaoMovimento.type = 'button';
    botaoMovimento.className = 'humora-movimento';
    botaoMovimento.setAttribute('aria-label', 'Animações');

    function atualizarBotaoMovimento(animado) {
        botaoMovimento.setAttribute('aria-pressed', String(animado));
        botaoMovimento.title = animado ? 'Pausar animações' : 'Ativar animações';
        botaoMovimento.textContent = animado ? 'Ⅱ' : '▶';
    }

    botaoMovimento.addEventListener('click', () => {
        const animado = raizTemaHumora.dataset.movimento !== 'animado';
        const estado = animado ? 'animado' : 'parado';
        raizTemaHumora.dataset.movimento = estado;
        try {
            localStorage.setItem(chaveMovimentoHumora, estado);
        } catch {
            // A escolha continua válida nesta página.
        }
        atualizarBotaoMovimento(animado);
    });
    movimentoReduzido.addEventListener?.('change', () => atualizarBotaoMovimento(aplicarMovimentoHumora()));
    window.addEventListener('storage', evento => {
        if (evento.key === chaveTemaHumora || evento.key === null) atualizar(lerPreferenciaHumora(chaveTemaHumora));
        if (evento.key === chaveMovimentoHumora || evento.key === null) atualizarBotaoMovimento(aplicarMovimentoHumora());
    });
    seletor.append(texto, opcoes);
    barra.append(seletor, botaoMovimento);
    document.body.prepend(barra);
    atualizarBotaoMovimento(raizTemaHumora.dataset.movimento === 'animado');
    atualizar(raizTemaHumora.dataset.tema);
});
