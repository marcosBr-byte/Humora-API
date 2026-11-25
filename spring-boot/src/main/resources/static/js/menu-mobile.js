const botaoMenu = document.getElementById('menuToggleMobile');
const menuLateral = document.getElementById(botaoMenu.getAttribute('aria-controls'));
const fundoMenu = document.getElementById('menuOverlayMobile');
const telaComMenuRecolhido = matchMedia('(width < 1025px)');

function mostrarMenu(aberto) {
    document.documentElement.classList.toggle('menu-mobile-aberto', aberto);
    menuLateral.classList.toggle('sidebar-aberta', aberto);
    fundoMenu.classList.toggle('ativo', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

botaoMenu.addEventListener('click', () => mostrarMenu(!menuLateral.classList.contains('sidebar-aberta')));
function fecharMenuERestaurarFoco() {
    mostrarMenu(false);
    botaoMenu.focus({ preventScroll: true });
}

fundoMenu.addEventListener('click', fecharMenuERestaurarFoco);

menuLateral.addEventListener('click', evento => {
    if (menuLateral.classList.contains('sidebar-aberta') && evento.target.closest('.menu-item')) {
        fecharMenuERestaurarFoco();
    }
}, { capture: true });

document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && menuLateral.classList.contains('sidebar-aberta')) {
        fecharMenuERestaurarFoco();
    }
});

telaComMenuRecolhido.addEventListener('change', evento => {
    if (!evento.matches) mostrarMenu(false);
});
