const tiposAmorasDecorativas = ['feliz', 'calmo', 'ansioso', 'triste', 'cansado', 'irritado'];

function decorarComAmoras(container, tipos) {
    container.replaceChildren(...tipos.map(tipo => {
        const imagem = document.createElement('img');
        imagem.src = `imagens/emocoes/${tipo}.webp`;
        imagem.alt = '';
        return imagem;
    }));
}

document.querySelectorAll('.fect-amoras').forEach(palco => decorarComAmoras(palco, tiposAmorasDecorativas));

document.querySelectorAll('[data-humora-painel] .topo-conteudo').forEach((cabecalho, indice) => {
    const detalhe = document.createElement('div');
    detalhe.className = 'amoras-secao';
    detalhe.setAttribute('aria-hidden', 'true');
    decorarComAmoras(detalhe, tiposAmorasDecorativas.slice(indice % 3, indice % 3 + 2));
    cabecalho.append(detalhe);
});
