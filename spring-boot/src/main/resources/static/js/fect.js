const fectDecimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function criarTermometroFect() {
    const elemento = document.createElement('div');
    elemento.className = 'fect-termometro';
    elemento.innerHTML = `
        <div class="fect-escala" aria-hidden="true">
            <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
        </div>
        <div class="fect-instrumento" aria-hidden="true">
            <div class="fect-tubo"><div class="fect-liquido"></div></div>
            <div class="fect-reservatorio"></div>
        </div>
        <div class="fect-leitura">
            <div class="fect-amora-leitura" aria-hidden="true"></div>
            <p class="fect-valor">— <small>/ 5</small></p>
            <p class="fect-legenda">Intensidade</p>
        </div>`;
    return elemento;
}

function atualizarTermometroFect(elemento, intensidade, rotulo, emocao) {
    elemento.style.setProperty('--fect-nivel', `${intensidade ? 8 + (intensidade - 1) * 22 : 0}%`);
    elemento.dataset.emocao = emocao || '';
    elemento.querySelector('.fect-valor').firstChild.textContent =
        intensidade ? `${fectDecimal.format(intensidade)} ` : '— ';
    elemento.querySelector('.fect-legenda').textContent = rotulo;

    const imagem = elemento.querySelector('.fect-amora-leitura');
    if (imagem.dataset.emocao !== (emocao || '')) {
        imagem.dataset.emocao = emocao || '';
        imagem.replaceChildren(...(emocao ? [criarImagemEmocao(emocao)] : []));
    }
}

function montarTermometroIndividual(visitante) {
    const inicio = document.getElementById('tab-inicio');
    const card = document.createElement('section');
    card.className = 'fect-painel termometro-individual';
    card.setAttribute('aria-labelledby', 'tituloTermometro');
    card.innerHTML = `
        <div class="fect-cabecalho">
            <span class="fect-icone ui-icon ui-icon--heart" aria-hidden="true"></span>
            <div>
                ${visitante ? '<p class="fect-etiqueta">FECT</p>' : ''}
                <h2 id="tituloTermometro">Termômetro das emoções</h2>
                <p>Escolha uma amora e ajuste a intensidade de 1 a 5.</p>
            </div>
        </div>
        <div class="fect-grade">
            <div id="fectMostrador" class="fect-mostrador"></div>
            <div id="fectControles" class="fect-controles"></div>
        </div>`;
    const termometro = criarTermometroFect();
    card.querySelector('#fectMostrador').append(termometro);
    card.querySelector('#fectControles').append(
        document.getElementById('emocoes'),
        document.getElementById('motivoContainer'),
        document.getElementById('bloqueioHumora')
    );
    inicio.querySelector('header').after(card);

    const intensidade = document.getElementById('intensidadeEmocao');
    function atualizar() {
        // Leituras recuperadas do diário escolar trazem a data de expiração e apenas a emoção.
        const ultima = alunoAtual.historico.findLast(item => item.timestamp <= alunoAtual.ultimaEmocao)
            ?? alunoAtual.historico.at(-1);
        const emocao = emocaoSelecionada || ultima?.emocao;
        const nivel = emocaoSelecionada ? Number(intensidade.value) : ultima?.intensidade;
        atualizarTermometroFect(termometro, nivel, nomesEmocoes[emocao] || 'Escolha uma emoção', emocao);
    }
    card.addEventListener('click', event => {
        if (event.target.closest('.emocao')) atualizar();
    });
    intensidade.addEventListener('input', atualizar);
    atualizar();
    return atualizar;
}

function montarPainelFectProfessor() {
    const painel = document.getElementById('painelFect');
    const termometro = criarTermometroFect();
    painel.querySelector('.fect-mostrador').append(termometro);
    const barras = painel.querySelector('.fect-distribuicao');
    const linhas = new Map();
    for (const [emocao, nome] of Object.entries(nomesEmocoes)) {
        const linha = document.createElement('div');
        linha.className = 'fect-barra';
        const medalhao = criarImagemEmocao(emocao);
        const rotulo = document.createElement('span');
        rotulo.textContent = nome;
        const medidor = document.createElement('meter');
        medidor.min = 0;
        medidor.max = 100;
        medidor.value = 0;
        medidor.setAttribute('aria-label', `Percentual de registros de ${nome}`);
        const trilha = document.createElement('div');
        trilha.className = 'fect-barra-trilha';
        trilha.style.setProperty('--fect-cor-barra', coresDosGraficos[emocao]);
        trilha.append(medidor);
        const contagem = document.createElement('strong');
        contagem.textContent = '0';
        const proporcao = document.createElement('small');
        proporcao.textContent = '0%';
        proporcao.setAttribute('aria-hidden', 'true');
        linha.append(medalhao, rotulo, trilha, contagem, proporcao);
        barras.append(linha);
        linhas.set(emocao, { medidor, trilha, contagem, proporcao });
    }
    const status = painel.querySelector('.fect-atualizacao');
    const totalEl = painel.querySelector('#fectTotal');
    const legendaTotal = painel.querySelector('#fectLegendaTotal');
    let carregando = false;

    async function atualizar() {
        if (carregando || document.hidden) return;
        carregando = true;
        try {
            const resposta = await fetch('/professor/fect', { headers: api.getHeaders() });
            if (!resposta.ok) throw new Error(resposta.status);
            const contagens = await resposta.json();
            const total = contagens.reduce((soma, item) => soma + item.total, 0);
            const intensidade = contagens.reduce((soma, item) => soma + item.somaIntensidades, 0);
            const maior = Math.max(0, ...contagens.map(item => item.total));
            const lideres = contagens.filter(item => item.total === maior);
            const principal = lideres.length === 1 ? EMOCAO_REVERSE[lideres[0].emocao] : undefined;
            totalEl.textContent = total.toLocaleString('pt-BR');
            legendaTotal.textContent = total === 1 ? 'registro' : 'registros';
            atualizarTermometroFect(termometro, total ? intensidade / total : 0, 'Intensidade média', principal);
            for (const [emocao, linha] of linhas) {
                const quantidade = contagens.find(item => EMOCAO_REVERSE[item.emocao] === emocao)?.total ?? 0;
                const percentual = total ? quantidade * 100 / total : 0;
                linha.medidor.value = percentual;
                linha.medidor.title = `${fectDecimal.format(percentual)}%`;
                linha.trilha.style.setProperty('--fect-proporcao', `${percentual}%`);
                linha.proporcao.textContent = linha.medidor.title;
                linha.contagem.textContent = quantidade.toLocaleString('pt-BR');
            }
            status.textContent = total
                ? `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`
                : 'Aguardando o primeiro registro da feira';
        } catch {
            status.textContent = 'Atualização indisponível. Nova tentativa em instantes.';
        } finally {
            carregando = false;
        }
    }

    atualizar();
    const intervalo = setInterval(atualizar, 5000);
    document.addEventListener('visibilitychange', atualizar);
    window.addEventListener('pagehide', event => {
        if (!event.persisted) clearInterval(intervalo);
    });
}

function idRegistroFect() {
    // getRandomValues também funciona em HTTP na rede local.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return hex.replace(/^(........)(....)(....)(....)(............)$/, '$1-$2-$3-$4-$5');
}
