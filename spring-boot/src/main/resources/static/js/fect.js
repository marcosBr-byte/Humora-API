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

function atualizarTermometroFect(elemento, intensidade, rotulo, emocao, maximo = 5) {
    const nivel = maximo === 100 ? (intensidade ?? 0) * .88 : (intensidade == null ? 0 : 8 + (intensidade - 1) * 22);
    elemento.style.setProperty('--fect-nivel', `${nivel}%`);
    elemento.dataset.emocao = emocao || '';
    const valor = elemento.querySelector('.fect-valor');
    const escala = elemento.querySelectorAll('.fect-escala span');
    const porcentagem = maximo === 100;
    valor.firstChild.textContent = intensidade == null ? '— ' : fectDecimal.format(intensidade);
    valor.querySelector('small').textContent = porcentagem ? '%' : ' / 5';
    escala.forEach((marca, indice) => { marca.textContent = porcentagem ? 100 - indice * 25 : 5 - indice; });
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
                <p>${visitante ? 'Escolha uma amora e arraste no termômetro para ajustar de 1 a 5.' : 'Escolha uma amora e ajuste a intensidade de 1 a 5.'}</p>
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
    if (visitante) {
        intensidade.value = alunoAtual.historico.at(-1)?.intensidade ?? 1;
        intensidade.dispatchEvent(new Event('input'));
        habilitarAjusteTermometro(termometro, intensidade);
    }
    function atualizar() {
        // Leituras recuperadas do diário escolar trazem a data de expiração e apenas a emoção.
        const ultima = alunoAtual.historico.findLast(item => item.timestamp <= alunoAtual.ultimaEmocao)
            ?? alunoAtual.historico.at(-1);
        const emocao = emocaoSelecionada || ultima?.emocao;
        const nivel = visitante || emocaoSelecionada ? Number(intensidade.value) : ultima?.intensidade;
        atualizarTermometroFect(termometro, nivel, nomesEmocoes[emocao] || 'Escolha uma emoção', emocao);
    }
    card.addEventListener('click', event => {
        if (event.target.closest('.emocao')) atualizar();
    });
    intensidade.addEventListener('input', atualizar);
    atualizar();
    return atualizar;
}

function habilitarAjusteTermometro(termometro, intensidade) {
    const instrumento = termometro.querySelector('.fect-instrumento');
    const tubo = instrumento.querySelector('.fect-tubo');
    instrumento.classList.add('fect-instrumento-ajustavel');
    instrumento.removeAttribute('aria-hidden');
    instrumento.append(intensidade);
    intensidade.classList.add('fect-ajuste-vertical');
    intensidade.setAttribute('aria-orientation', 'vertical');

    function ajustar(evento) {
        const area = tubo.getBoundingClientRect();
        const posicao = (area.bottom - evento.clientY) / area.height;
        const nivel = Math.max(1, Math.min(5, Math.round(1 + (posicao - .08) / .22)));
        if (Number(intensidade.value) === nivel) return;
        intensidade.value = nivel;
        intensidade.dispatchEvent(new Event('input', { bubbles: true }));
    }

    instrumento.addEventListener('pointerdown', evento => {
        if (!evento.isPrimary || evento.button !== 0 || intensidade.disabled) return;
        instrumento.setPointerCapture(evento.pointerId);
        intensidade.focus({ preventScroll: true });
        ajustar(evento);
    });
    instrumento.addEventListener('pointermove', evento => {
        if (instrumento.hasPointerCapture(evento.pointerId)) ajustar(evento);
    });
}

function celebrarEmocaoFect(emocao) {
    if (!Object.hasOwn(nomesEmocoes, emocao) || document.hidden) return;
    document.querySelector('.fect-celebracao')?.remove();
    const camada = document.createElement('div');
    camada.className = 'fect-celebracao';
    camada.setAttribute('aria-hidden', 'true');
    const centro = document.createElement('div');
    centro.className = 'fect-celebracao-centro';
    centro.append(criarImagemEmocao(emocao));
    camada.append(centro);
    for (let i = 0; i < 25; i++) {
        const coluna = i % 5;
        const fileira = Math.floor(i / 5);
        const amora = criarImagemEmocao(emocao);
        amora.classList.add('fect-celebracao-amora');
        amora.style.setProperty('--chuva-x', `${3 + coluna * 19 + (fileira % 3) * 3}vw`);
        amora.style.setProperty('--chuva-espera', `-${120 + fileira * 435 + (coluna % 3) * 93}ms`);
        amora.style.setProperty('--chuva-desvio', `${i % 2 ? 30 : -24}px`);
        amora.style.setProperty('--chuva-rotacao', `${(i % 2 ? 1 : -1) * (24 + (i % 4) * 16)}deg`);
        amora.style.setProperty('--chuva-tamanho', `${26 + (i % 4) * 8}px`);
        camada.append(amora);
    }
    document.body.append(camada);
    setTimeout(() => camada.remove(), 2500);
}

function acompanharAmorasVisitante(foiEnviadoAqui) {
    let eventos;

    function conectar() {
        if (document.hidden || eventos) return;
        eventos = new EventSource('/fect/ao-vivo');
        eventos.onmessage = evento => {
            if (!foiEnviadoAqui(evento.lastEventId)) celebrarEmocaoFect(EMOCAO_REVERSE[evento.data]);
        };
    }

    function desconectar() {
        eventos?.close();
        eventos = null;
    }

    conectar();
    document.addEventListener('visibilitychange', () => document.hidden ? desconectar() : conectar());
    window.addEventListener('pagehide', desconectar);
    window.addEventListener('pageshow', conectar);
}

function montarPainelFectProfessor(encerrarSessao) {
    const painel = document.getElementById('painelFect');
    const grade = document.getElementById('fectDistribuicao');
    const termometros = new Map();
    for (const [emocao, nome] of Object.entries(nomesEmocoes)) {
        const cartao = document.createElement('article');
        cartao.className = 'fect-medida-feira';
        cartao.dataset.emocao = emocao;
        const titulo = document.createElement('h3');
        titulo.textContent = nome;
        const termometro = criarTermometroFect();
        atualizarTermometroFect(termometro, 0, '0 registros', emocao, 100);
        cartao.append(titulo, termometro);
        grade.append(cartao);
        termometros.set(emocao, termometro);
    }
    const status = painel.querySelector('.fect-atualizacao');
    let carregando = false;
    let novaLeitura = false;
    let fluxo;

    async function atualizar() {
        if (document.hidden) return;
        if (carregando) {
            novaLeitura = true;
            return;
        }
        carregando = true;
        try {
            const resposta = await fetch('/professor/fect', { headers: api.getHeaders() });
            if (resposta.status === 401 || resposta.status === 403) {
                encerrarSessao();
                return;
            }
            if (!resposta.ok) throw new Error(resposta.status);
            const contagens = await resposta.json();
            const total = contagens.reduce((soma, item) => soma + item.total, 0);
            const intensidade = contagens.reduce((soma, item) => soma + item.somaIntensidades, 0);
            document.getElementById('fectTotal').textContent = total.toLocaleString('pt-BR');
            document.getElementById('fectLegendaTotal').textContent = total === 1 ? 'registro' : 'registros';
            document.getElementById('fectMedia').textContent = total ? fectDecimal.format(intensidade / total) : '—';
            for (const [emocao, termometro] of termometros) {
                const contagem = contagens.find(item => EMOCAO_REVERSE[item.emocao] === emocao)?.total ?? 0;
                const rotulo = contagem === 1 ? '1 registro' : `${contagem.toLocaleString('pt-BR')} registros`;
                atualizarTermometroFect(termometro, total ? contagem / total * 100 : 0, rotulo, emocao, 100);
            }
            status.textContent = total ? 'Acompanhando registros da feira' : 'Aguardando o primeiro registro da feira';
        } catch {
            status.textContent = 'Conexão interrompida. Tentando atualizar…';
        } finally {
            carregando = false;
            if (novaLeitura) {
                novaLeitura = false;
                atualizar();
            }
        }
    }

    function receber(emocao) {
        if (!Object.hasOwn(nomesEmocoes, emocao)) return;
        celebrarEmocaoFect(emocao);
        const cartao = termometros.get(emocao).parentElement;
        cartao.classList.remove('fect-medida-chegou');
        requestAnimationFrame(() => cartao.classList.add('fect-medida-chegou'));
        atualizar();
    }

    async function acompanhar() {
        if (fluxo || document.hidden) return;
        const controle = new AbortController();
        fluxo = controle;
        try {
            const resposta = await fetch('/professor/fect/ao-vivo', {
                headers: { ...api.getHeaders(), Accept: 'text/event-stream' },
                signal: controle.signal
            });
            if (resposta.status === 401 || resposta.status === 403) {
                controle.abort();
                encerrarSessao();
                return;
            }
            if (!resposta.ok || !resposta.body) throw new Error(resposta.status);
            atualizar();
            const leitor = resposta.body.getReader();
            const decoder = new TextDecoder();
            let resto = '';
            while (!controle.signal.aborted) {
                const { value, done } = await leitor.read();
                if (done) break;
                const linhas = (resto + decoder.decode(value, { stream: true })).split('\n');
                resto = linhas.pop();
                for (const linha of linhas) {
                    if (linha.startsWith('data:')) receber(EMOCAO_REVERSE[linha.slice(5).trim()]);
                }
            }
        } catch {
            if (!controle.signal.aborted) atualizar();
        } finally {
            if (fluxo === controle) fluxo = null;
            if (!controle.signal.aborted) setTimeout(acompanhar, 1500);
        }
    }

    atualizar();
    acompanhar();
    const intervalo = setInterval(atualizar, 15000);
    function pausarFluxo() {
        const atual = fluxo;
        fluxo = null;
        atual?.abort();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pausarFluxo();
        else {
            atualizar();
            acompanhar();
        }
    });
    window.addEventListener('pagehide', evento => {
        pausarFluxo();
        if (!evento.persisted) clearInterval(intervalo);
    });
    window.addEventListener('pageshow', () => { atualizar(); acompanhar(); });
}

function idRegistroFect() {
    // getRandomValues também funciona em HTTP na rede local.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return hex.replace(/^(........)(....)(....)(....)(............)$/, '$1-$2-$3-$4-$5');
}
