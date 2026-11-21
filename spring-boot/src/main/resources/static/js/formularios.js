function botaoDoFormulario(acao) {
    return document.querySelector(`button[onclick="${acao}()"]`);
}

function feedbackFormulario(mensagem, erro = false) {
    const aviso = document.getElementById('feedbackFormulario');
    aviso.dataset.erro = String(erro);
    aviso.textContent = mensagem;
    aviso.hidden = !mensagem;
}

async function executarEnvioFormulario(acao, enviar) {
    const botao = botaoDoFormulario(acao);
    if (botao.disabled) return;

    const painel = botao.closest('.login-card, .right');
    const campos = painel.querySelectorAll('input[required], select[required]');
    if ([...campos].some(campo => !campo.reportValidity())) return;

    feedbackFormulario('');
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    const indicador = document.getElementById('modeloIndicadorFormulario').content.firstElementChild.cloneNode(true);
    botao.prepend(indicador);

    try {
        await enviar();
    } catch (erro) {
        console.error('Erro no envio do formulário:', erro);
        feedbackFormulario('Não foi possível conectar agora. Tente novamente.', true);
    } finally {
        indicador.remove();
        botao.disabled = false;
        botao.removeAttribute('aria-busy');
    }
}

async function erroDoFormulario(resposta, mensagemPadrao) {
    const tipo = resposta.headers.get('content-type') || '';
    if (!tipo.startsWith('text/plain')) return mensagemPadrao;
    return (await resposta.text()).trim() || mensagemPadrao;
}

function habilitarEnvioPorTeclado(acao) {
    const botao = botaoDoFormulario(acao);
    const painel = botao.closest('.login-card, .right');
    painel.addEventListener('keydown', evento => {
        if (evento.key === 'Enter' && evento.target instanceof HTMLInputElement && !evento.isComposing) {
            evento.preventDefault();
            botao.click();
        }
    });
}

function concluirCadastro() {
    sessionStorage.setItem('humoraCadastroConcluido', 'true');
    window.location.href = 'login.html';
}
