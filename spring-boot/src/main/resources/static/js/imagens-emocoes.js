const nomesEmocoes = Object.freeze({
    feliz: "Feliz",
    triste: "Triste",
    cansado: "Cansado",
    calmo: "Calmo",
    ansioso: "Ansioso",
    irritado: "Irritado"
});

function caminhoImagemEmocao(tipo) {
    return `imagens/emocoes/${tipo}.webp`;
}

function criarImagemEmocao(tipo, alt = "") {
    const imagem = document.createElement("img");
    imagem.className = "imagem-emocao";
    imagem.src = caminhoImagemEmocao(tipo);
    imagem.alt = alt;
    return imagem;
}

function exibirCartaMemoria(carta, figura) {
    if (Object.hasOwn(nomesEmocoes, figura)) {
        carta.replaceChildren(criarImagemEmocao(figura, nomesEmocoes[figura]));
    } else {
        carta.textContent = figura;
    }
}
