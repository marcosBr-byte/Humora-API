function contarEmocoes(tipos) {
    const contagem = Object.fromEntries(Object.keys(nomesEmocoes).map(tipo => [tipo, 0]));
    for (const tipo of tipos) {
        if (Object.hasOwn(contagem, tipo)) contagem[tipo]++;
    }
    return contagem;
}

function medidasDasEmocoes(contagem, unidade) {
    return Object.entries(nomesEmocoes).map(([emocao, nome]) => ({
        chave: emocao, emocao, nome, quantidade: contagem[emocao], unidade
    }));
}

function montarExploradorTermometro(container) {
    const mostrador = document.createElement('div');
    mostrador.className = 'fect-mostrador';
    const termometro = criarTermometroFect();
    mostrador.append(termometro);
    const controles = document.createElement('div');
    controles.className = 'termometro-controles';
    const descricao = document.createElement('p');
    descricao.className = 'termometro-detalhe';
    descricao.setAttribute('aria-live', 'polite');
    const opcoes = document.createElement('div');
    opcoes.className = 'termometro-opcoes';
    controles.append(opcoes, descricao);
    container.classList.add('termometro-explorador');
    container.append(mostrador, controles);

    let selecionado;
    let medidas = [];
    let vazio;
    let escalaVazia;
    let escolhas = [];
    let assinatura;

    function selecionar(chave, anunciar = true) {
        const medida = medidas.find(item => item.chave === chave);
        selecionado = medida?.chave;
        atualizarTermometroFect(termometro, medida?.valor, medida?.nome ?? 'Sem leitura', medida?.emocao, medida?.escala ?? escalaVazia);
        escolhas.forEach(botao => botao.setAttribute('aria-pressed', String(botao.dataset.chave === selecionado)));
        const texto = medida?.detalhe ?? vazio;
        if (descricao.textContent !== texto) {
            descricao.setAttribute('aria-live', anunciar ? 'polite' : 'off');
            descricao.textContent = texto;
        }
    }

    return function atualizar(novasMedidas, mensagemVazia, escala) {
        medidas = novasMedidas;
        vazio = mensagemVazia;
        escalaVazia = escala;
        const novaAssinatura = JSON.stringify(medidas.map(({ chave, nome, emocao, valor, selo }) =>
            [chave, nome, emocao, selo ?? valor]));
        if (novaAssinatura !== assinatura) {
            const foco = opcoes.contains(document.activeElement) ? document.activeElement.dataset.chave : undefined;
            assinatura = novaAssinatura;
            escolhas = medidas.map(medida => {
                const botao = document.createElement('button');
                botao.type = 'button';
                botao.dataset.chave = medida.chave;
                if (medida.emocao) botao.append(criarImagemEmocao(medida.emocao));
                const nome = document.createElement('span');
                nome.textContent = medida.nome;
                const selo = document.createElement('small');
                selo.textContent = medida.selo ?? (medida.valor == null ? '—' : `${fectDecimal.format(medida.valor)} / 5`);
                botao.append(nome, selo);
                botao.addEventListener('click', () => selecionar(medida.chave));
                return botao;
            });
            opcoes.replaceChildren(...escolhas);
            if (foco) escolhas.find(botao => botao.dataset.chave === foco)?.focus({ preventScroll: true });
        }
        selecionar(medidas.some(item => item.chave === selecionado) ? selecionado : medidas[0]?.chave, false);
    };
}

const exploradoresTermometros = new WeakMap();

function mostrarTermometros(id, medidas, mensagem, escala = 5) {
    const container = document.getElementById(id);
    if (!exploradoresTermometros.has(container)) {
        exploradoresTermometros.set(container, montarExploradorTermometro(container));
    }
    exploradoresTermometros.get(container)(medidas, mensagem, escala);
}

function termometrosPercentuais(id, medidas, mensagem) {
    const total = medidas.reduce((soma, item) => soma + item.quantidade, 0);
    const leituras = total ? medidas.map(item => {
        const valor = item.quantidade * 100 / total;
        return {
            ...item, valor, escala: 100,
            selo: `${fectDecimal.format(valor)}%`,
            detalhe: `${item.nome} · ${item.quantidade.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} ${item.unidade}.`
        };
    }) : [];
    mostrarTermometros(id, leituras, mensagem, 100);
}
