const orientacaoRespiracao = document.getElementById('faseRespiracao');
const palcoRespiracao = document.getElementById('palcoRespiracao');
const tempoRespiracao = document.getElementById('tempoRespiracao');
const progressoRespiracao = document.getElementById('progressoRespiracao');
const ciclosRespiracao = document.getElementById('ciclosRespiracao');
const acaoRespiracao = document.getElementById('acaoRespiracao');
const reiniciarRespiracao = document.getElementById('reiniciarRespiracao');
const duracaoCiclo = 10000;
const duracaoInspiracao = 4000;
let acumuladoRespiracao = 0;
let inicioRespiracao = null;
let quadroRespiracao;

function exibirRespiracao(decorrido, mensagem) {
    const ciclos = Number(ciclosRespiracao.value);
    const total = ciclos * duracaoCiclo;
    const ciclo = Math.min(ciclos, Math.floor(decorrido / duracaoCiclo) + 1);
    const segundos = Math.ceil((total - decorrido) / 1000);
    const fase = decorrido % duracaoCiclo;
    const inspira = fase < duracaoInspiracao;
    const texto = mensagem || (inspira ? 'Inspire suavemente' : 'Solte o ar devagar');
    if (orientacaoRespiracao.textContent !== texto) orientacaoRespiracao.textContent = texto;
    const tempo = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')} · ciclo ${ciclo} de ${ciclos}`;
    if (tempoRespiracao.textContent !== tempo) tempoRespiracao.textContent = tempo;
    progressoRespiracao.max = total / 1000;
    progressoRespiracao.value = decorrido / 1000;
    const expansao = inspira ? fase / duracaoInspiracao : (duracaoCiclo - fase) / (duracaoCiclo - duracaoInspiracao);
    palcoRespiracao.style.setProperty('--respiracao-escala', .73 + .27 * (1 - Math.cos(Math.PI * expansao)) / 2);
}

function encerrarRespiracao() {
    inicioRespiracao = null;
    cancelAnimationFrame(quadroRespiracao);
    ciclosRespiracao.disabled = false;
}

function quadroDaRespiracao(agora) {
    if (inicioRespiracao === null) return;
    const total = Number(ciclosRespiracao.value) * duracaoCiclo;
    const decorrido = acumuladoRespiracao + agora - inicioRespiracao;
    if (decorrido >= total) {
        acumuladoRespiracao = total;
        encerrarRespiracao();
        exibirRespiracao(total, 'Sessão concluída.');
        acaoRespiracao.textContent = 'Começar de novo';
        desbloquearConquista('respirou');
        return;
    }
    exibirRespiracao(decorrido);
    quadroRespiracao = requestAnimationFrame(quadroDaRespiracao);
}

function pausarRespiracao() {
    if (inicioRespiracao === null) return;
    const total = Number(ciclosRespiracao.value) * duracaoCiclo;
    acumuladoRespiracao = Math.min(total - 1, acumuladoRespiracao + performance.now() - inicioRespiracao);
    inicioRespiracao = null;
    cancelAnimationFrame(quadroRespiracao);
    exibirRespiracao(acumuladoRespiracao, 'Sessão pausada');
    acaoRespiracao.textContent = 'Retomar';
}

function zerarRespiracao() {
    encerrarRespiracao();
    acumuladoRespiracao = 0;
    exibirRespiracao(0, 'Quando estiver pronto, comece.');
    acaoRespiracao.textContent = 'Começar';
    reiniciarRespiracao.disabled = true;
}

acaoRespiracao.addEventListener('click', () => {
    if (inicioRespiracao !== null) {
        pausarRespiracao();
        return;
    }
    if (acumuladoRespiracao >= Number(ciclosRespiracao.value) * duracaoCiclo) zerarRespiracao();
    inicioRespiracao = performance.now();
    ciclosRespiracao.disabled = true;
    reiniciarRespiracao.disabled = false;
    acaoRespiracao.textContent = 'Pausar';
    quadroDaRespiracao(inicioRespiracao);
});
reiniciarRespiracao.addEventListener('click', zerarRespiracao);
ciclosRespiracao.addEventListener('change', zerarRespiracao);
document.addEventListener('visibilitychange', () => { if (document.hidden) pausarRespiracao(); });
zerarRespiracao();
