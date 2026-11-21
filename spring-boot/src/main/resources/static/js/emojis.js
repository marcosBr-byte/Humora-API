const emocoesDaEsteira = Object.keys(nomesEmocoes);
const modeloFileiraEmojis = document.getElementById('modeloFileiraEmojis');

function montarFileiraEmojis(fileira) {
    const indice = Number(fileira.dataset.emojiFileira);
    const esteira = modeloFileiraEmojis.content.firstElementChild.cloneNode(true);
    esteira.dataset.fileira = String(indice);

    const grupo = esteira.querySelector('[data-grupo-emojis]');
    const modeloEmocao = grupo.querySelector('[data-modelo-emocao]');
    modeloEmocao.remove();
    for (let posicao = 0; posicao < emocoesDaEsteira.length * 2; posicao++) {
        const celula = modeloEmocao.content.firstElementChild.cloneNode(true);
        const medalhao = celula.querySelector('[data-medalhao]');
        const emocao = emocoesDaEsteira[(posicao + indice * 2) % emocoesDaEsteira.length];
        medalhao.append(criarImagemEmocao(emocao));
        grupo.append(celula);
    }

    esteira.append(grupo.cloneNode(true));
    fileira.append(esteira);
}

document.querySelectorAll('[data-emoji-fileira]').forEach(montarFileiraEmojis);
