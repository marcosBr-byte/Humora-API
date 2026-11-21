const coresDosGraficos = Object.freeze({
    feliz: '#ce8b28', triste: '#5185cd', cansado: '#9273c0',
    calmo: '#32977e', ansioso: '#c97549', irritado: '#c75d76'
});
const formatarNumeroGrafico = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function contarEmocoes(tipos) {
    const contagem = Object.fromEntries(Object.keys(nomesEmocoes).map(tipo => [tipo, 0]));
    for (const tipo of tipos) {
        if (Object.hasOwn(contagem, tipo)) contagem[tipo]++;
    }
    return contagem;
}

function linhasDasEmocoes(contagem) {
    return Object.entries(nomesEmocoes)
        .map(([tipo, rotulo]) => ({ rotulo, valor: contagem[tipo], cor: coresDosGraficos[tipo] }));
}

function exibirDadosGrafico(canvas, linhas, unidade, abrir) {
    const container = canvas.parentElement;
    let detalhes = container.nextElementSibling;
    if (!detalhes?.classList.contains('grafico-dados')) {
        detalhes = document.createElement('details');
        detalhes.className = 'grafico-dados';
        detalhes.open = abrir;
        const sumario = document.createElement('summary');
        sumario.textContent = 'Ver dados do gráfico';
        detalhes.append(sumario, document.createElement('dl'));
        container.after(detalhes);
    }
    detalhes.hidden = linhas.length === 0;
    detalhes.querySelector('dl').replaceChildren(...linhas.flatMap(({ rotulo, valor, detalhes, cor }) => {
        const termo = document.createElement('dt');
        const dado = document.createElement('dd');
        termo.textContent = detalhes ? `${rotulo} · ${detalhes}` : rotulo;
        if (cor) {
            termo.className = 'grafico-rotulo-cor';
            termo.style.setProperty('--grafico-cor', cor);
        }
        dado.textContent = unidade(valor);
        return [termo, dado];
    }));
}

function renderizarGrafico(id, linhas, { tipo, unidade, vazio, dataset, opcoes, plugins = [] }) {
    const canvas = document.getElementById(id);
    const container = canvas.parentElement;
    const graficoAtual = Chart.getChart(canvas);
    let mensagem = container.querySelector('.grafico-vazio');
    if (!mensagem) {
        mensagem = document.createElement('p');
        mensagem.className = 'grafico-vazio';
        container.append(mensagem);
    }
    const semDados = !linhas.some(linha => linha.valor > 0);
    container.classList.toggle('grafico-sem-dados', semDados);
    mensagem.textContent = semDados ? vazio : '';
    mensagem.hidden = !semDados;
    canvas.hidden = semDados;
    exibirDadosGrafico(canvas, semDados ? [] : linhas, unidade, tipo === 'doughnut');
    if (semDados) {
        graficoAtual?.destroy();
        return;
    }

    const data = {
        labels: linhas.map(linha => linha.rotulo),
        datasets: [{ data: linhas.map(linha => linha.valor), ...dataset }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 6 },
        ...opcoes,
        plugins: {
            legend: { display: false },
            tooltip: {
                padding: 11,
                displayColors: false,
                callbacks: {
                    label(contexto) {
                        const linha = linhas[contexto.dataIndex];
                        return linha.detalhes ? `${linha.detalhes} · ${unidade(linha.valor)}` : unidade(linha.valor);
                    }
                }
            }
        }
    };
    if (graficoAtual) {
        graficoAtual.data = data;
        graficoAtual.options = options;
        graficoAtual.update();
    } else {
        new Chart(canvas, { type: tipo, data, options, plugins });
    }
}

const corTextoGrafico = () => corTemaHumora('--fect-secundario');
const corGradeGrafico = () => corTemaHumora('--fect-borda');
const corPrincipalGrafico = () => corTemaHumora('--fect-roxo');

function graficoDeBarras(id, linhas, unidade, vazio) {
    renderizarGrafico(id, linhas, {
        tipo: 'bar', unidade, vazio,
        dataset: {
            backgroundColor: contexto => linhas[contexto.dataIndex]?.cor ?? corPrincipalGrafico(),
            borderRadius: 8, borderSkipped: false, maxBarThickness: 18
        },
        opcoes: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, grid: { color: corGradeGrafico }, ticks: { precision: 0, color: corTextoGrafico } },
                y: { grid: { display: false }, ticks: { color: corTextoGrafico, autoSkip: false } }
            }
        }
    });
}

function graficoDeDistribuicao(id, linhas, vazio) {
    const total = linhas.reduce((soma, linha) => soma + linha.valor, 0);
    const unidade = valor => `${valor} · ${formatarNumeroGrafico.format(valor * 100 / total)}%`;
    renderizarGrafico(id, linhas, {
        tipo: 'doughnut', unidade, vazio,
        dataset: {
            backgroundColor: linhas.map(linha => linha.cor),
            borderColor: () => corTemaHumora('--fect-superficie'),
            borderWidth: 2, hoverOffset: 5
        },
        opcoes: { cutout: '73%' },
        plugins: [{
            id: 'totalDaDistribuicao',
            afterDatasetsDraw(grafico) {
                const { ctx, chartArea } = grafico;
                const atual = grafico.data.datasets[0].data.reduce((soma, valor) => soma + valor, 0);
                const x = (chartArea.left + chartArea.right) / 2;
                const y = (chartArea.top + chartArea.bottom) / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = corTemaHumora('--fect-texto');
                ctx.font = '700 28px system-ui';
                ctx.fillText(formatarNumeroGrafico.format(atual), x, y - 6);
                ctx.fillStyle = corTextoGrafico();
                ctx.font = '500 12px system-ui';
                ctx.fillText('Alunos com registro', x, y + 16);
                ctx.restore();
            }
        }]
    });
}
