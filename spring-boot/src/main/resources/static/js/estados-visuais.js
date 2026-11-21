function copiarModeloPainel(id, valores = {}) {
    const item = document.getElementById(id).content.firstElementChild.cloneNode(true);
    const campos = item.matches('[data-texto]') ? [item] : item.querySelectorAll('[data-texto]');
    for (const campo of campos) {
        campo.textContent = valores[campo.dataset.texto] ?? '';
    }
    return item;
}

function mostrarSemDados(container, mensagem, formato, centralizado = false) {
    const aviso = copiarModeloPainel('modeloSemDados', { mensagem });
    aviso.dataset.formato = formato;
    aviso.dataset.centralizado = String(centralizado);
    container.replaceChildren(aviso);
}

function exibirElemento(elemento, modo) {
    elemento.dataset.exibicao = modo;
    if (elemento.classList.contains('modal-overlay')) atualizarDialogo(elemento, modo !== 'nenhum');
}

const coresGame = [
    { nome: 'Vermelho', id: 'vermelho' },
    { nome: 'Azul', id: 'azul' },
    { nome: 'Verde', id: 'verde' },
    { nome: 'Amarelo', id: 'amarelo' },
    { nome: 'Roxo', id: 'roxo' }
];

function colorirAlvoPopIt(elemento, cor) {
    elemento.dataset.cor = cor.id;
}

function criarBolaPopIt(cor) {
    const bola = copiarModeloPainel('modeloBolaPopIt');
    bola.dataset.cor = cor.id;
    bola.setAttribute("aria-label", cor.nome);
    return bola;
}

const temposBarras = new WeakMap();

function animarBarraPopIt(barra, tempo) {
    clearTimeout(temposBarras.get(barra));
    delete barra.dataset.contagem;
    barra.dataset.tempo = String(tempo);
    const inicio = setTimeout(() => {
        barra.dataset.contagem = 'on';
    }, 50);
    temposBarras.set(barra, inicio);
}

const dialogosAbertos = new Map();
const controlesFocaveis = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]';

function atualizarDialogo(dialogo, aberto) {
    const conteudo = dialogo.querySelector('.modal-content');
    if (!conteudo) return;

    if (aberto) {
        if (dialogosAbertos.has(dialogo)) return;
        dialogosAbertos.set(dialogo, document.activeElement);
        dialogo.setAttribute('role', 'dialog');
        dialogo.setAttribute('aria-modal', 'true');
        const titulo = conteudo.querySelector('h2');
        if (titulo) {
            titulo.id ||= `${dialogo.id}-titulo`;
            dialogo.setAttribute('aria-labelledby', titulo.id);
        }
        conteudo.tabIndex = -1;
        requestAnimationFrame(() => {
            if (dialogosAbertos.has(dialogo)) conteudo.focus({ preventScroll: true });
        });
    } else if (dialogosAbertos.has(dialogo)) {
        const origem = dialogosAbertos.get(dialogo);
        dialogosAbertos.delete(dialogo);
        if (origem instanceof HTMLElement && origem.isConnected) origem.focus({ preventScroll: true });
    }
}

function fecharDialogoPorControle(dialogo) {
    const fechar = dialogo.querySelector('button[onclick^="fechar"], button[onclick^="cancelar"]');
    if (fechar) fechar.click();
    else exibirElemento(dialogo, 'nenhum');
}

document.addEventListener('click', evento => {
    if (dialogosAbertos.has(evento.target)) fecharDialogoPorControle(evento.target);
});

document.addEventListener('keydown', evento => {
    const dialogo = [...dialogosAbertos.keys()].at(-1);
    if (dialogo && evento.key === 'Escape') {
        evento.preventDefault();
        fecharDialogoPorControle(dialogo);
    }
    if (dialogo && evento.key === 'Tab') {
        const controles = [...dialogo.querySelectorAll(controlesFocaveis)].filter(el => el.getClientRects().length);
        const primeiro = controles.at(0);
        const ultimo = controles.at(-1);
        if (!primeiro) {
            evento.preventDefault();
        } else if (evento.shiftKey && (document.activeElement === primeiro || !controles.includes(document.activeElement))) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }

    const atalho = evento.target.closest('.jogo-card[role="button"], .avatar[role="button"]');
    if (atalho && (evento.key === 'Enter' || evento.key === ' ') && !evento.repeat) {
        evento.preventDefault();
        atalho.click();
    }
});

function sincronizarAbaPainel(aba, botao) {
    document.querySelectorAll('.menu-sidebar .menu-item').forEach(item => {
        if (item === botao) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    });
    if (!aba || !botao) return;

    const conteudo = aba.closest('.conteudo');
    if (conteudo) conteudo.scrollTop = 0;
    if (matchMedia('(max-width: 1024px)').matches) window.scrollTo({ top: 0, behavior: 'instant' });
    const titulo = aba.querySelector('h1');
    if (titulo) {
        titulo.tabIndex = -1;
        titulo.focus({ preventScroll: true });
    }
}

let tempoAvisoPainel;
function notificarPainel(mensagem, erro = false) {
    const aviso = document.getElementById('avisoPainel');
    aviso.dataset.erro = String(erro);
    aviso.hidden = false;
    aviso.textContent = mensagem;
    clearTimeout(tempoAvisoPainel);
    tempoAvisoPainel = setTimeout(() => { aviso.hidden = true; }, erro ? 7000 : 4500);
}
