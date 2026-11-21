const botaoMenu = document.getElementById('menuToggleMobile');
const menuLateral = document.getElementById(botaoMenu.getAttribute('aria-controls'));
const fundoMenu = document.getElementById('menuOverlayMobile');

function mostrarMenu(aberto) {
    menuLateral.classList.toggle('sidebar-aberta', aberto);
    fundoMenu.classList.toggle('ativo', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

botaoMenu.addEventListener('click', () => mostrarMenu(!menuLateral.classList.contains('sidebar-aberta')));
fundoMenu.addEventListener('click', () => mostrarMenu(false));

menuLateral.querySelector('.menu-sidebar').addEventListener('click', event => {
    if (event.target.closest('.menu-item')) mostrarMenu(false);
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuLateral.classList.contains('sidebar-aberta')) {
        mostrarMenu(false);
        botaoMenu.focus();
    }
});

matchMedia('(max-width: 1024px)').addEventListener('change', evento => {
    if (!evento.matches) mostrarMenu(false);
});
